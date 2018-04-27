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

const BaseController = require('../BaseController');
const ProjectSetup = require('../ProjectSetup');
const { AppOptionsName, Command, CommonOptionsNames, Errors, EntityType, DomainTypes, LogLevel, OperationType, OrgOptionsName, PromptTypes, FlexOptionsNames, FlexProjectMaxSize, JobStatus } = require('../Constants');
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
    this.applicationsService = options.applicationsService;
    this.organizationsService = options.organizationsService;
    this.projectSetup = new ProjectSetup(this.cliManager.config.paths.project);
    this._metadata = {
      serviceName: null,
      schemaVersion: this.cliManager.config.defaultSchemaVersion
    };
  }

  _saveJobId(key, id, done) {
    this.projectSetup.setJobId(key, id);
    this.projectSetup.save((err) => {
      if (err) {
        this.cliManager.log(LogLevel.WARN, `Failed to save job ID to project settings. ${err}`);
      } else {
        this.cliManager.log(LogLevel.DEBUG, 'Saved job ID to project settings.');
      }

      done(err);
    });
  }

  _validateCommandOptions(cmd, options, projectSetup = {}) {
    const serviceIdIsRequired = cmd === Command.FLEX_DEPLOY || cmd === Command.FLEX_STATUS || cmd === Command.FLEX_LOGS
      || cmd === Command.FLEX_RECYCLE || cmd === Command.FLEX_DELETE;
    if (serviceIdIsRequired) {
      this._metadata[FlexOptionsNames.SERVICE_ID] = options[FlexOptionsNames.SERVICE_ID] || projectSetup[FlexOptionsNames.SERVICE_ID];

      if (isNullOrUndefined(this._metadata[FlexOptionsNames.SERVICE_ID])) {
        return FlexController._getValidationErr(FlexOptionsNames.SERVICE_ID, true);
      }
    }

    const jobIdIsRequired = cmd === Command.FLEX_JOB;
    if (jobIdIsRequired) {
      this._metadata.jobId = options[FlexOptionsNames.JOB_ID] || projectSetup.jobId;
      if (isNullOrUndefined(this._metadata.jobId)) {
        return FlexController._getValidationErr(FlexOptionsNames.JOB_ID, true);
      }
    }

    const domainIdIsRequired = cmd === Command.FLEX_LIST;
    if (domainIdIsRequired) {
      this._metadata.domain = options[FlexOptionsNames.DOMAIN_TYPE] || projectSetup[FlexOptionsNames.DOMAIN_TYPE];
      this._metadata.domainEntityId = options[FlexOptionsNames.DOMAIN_ID] || projectSetup.domainEntityId;
      if (isNullOrUndefined(this._metadata.domain) || isNullOrUndefined(this._metadata.domainEntityId)) {
        return FlexController._getValidationErr([FlexOptionsNames.DOMAIN_TYPE, FlexOptionsNames.DOMAIN_ID]);
      }
    }
  }

  static _getValidationErr(keys, isPositionalArg) {
    keys = Array.isArray(keys) ? keys : [keys];
    const typeMsg = isPositionalArg ? 'positional arguments' : 'options';
    const errMsg = `${Errors.ProjectNotConfigured.MESSAGE} Alternatively, use ${typeMsg}: ${keys.join(', ')}.`;
    return new KinveyError(Errors.ProjectNotConfigured.NAME, errMsg);
  }

  /**
   * Based on the command and the options set from user, decides whether the project setup is required or not. Merges loaded
   * setup and options. Throws if loading or validation fail.
   * @param options
   * @returns {boolean}
   */
  preProcessOptions(options) {
    const cmd = getCommandNameFromOptions(options);
    const cmdIsDeleteProjectSetup = cmd === Command.FLEX_CLEAR;

    // no need to load setup or validate anything
    if (cmdIsDeleteProjectSetup) {
      return true;
    }

    this._metadata.profileName = this.cliManager.getCurrentProfileName();

    // validate without loading project setup, first
    const errOptionsValidation = this._validateCommandOptions(cmd, options);

    // validation failed and there's no point in loading setup
    if (errOptionsValidation && (this.cliManager.isOneTimeSession() || cmd === Command.FLEX_CREATE)) {
      throw errOptionsValidation;
    }

    // try loading setup as we might need it if not a one-time session
    if (!this.cliManager.isOneTimeSession() && cmd !== Command.FLEX_CREATE) {
      const errSetupLoad = this.projectSetup.load();
      if (errSetupLoad) {
        const debugMsg = errSetupLoad.code === 'ENOENT' ? `Project configuration file not found: '${errSetupLoad.path}'.` : errSetupLoad;
        this.cliManager.log(LogLevel.DEBUG, debugMsg);
      }
    }

    if (!errOptionsValidation) {
      return true;
    }

    const loadedSetup = this.projectSetup.getFlexNamespace(this._metadata.profileName);

    if (loadedSetup.schemaVersion) {
      this._metadata.schemaVersion = loadedSetup.schemaVersion;
    }

    if (loadedSetup.serviceName) {
      this._metadata.serviceName = loadedSetup.serviceName;
    }

    const errValidation = this._validateCommandOptions(cmd, options, loadedSetup);
    if (errValidation) {
      throw errValidation;
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
        let err = null;
        if (isNullOrUndefined(this._metadata.profileName)) {
          err = new KinveyError(Errors.ProfileRequired);
        }

        setImmediate(() => next(err));
      },
      (next) => {
        this.flexService.getInitInput((err, input) => {
          if (err) {
            return next(err);
          }

          this.projectSetup.setFlexNamespace(this._metadata.profileName, input);
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
        if (this.cliManager.isOneTimeSession()) {
          return setImmediate(next);
        }

        this._saveJobId(this._metadata.profileName, jobId, () => {
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
    this.flexService.jobStatus(this._metadata.jobId, this._metadata.schemaVersion, (err, result) => {
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

  create(options, done) {
    let domainType;

    async.waterfall([
      (next) => {
        const appIsSet = !isNullOrUndefined(options[AppOptionsName.APP]);
        const orgIsSet = !isNullOrUndefined(options[OrgOptionsName.ORG]);
        if (appIsSet) {
          domainType = DomainTypes.APP;
          this.applicationsService.getByIdOrName(options[AppOptionsName.APP], next);
        } else if (orgIsSet) {
          domainType = DomainTypes.ORG;
          this.organizationsService.getByIdOrName(options[OrgOptionsName.ORG], next);
        } else {
          const errMsg = `Either '--${AppOptionsName.APP}' or '--${OrgOptionsName.ORG}' option must be set.`;
          return setImmediate(() => next(new Error(errMsg)));
        }
      },
      (entity, next) => {
        const data = {
          name: options.name,
          type: 'internal',
          backingServers: [{ secret: options[FlexOptionsNames.SERVICE_SECRET] }]
        };

        this.flexService.createService(data, entity.id, domainType, next);
      }
    ], (err, result) => {
      if (err) {
        return done(err);
      }

      const cmdResult = new CommandResult()
        .setRawData({ id: result.id })
        .setBasicMsg(OperationType.CREATE, EntityType.SERVICE, result.id);
      done(null, cmdResult);
    });
  }

  list(options, done) {
    const domainEntity = {
      id: this._metadata.domainEntityId,
      schemaVersion: this._metadata.schemaVersion
    };

    this.flexService.getServices(this._metadata.domain, domainEntity, (err, services) => {
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
        if (this.cliManager.isOneTimeSession()) {
          return setImmediate(next);
        }

        this._saveJobId(this._metadata.profileName, jobId, () => {
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

  deleteService(options, done) {
    const serviceId = this._metadata[FlexOptionsNames.SERVICE_ID];

    async.series([
      (next) => {
        super.confirmDeleteOperation(options[CommonOptionsNames.NO_PROMPT], EntityType.SERVICE, serviceId, next);
      },
      (next) => {
        this.flexService.deleteServiceById(serviceId, next);
      },
      (next) => {
        const currentProfile = this.cliManager.getCurrentProfileName();
        if (!currentProfile || !this.projectSetup.isServiceSetInFlexNamespace(currentProfile)) {
          return setImmediate(next);
        }

        this.projectSetup.clearServiceInFlexNamespace(currentProfile);
        this.projectSetup.save((err) => {
          if (err) {
            this.cliManager.log(LogLevel.WARN, `Failed to delete service from project settings. ${err}`);
          } else {
            this.cliManager.log(LogLevel.DEBUG, 'Deleted service from project settings.');
          }

          next();
        });
      }
    ], (err) => {
      if (err) {
        return done(err);
      }

      const cmdResult = new CommandResult()
        .setRawData({ id: serviceId })
        .setBasicMsg(OperationType.DELETE, EntityType.SERVICE);
      done(null, cmdResult);
    });
  }

  deleteProjectSetup(options, done) {
    this.projectSetup.clear();
    this.projectSetup.save((err) => {
      if (err) {
        return done(err);
      }

      const userFriendlyMsg = `Project data cleared. Run ${chalk.green(`kinvey ${Command.FLEX_INIT}`)} to get started.`;
      const cmdResult = new CommandResult()
        .setCustomMsg(userFriendlyMsg);
      done(null, cmdResult);
    });
  }
}

module.exports = FlexController;
