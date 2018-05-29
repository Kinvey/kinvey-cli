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
const moment = require('moment');

const BaseController = require('../BaseController');
const ProjectSetup = require('../ProjectSetup');
const { AppOptionsName, Command, CommonOptionsNames, Errors, EntityType, DomainTypes, InfoMessages, LogErrorMessages, LogLevel,
  OperationType, OrgOptionsName, PromptMessages, PromptTypes, ServiceStatus, FlexOptionsNames, JobStatus } = require('../Constants');
const CommandResult = require('../CommandResult');
const KinveyError = require('../KinveyError');
const { formatList, getCommandNameFromOptions, isEmpty, isValidNonZeroInteger, isValidTimestamp, isNullOrUndefined } = require('../Utils');

/**
 * Handles flex-related logic.
 */
class FlexController extends BaseController {
  /**
   * Creates an instance.
   * @param {Object} options
   * @param {Object} options.cliManager
   * @param {Object} options.applicationsService
   * @param {Object} options.organizationsService
   * @param {Object} options.servicesService
   */
  constructor(options) {
    super(options);
    this.applicationsService = options.applicationsService;
    this.organizationsService = options.organizationsService;
    this.servicesService = options.servicesService;
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

  static paintServiceStatus(status) {
    let paintedStatus;

    if (status === ServiceStatus.ONLINE) {
      paintedStatus = chalk.greenBright(ServiceStatus.ONLINE);
    } else if (status === ServiceStatus.UPDATING) {
      paintedStatus = chalk.yellowBright(ServiceStatus.UPDATING);
    } else if (status === ServiceStatus.NEW) {
      paintedStatus = chalk.cyanBright(ServiceStatus.NEW);
    } else if (status === ServiceStatus.ERROR) {
      paintedStatus = chalk.redBright(ServiceStatus.ERROR);
    } else {
      paintedStatus = status; // shouldn't happen
    }

    return paintedStatus;
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
   * Gets all apps and all orgs. If there are no apps and no orgs at the same time, passes error to callback. If entities exist, passes an object with 'app' and 'org' properties.
   * @param done
   * @private
   */
  _getAllDomainEntities(done) {
    const result = {};

    async.series([
      (next) => {
        this.organizationsService.getAll((err, orgs) => {
          if (err) {
            return next(err);
          }

          if (!isEmpty(orgs)) {
            result[DomainTypes.ORG] = orgs;
          }

          next();
        });
      },
      (next) => {
        this.applicationsService.getAll((err, apps) => {
          if (err) {
            return next(err);
          }

          if (!isEmpty(apps)) {
            result[DomainTypes.APP] = apps;
          }

          next();
        });
      }
    ], (err) => {
      if (err) {
        return done(err);
      }

      if (isEmpty(result)) {
        return done(new KinveyError(Errors.NoAppsAndOrgsFound));
      }

      done(null, result);
    });
  }

  /**
   * Gets the user's choice of domain: app or org.
   * @param done
   * @private
   */
  _getDomainTypeChoice(done) {
    const domainOpts = [{ name: 'App' }, { name: 'Organization' }];
    const domainQuestion = this.cliManager.prompter.buildQuestion(PromptMessages.INPUT_DOMAIN, 'domain', PromptTypes.LIST, null, domainOpts);

    this.cliManager.log(LogLevel.DEBUG, InfoMessages.APP_OR_ORG_PROMPTING);
    this.cliManager.prompter.prompt(domainQuestion, (err, data) => {
      if (err) {
        return done(err);
      }

      let result;
      if (data.domain === 'App') {
        result = DomainTypes.APP;
      } else {
        result = DomainTypes.ORG;
      }

      done(null, result);
    });
  }

  /**
   * Gets the user's choice of specific domain entity (specific app or org).
   * @param {Array} entities
   * @param {Constants.DomainTypes} domainType
   * @param done
   * @private
   */
  _getDomainEntityChoice(entities, domainType, done) {
    const isAppDomain = domainType === DomainTypes.APP;
    const logMsg = isAppDomain ? InfoMessages.APP_PROMPTING : InfoMessages.ORG_PROMPTING;
    this.cliManager.log(LogLevel.DEBUG, logMsg);
    const msg = isAppDomain ? PromptMessages.INPUT_APP : PromptMessages.INPUT_ORG;
    const question = this.cliManager.prompter.buildQuestion(msg, 'entity', PromptTypes.LIST, null, formatList(entities));
    this.cliManager.prompter.prompt(question, (err, data) => {
      if (err) {
        return done(err);
      }

      done(null, data.entity);
    });
  }

  /**
   * Gets the user's choice of service.
   * @param {Array|Object} services
   * @param done
   * @private
   */
  _getServiceChoice(services, done) {
    if (!Array.isArray(services)) {
      services = [services];
    }

    this.cliManager.log(LogLevel.DEBUG, InfoMessages.SERVICE_PROMPTING);
    const question = this.cliManager.prompter.buildQuestion(PromptMessages.INPUT_SPECIFIC_SERVICE, 'service', PromptTypes.LIST, null, formatList(services));
    this.cliManager.prompter.prompt(question, (err, data) => {
      if (err) {
        return done(err);
      }

      done(null, data.service);
    });
  }

  /**
   * Gathers the required data to setup a flex service.
   * @param done
   * @private
   */
  _getInitInput(done) {
    const input = {};
    let allDomainEntities;

    async.waterfall([
      (next) => {
        this._getAllDomainEntities((err, data) => {
          if (err) {
            return next(err);
          }

          allDomainEntities = data;
          next();
        });
      },
      (next) => {
        const canChoose = Object.keys(allDomainEntities).length > 1;
        if (!canChoose) {
          const domainType = Object.keys(allDomainEntities)[0];
          input.domain = domainType;
          return setImmediate(() => { next(null, domainType); });
        }

        this._getDomainTypeChoice((err, domain) => {
          if (err) {
            return next(err);
          }

          input.domain = domain;
          next(null, domain);
        });
      },
      (domain, next) => {
        const entities = allDomainEntities[domain];
        this._getDomainEntityChoice(entities, domain, next);
      },
      (entity, next) => {
        entity.schemaVersion = entity.schemaVersion || this.cliManager.config.defaultSchemaVersion;
        input.schemaVersion = entity.schemaVersion;
        input.domainEntityId = entity.id;
        this.servicesService.getAllInternalFlexServicesByDomain(input.domain, entity, next);
      },
      (services, next) => {
        this._getServiceChoice(services, (err, data) => {
          if (err) {
            return next(err);
          }

          input.serviceId = data.id;
          input.serviceName = data.name;
          next(null);
        });
      }
    ], (err) => {
      if (err) {
        return done(err);
      }

      done(null, input);
    });
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
        this._getInitInput((err, input) => {
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
    let jobId;

    async.series([
      (next) => {
        const schema = this._metadata.schemaVersion;
        const serviceId = this._metadata.serviceId;
        this.servicesService.deployFlexProject(dir, serviceId, schema, (err, deployJobId) => {
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
    this.servicesService.jobStatus(this._metadata.jobId, this._metadata.schemaVersion, (err, result) => {
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

  // eslint-disable-next-line class-methods-use-this
  getTableDataFromStatusData(data, { serviceId, serviceName }) {
    const result = {};

    result.status = FlexController.paintServiceStatus(data.status);
    result.version = data.version;
    result.id = serviceId;

    if (!isNullOrUndefined(serviceName)) {
      result.name = serviceName;
    }

    const hasDeployInfo = data.requestedAt && !isEmpty(data.deployUserInfo);
    if (hasDeployInfo) {
      result.requestedAt = moment(data.requestedAt).format('dddd, MMMM Do YYYY, h:mm:ss A');
      result.deployerEmail = data.deployUserInfo.email;

      if (data.deployUserInfo.firstName && data.deployUserInfo.lastName) {
        result.deployerName = `${data.deployUserInfo.firstName} ${data.deployUserInfo.lastName}`;
      }
    }

    return result;
  }

  status(options, done) {
    this.servicesService.getServiceStatus(this._metadata, (err, result) => {
      if (err) {
        return done(err);
      }

      const tableData = this.getTableDataFromStatusData(result, this._metadata);
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
        const secret = !isNullOrUndefined(options[FlexOptionsNames.SERVICE_SECRET])
          ? options[FlexOptionsNames.SERVICE_SECRET] : this.servicesService.generateSecret();
        const data = {
          name: options.name,
          type: 'internal',
          backingServers: [{ secret }]
        };

        this.servicesService.create(data, entity.id, domainType, next);
      }
    ], (err, result) => {
      if (err) {
        return done(err);
      }

      const rawResult = {
        id: result.id,
        secret: result.backingServers[0].secret
      };
      const msg = `Created service: ${rawResult.id}. Secret: ${rawResult.secret}`;
      const cmdResult = new CommandResult()
        .setRawData(rawResult)
        .setCustomMsg(msg);
      done(null, cmdResult);
    });
  }

  list(options, done) {
    const domainEntity = {
      id: this._metadata.domainEntityId,
      schemaVersion: this._metadata.schemaVersion
    };

    this.servicesService.getAllInternalFlexServicesByDomain(this._metadata.domain, domainEntity, (err, services) => {
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

  // eslint-disable-next-line class-methods-use-this
  validateLogsOptions({ from, to, number, page }, done) {
    let err = null;

    const fromExists = !isNullOrUndefined(from);
    const toExists = !isNullOrUndefined(to);

    if (fromExists && !isValidTimestamp(from)) {
      err = new KinveyError('InvalidParameter', `Logs 'from' flag ${LogErrorMessages.INVALID_TIMESTAMP}`);
    } else if (toExists && !isValidTimestamp(to)) {
      err = new KinveyError('InvalidParameter', `Logs 'to' flag ${LogErrorMessages.INVALID_TIMESTAMP}`);
    } else if (!isNullOrUndefined(number) && !isValidNonZeroInteger(number)) {
      err = new KinveyError('InvalidParameter', `Logs 'number' flag ${LogErrorMessages.INVALID_NONZEROINT}`);
    } else if (!isNullOrUndefined(page) && !isValidNonZeroInteger(page)) {
      err = new KinveyError('InvalidParameter', `Logs 'page' flag ${LogErrorMessages.INVALID_NONZEROINT}`);
    } else if ((fromExists && toExists) && !moment(from).isBefore(to)) {
      err = new KinveyError('InvalidParameter', `'${FlexOptionsNames.FROM}' timestamp must be before '${FlexOptionsNames.TO}' timestamp.`);
    }

    done(err);
  }

  // eslint-disable-next-line class-methods-use-this
  getTableDataFromLogs(logs) {
    const result = [];

    logs.forEach((x) => {
      if (isEmpty(x)) {
        return;
      }

      const log = {
        containerId: x.containerId.substring(0, 12)
      };

      if (!isNullOrUndefined(x.message)) {
        // remove EOL characters
        log.message = (x.message.replace(/\r?\n|\r/g, ' ')).trim();
      }

      log.threshold = x.threshold;
      log.timestamp = x.timestamp;

      result.push(log);
    });

    return result;
  }

  logs(options, done) {
    async.series([
      (next) => {
        this.validateLogsOptions(options, next);
      },
      (next) => {
        this.servicesService.getServiceLogs(options, this._metadata.serviceId, this._metadata.schemaVersion, next);
      },
    ], (err, results) => {
      if (err) {
        return done(err);
      }

      const result = results.pop();
      const tableData = this.getTableDataFromLogs(result);
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
        this.servicesService.execRecycle(this._metadata.schemaVersion, this._metadata.serviceId, (err, recycleJobId) => {
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
        this.servicesService.deleteInternalFlexServiceById(serviceId, next);
      },
      (next) => {
        const currentProfile = this.cliManager.getCurrentProfileName();
        if (!currentProfile || !this.projectSetup.isServiceSetInFlexNamespace(currentProfile, serviceId)) {
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
