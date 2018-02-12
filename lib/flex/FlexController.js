/**
 * Copyright (c) 2017, Kinvey, Inc. All rights reserved.
 *
 * This software is licensed to you under the Kinvey terms of service located at
 * http://www.kinvey.com/terms-of-use. By downloading, accessing and/or using this
 * software, you hereby accept such terms of service  (and any agreement referenced
 * therein) and agree that you have read, understand and agree to be bound by such
 * terms of service and are of legal age to agree to such terms with Kinvey.
 *
 * This software contains valuable confidential and proprietary information of
 * KINVEY, INC and is subject to applicable licensing agreements.
 * Unauthorized reproduction, transmission or distribution of this file and its
 * contents is a violation of applicable laws.
 */

const async = require('async');
const chalk = require('chalk');
const merge = require('lodash.merge');

const BaseController = require('../BaseController');
const ProjectSetup = require('../ProjectSetup');
const { Errors, EntityType, DomainTypes, LogLevel, OperationType, FlexConfigLevel, FlexOptionsNames, FlexProjectMaxSize, JobStatus } = require('../Constants');
const CommandResult = require('../CommandResult');
const KinveyError = require('../KinveyError');
const { getCommandNameFromOptions, isNullOrUndefined } = require('../Utils');

/**
 * Handles flex-related logic.
 */
class FlexController extends BaseController {
  /**
   * Creates an instance.
   * @param {Object} options
   * @param {Object} options.cliManager
   * @param {Object} options.flexService
   */
  constructor(options) {
    super(options);
    this.flexService = options.flexService;
    this.projectSetup = new ProjectSetup(this.cliManager.config.paths.project);
    this._metadata = {
      serviceName: null,
      schemaVersion: this.cliManager.config.defaultSchemaVersion
    };
  }

  _ensureFlexSetup(configLevel) {
    const err = this.projectSetup.load();
    if (err) {
      return new KinveyError(Errors.ProjectRestoreError);
    }

    if (!this.projectSetup.isFlexConfigured(configLevel)) {
      return new KinveyError(Errors.ProjectNotConfigured);
    }
  }

  _saveJobId(id, done) {
    this.projectSetup.setJobId(id);
    this.projectSetup.save((err) => {
      if (err) {
        this.cliManager.log(LogLevel.WARN, `Failed to save job ID to project settings. ${err}`);
      } else {
        this.cliManager.log(LogLevel.DEBUG, 'Saved job ID to project settings.');
      }

      done(err);
    });
  }

  /**
   * Based on the command and the options set from user, decides whether the project setup is required or not. Returns true,
   * if it isn't required or if it is loaded successfully. Throws if loading fails.
   * @param options
   * @returns {boolean}
   */
  preProcessOptions(options) {
    const cmd = getCommandNameFromOptions(options);
    const projectSetupIsNotRequired = cmd === 'flex init' || cmd === 'flex delete';
    if (projectSetupIsNotRequired) {
      return true;
    }

    if (cmd === 'flex logs' || cmd === 'flex recycle' || cmd === 'flex status' || cmd === 'flex deploy') {
      if (!isNullOrUndefined(options[FlexOptionsNames.SERVICE_ID])) {
        this._metadata.serviceId = options[FlexOptionsNames.SERVICE_ID];
        return true;
      }
    }

    if (cmd === 'flex list') {
      const domainType = options[FlexOptionsNames.DOMAIN_TYPE];
      const domainEntityId = options[FlexOptionsNames.DOMAIN_ID];
      if (!isNullOrUndefined(domainType) && !isNullOrUndefined(domainEntityId)) {
        if (domainType !== DomainTypes.APP && domainType !== DomainTypes.ORG) {
          throw new Error(`Domain must be either '${DomainTypes.APP}' or '${DomainTypes.ORG}'.`);
        }

        this._metadata.domain = options[FlexOptionsNames.DOMAIN_TYPE];
        this._metadata.domainEntityId = options[FlexOptionsNames.DOMAIN_ID];
        return true;
      }
    }

    let flexConfigLevel;
    const isCmdJobStatus = cmd === 'flex job';
    if (isCmdJobStatus) {
      flexConfigLevel = FlexConfigLevel.JOB_ONLY;
      const jobId = options[FlexOptionsNames.JOB_ID];
      if (!isNullOrUndefined(jobId)) {
        this._metadata.lastJobId = jobId;
        return true;
      }
    }

    const err = this._ensureFlexSetup(flexConfigLevel);
    if (err) {
      if (isCmdJobStatus) {
        throw new KinveyError(Errors.NoJobStored);
      }

      throw err;
    } else {
      merge(this._metadata, this.projectSetup.getFlexNamespace());
    }

    return true;
  }

  /**
   * Handles the 'flex init' command.
   * @param {Object} options
   * @param done
   */
  init(options, done) {
    async.series([
      (next) => {
        this.flexService.getInitInput((err, input) => {
          if (err) {
            return next(err);
          }

          this.projectSetup.setFlexNamespace(input);
          next();
        });
      },
      (next) => {
        this.projectSetup.save(next);
      }
    ], (err) => {
      if (err) {
        return done(err);
      }

      const cmdResult = new CommandResult()
        .setBasicMsg(OperationType.SAVE, EntityType.CONFIGURATION);
      done(null, cmdResult);
    });
  }

  deploy(options, done) {
    const dir = this.cliManager.config.paths.package;
    let version;
    let jobId;
    async.series([
      (next) => {
        this.flexService.validateProject(dir, (err, pkgVersion) => {
          if (err) {
            return next(err);
          }

          version = pkgVersion;
          next();
        });
      },
      (next) => {
        const serviceId = this._metadata.serviceId;
        const schema = this._metadata.schemaVersion;
        const artifacts = this.cliManager.config.artifacts;
        const uploadTimeout = this.cliManager.config.flexProjectUploadTimeout;
        this.flexService.deployProject(dir, serviceId, version, schema, uploadTimeout, FlexProjectMaxSize, artifacts, (err, deployJobId) => {
          if (err) {
            return next(err);
          }

          jobId = deployJobId;
          next(null, jobId);
        });
      },
      (next) => {
        this._saveJobId(jobId, () => {
          // disregard error as it's not essential to command's main purpose
          next();
        });
      }
    ], (err) => {
      if (err) {
        return done(err);
      }

      const userFriendlyMsg = `Deploy initiated. Job: ${jobId}`;
      const cmdResult = new CommandResult()
        .setRawData({ id: jobId })
        .setCustomMsg(userFriendlyMsg);
      done(null, cmdResult);
    });
  }

  job(options, done) {
    this.flexService.jobStatus(this._metadata.lastJobId, this._metadata.schemaVersion, (err, result) => {
      if (err) {
        return done(err);
      }

      let suffix = '';
      if (result.status !== JobStatus.COMPLETE && result.progress) {
        suffix = ` - ${result.progress}`;
      }

      const userFriendlyMsg = `Job status: ${chalk.cyan(result.status)}${suffix}`;
      const cmdResult = new CommandResult()
        .setRawData(result)
        .setCustomMsg(userFriendlyMsg);
      done(null, cmdResult);
    });
  }

  status(options, done) {
    this.flexService.getServiceStatus(this._metadata, (err, result) => {
      if (err) {
        return done(err);
      }

      const tableData = this.flexService.getTableDataFromStatusData(result, this._metadata);
      const cmdResult = new CommandResult()
        .setRawData(result)
        .setTableData(tableData);
      done(null, cmdResult);
    });
  }

  list(options, done) {
    const isDomainApp = this._metadata.domain === DomainTypes.APP;
    const domainEntity = {
      id: this._metadata.domainEntityId,
      schemaVersion: this._metadata.schemaVersion
    };

    this.flexService.getServices(isDomainApp, domainEntity, (err, services) => {
      if (err) {
        return done(err);
      }

      const result = [];
      services.forEach((service) => {
        result.push({
          id: service.id,
          name: service.name
        });
      });

      done(null, new CommandResult().setRawData(result));
    });
  }

  logs(options, done) {
    async.series([
      (next) => {
        this.flexService.validateLogsOptions(options, next);
      },
      (next) => {
        this.flexService.getServiceLogs(options, this._metadata.serviceId, this._metadata.schemaVersion, next);
      },
    ], (err, results) => {
      if (err) {
        return done(err);
      }

      const result = results.pop();
      const tableData = this.flexService.getTableDataFromLogs(result);
      const cmdResult = new CommandResult()
        .setRawData(result)
        .setTableData(tableData);
      done(null, cmdResult);
    });
  }

  recycle(options, done) {
    let jobId;
    async.series([
      (next) => {
        this.flexService.execRecycle(this._metadata.schemaVersion, this._metadata.serviceId, (err, recycleJobId) => {
          if (err) {
            return next(err);
          }

          jobId = recycleJobId;
          next(null, jobId);
        });
      },
      (next) => {
        this._saveJobId(jobId, () => {
          next();
        });
      }
    ], (err) => {
      if (err) {
        return done(err);
      }

      const userFriendlyMsg = `Recycle initiated. Job: ${jobId}`;
      const cmdResult = new CommandResult()
        .setRawData({ id: jobId })
        .setCustomMsg(userFriendlyMsg);
      done(null, cmdResult);
    });
  }

  deleteProjectSetup(options, done) {
    const err = this._ensureFlexSetup();
    if (err && err.name !== Errors.ProjectNotConfigured.NAME) {
      return done(err);
    }

    this.projectSetup.clearFlexNamespace();
    this.projectSetup.save((err) => {
      if (err) {
        return done(err);
      }

      const userFriendlyMsg = `Project data cleared. Run ${chalk.green('kinvey flex init')} to get started.`;
      const cmdResult = new CommandResult()
        .setCustomMsg(userFriendlyMsg);
      done(null, cmdResult);
    });
  }
}

module.exports = FlexController;
