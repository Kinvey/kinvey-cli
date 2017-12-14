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
const { Errors, DomainTypes, LogLevel, FlexConfigLevel, FlexOptionsNames, FlexProjectMaxSize, JobStatus } = require('../Constants');
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
      serviceName: 'Service name is not available.',
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
        this.cliManager.log(LogLevel.ERROR, 'Failed to save job ID to project settings.');
      } else {
        this.cliManager.log(LogLevel.INFO, 'Saved job ID to project settings.');
      }

      done();
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

    if (cmd === 'flex logs' || cmd === 'flex recycle' || cmd === 'flex status') {
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
   * @param [done]
   */
  init(options, done) {
    async.series([
      (next) => {
        super.processAuthOptions(options, next);
      },
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
      this.cliManager.processCommandResult(err, null, done);
    });
  }

  deploy(options, done) {
    const dir = this.cliManager.config.paths.package;
    let version;
    let jobId;
    async.series([
      (next) => {
        super.processAuthOptions(options, next);
      },
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
          this.cliManager.log(LogLevel.INFO, 'Deploy initiated, received job %s', chalk.cyan(jobId));
          next(null, jobId);
        });
      },
      (next) => {
        this._saveJobId(jobId, next);
      }
    ], (err) => {
      this.cliManager.processCommandResult(err, jobId, done);
    });
  }

  job(options, done) {
    async.series([
      (next) => {
        super.processAuthOptions(options, next);
      },
      (next) => {
        this.flexService.jobStatus(this._metadata.lastJobId, this._metadata.schemaVersion, (err, data) => {
          if (err) {
            return next(err);
          }

          let suffix = '';
          if (data.status !== JobStatus.COMPLETE && data.progress) {
            suffix = ` - ${data.progress}`;
          }

          this.cliManager.log(LogLevel.INFO, 'Job status: %s%s', chalk.cyan(data.status), suffix);
          next(null, data.status);
        });
      }
    ], (err, results) => {
      const result = results.pop();
      this.cliManager.processCommandResult(err, result, done);
    });
  }

  status(options, done) {
    async.series([
      (next) => {
        super.processAuthOptions(options, next);
      },
      (next) => {
        this.flexService.serviceStatus(this._metadata, next);
      }
    ], (err, results) => {
      const result = results.pop();
      this.cliManager.processCommandResult(err, result, done);
    });
  }

  // TODO: check the id stuff
  list(options, done) {
    async.series([
      (next) => {
        super.processAuthOptions(options, next);
      },
      (next) => {
        const isDomainApp = this._metadata.domain === DomainTypes.APP;
        const domainEntity = {
          id: this._metadata.domainEntityId,
          schemaVersion: this._metadata.schemaVersion
        };

        this.flexService.getServices(isDomainApp, domainEntity, (err, services) => {
          if (err) {
            return next(err);
          }

          this.cliManager.log(LogLevel.INFO, 'You have %s Kinvey service connectors:', chalk.cyan(services.length));

          services.forEach((service) => {
            const bullet = service.id === this._metadata.serviceId ? chalk.green('* ') : '';
            this.cliManager.log(LogLevel.INFO, '%s%s', bullet, chalk.cyan(service.name));
          });

          this.cliManager.log(LogLevel.INFO, 'The service used in this project is marked with *');

          next(null, services);
        });
      }
    ], (err, results) => {
      const result = results.pop();
      this.cliManager.processCommandResult(err, result, done);
    });
  }

  logs(options, done) {
    async.series([
      (next) => {
        super.processAuthOptions(options, next);
      },
      (next) => {
        // FIXME: Stop handling them before #BACK-2775 is merged into master
        // Handle deprecated logs command params
        if (options._.includes(FlexOptionsNames.FROM) || options._.includes(FlexOptionsNames.TO)) {
          return next(new KinveyError('DeprecationError', `Version 1.x ${chalk.whiteBright('[from]')} and ${chalk.whiteBright('[to]')} params have been converted to options. Use ${chalk.blueBright('--from')} and ${chalk.blueBright('--to')} to filter by timestamp instead.`));
        }

        this.flexService.validateLogsOptions(options, next);
      },
      (next) => {
        this.flexService.getServiceLogs(options, this._metadata.serviceId, this._metadata.schemaVersion, (err, logs) => {
          if (err) {
            return next(err);
          }

          this.flexService.printServiceLogs(this._metadata, logs);
          next(null, logs);
        });
      },
    ], (err, results) => {
      const result = results.pop();
      this.cliManager.processCommandResult(err, result, done);
    });
  }

  recycle(options, done) {
    let jobId;
    async.series([
      (next) => {
        super.processAuthOptions(options, next);
      },
      (next) => {
        this.flexService.execRecycle(this._metadata.schemaVersion, this._metadata.serviceId, (err, recycleJobId) => {
          if (err) {
            return next(err);
          }

          jobId = recycleJobId;
          this.cliManager.log(LogLevel.INFO, 'Recycle initiated, received job %s', chalk.cyan(jobId));
          next(null, jobId);
        });
      },
      (next) => {
        this._saveJobId(jobId, next);
      }
    ], (err) => {
      this.cliManager.processCommandResult(err, jobId, done);
    });
  }

  deleteProjectSetup(done) {
    const err = this._ensureFlexSetup();
    if (err && err.name === Errors.ProjectRestoreError) {
      return this.cliManager.processCommandResult(err, null, done);
    }

    // nothing to delete
    if (err && err.name === Errors.ProjectNotConfigured) {
      this.cliManager.log(LogLevel.INFO, 'Project data cleared. Run %s to get started.', chalk.green('kinvey flex init'));
      return this.cliManager.processCommandResult(null, null, done);
    }

    if (err) {
      return this.cliManager.processCommandResult(err, null, done);
    }

    this.projectSetup.clearFlexNamespace();
    this.projectSetup.save((err) => {
      if (err) {
        this.cliManager.log(LogLevel.ERROR, 'Failed to clear project settings.');
      } else {
        this.cliManager.log(LogLevel.INFO, 'Project settings cleared. Run %s to get started.', chalk.green('kinvey flex init'));
      }

      this.cliManager.processCommandResult(err, null, done);
    });
  }
}

module.exports = FlexController;
