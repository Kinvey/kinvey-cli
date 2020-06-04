/**
 * Copyright (c) 2018, Kinvey, Inc. All rights reserved.
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
const { ActiveItemType, AppOptionsName, APIRuntimeToCLIRuntime, Command, CommonOptionsNames, CLIRuntimeToAPIRuntime, DeploymentStatus,
  Errors, EntityType, DomainTypes, InfoMessages, LogErrorMessages, LogLevel, OperationType, OrgOptionsName,
  PromptMessages, PromptTypes, ServiceStatus, ServiceOptionsNames, FlexOptionsNames, JobStatus } = require('../Constants');
const CommandResult = require('../CommandResult');
const KinveyError = require('../KinveyError');
const { formatList, generateSecretKey, getCommandNameFromOptions, getCustomNotFoundError,
  getObjectFromDelimiterSeparatedKeyValuePairs, isEmpty, isValidNonZeroInteger, isValidTimestamp, isNullOrUndefined } = require('../Utils');

const StatusColorMapping = new Map([
  [ServiceStatus.ONLINE, chalk.greenBright(ServiceStatus.ONLINE)],
  [ServiceStatus.UPDATING, chalk.yellowBright(ServiceStatus.UPDATING)],
  [ServiceStatus.BUILDING, chalk.yellow(ServiceStatus.BUILDING)],
  [ServiceStatus.DEPLOYING, chalk.yellow(ServiceStatus.DEPLOYING)],
  [ServiceStatus.NEW, chalk.cyanBright(ServiceStatus.NEW)],
  [ServiceStatus.ERROR, chalk.redBright(ServiceStatus.ERROR)],
  [DeploymentStatus.COMPLETED, chalk.greenBright(DeploymentStatus.COMPLETED)],
  [DeploymentStatus.RUNNING, chalk.yellowBright(DeploymentStatus.RUNNING)]
]);

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

  _findSvcEnvId(options, done) {
    if (isNullOrUndefined(options[FlexOptionsNames.SVC_ENV]) && !isNullOrUndefined(this._metadata.svcEnvId)) {
      return setImmediate(done);
    }

    this.servicesService.getSpecifiedOrDefaultSvcEnv(this._metadata.serviceId, options[FlexOptionsNames.SVC_ENV], (err, env) => {
      if (err) {
        return done(err);
      }

      this._metadata.svcEnvId = env.id;
      done();
    });
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

  _transformEnvVars(options) {
    const transform = (x) => {
      let jsonParseFailed = false;
      let parsed;
      try {
        parsed = JSON.parse(x);
      } catch (ex) {
        jsonParseFailed = true;
      }

      if (jsonParseFailed) {
        parsed = getObjectFromDelimiterSeparatedKeyValuePairs(x);
      }

      if (!parsed) {
        return parsed;
      }

      // the backend expects all values to be strings
      const result = {};
      Object.keys(parsed).forEach((k) => {
        result[k] = typeof parsed[k] === 'string' ? parsed[k] : JSON.stringify(parsed[k]);
      });

      return result;
    };

    try {
      if (options[FlexOptionsNames.ENV_VARS_SET]) {
        this._metadata[FlexOptionsNames.ENV_VARS_SET] = transform(options[FlexOptionsNames.ENV_VARS_SET]);
      }

      if (options[FlexOptionsNames.ENV_VARS_REPLACE]) {
        this._metadata[FlexOptionsNames.ENV_VARS_REPLACE] = transform(options[FlexOptionsNames.ENV_VARS_REPLACE]);
      }
    } catch (ex) {
      throw new Error('Environment variables must be specified as comma-separated list (e.g. key1=value1,key2=value2) or in valid JSON format.');
    }
  }

  _validateOrgIsAvailable(options, projectSetup) {
    if (!isNullOrUndefined(options[OrgOptionsName.ORG])) {
      this._metadata.orgId = options[OrgOptionsName.ORG];
      return;
    }

    const projectDomainType = projectSetup[FlexOptionsNames.DOMAIN_TYPE];
    if (!isNullOrUndefined(projectDomainType) && !isNullOrUndefined(projectSetup.domainEntityId)) {
      if (projectDomainType === DomainTypes.APP) {
        return new KinveyError(Errors.ProjectRestoreError);
      }

      this._metadata.orgId = projectSetup.domainEntityId;
      return;
    }

    const activeOrgId = this.cliManager.getActiveItemId(ActiveItemType.ORG);
    if (!isNullOrUndefined(activeOrgId)) {
      this._metadata.orgId = activeOrgId;
      return;
    }

    const errMsg = `Organization is required. Please use 'kinvey ${Command.FLEX_INIT}' to setup the project, use the --${OrgOptionsName.ORG} option or set active org.`;
    return new KinveyError(Errors.OrgRequired.NAME, errMsg);
  }

  _validateCommandOptions(cmd, options, projectSetup = {}) {
    const serviceIdIsRequired = cmd === Command.FLEX_DEPLOY || cmd === Command.FLEX_STATUS || cmd === Command.FLEX_LOGS
      || cmd === Command.FLEX_RECYCLE || cmd === Command.FLEX_DELETE || cmd === Command.FLEX_UPDATE || cmd === Command.FLEX_SHOW;
    if (serviceIdIsRequired) {
      this._metadata.serviceId = options[FlexOptionsNames.SERVICE_ID] || projectSetup.serviceId;
      if (!options[FlexOptionsNames.SVC_ENV] && projectSetup.svcEnvId) {
        this._metadata.svcEnvId = projectSetup.svcEnvId;
      }

      if (isNullOrUndefined(this._metadata.serviceId)) {
        return FlexController._getValidationErr(FlexOptionsNames.SERVICE_ID, false);
      }
    }

    const jobIdIsRequired = cmd === Command.FLEX_JOB;
    if (jobIdIsRequired) {
      this._metadata.jobId = options[FlexOptionsNames.JOB_ID] || projectSetup.jobId;
      if (isNullOrUndefined(this._metadata.jobId)) {
        return FlexController._getValidationErr(FlexOptionsNames.JOB_ID, true);
      }
    }

    const orgIdIsRequired = cmd === Command.FLEX_LIST || cmd === Command.FLEX_CREATE;
    if (orgIdIsRequired) {
      return this._validateOrgIsAvailable(options, projectSetup);
    }
  }

  static _getValidationErr(originalKeys, isPositionalArg) {
    const keys = Array.isArray(originalKeys) ? originalKeys : [originalKeys];
    const typeMsg = isPositionalArg ? 'positional arguments' : 'options';
    const errMsg = `${Errors.ProjectNotConfigured.MESSAGE} Alternatively, use ${typeMsg}: ${keys.join(', ')}.`;
    return new KinveyError(Errors.ProjectNotConfigured.NAME, errMsg);
  }

  static paintServiceStatus(status) {
    if (isNullOrUndefined(status)) {
      return 'UNKNOWN';
    }

    const statusUpperCase = status.toUpperCase();
    return StatusColorMapping.get(statusUpperCase) || statusUpperCase;
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
    this._metadata.schemaVersion = this.cliManager.config.defaultSchemaVersion;

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

    this._transformEnvVars(options);

    if (!errOptionsValidation) {
      return true;
    }

    const loadedSetup = this.projectSetup.getFlexNamespace(this._metadata.profileName);

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
   * Gets the user's choice of specific org.
   * @param {Array} orgs
   * @param done
   * @private
   */
  _getOrgChoice(orgs, done) {
    const logMsg = InfoMessages.ORG_PROMPTING;
    this.cliManager.log(LogLevel.DEBUG, logMsg);
    const msg = PromptMessages.INPUT_ORG;
    const question = this.cliManager.prompter.buildQuestion(msg, 'entity', PromptTypes.LIST, null, formatList(orgs));
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
      services = [services]; // eslint-disable-line no-param-reassign
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

  _getSvcEnvChoice(serviceId, done) {
    this.servicesService.getServiceEnvs(serviceId, (err, data) => {
      if (err) {
        return done(err);
      }

      if (isEmpty(data)) {
        return done(new KinveyError(Errors.NoScvEnvFound));
      }

      if (data.length === 1) {
        return done(null, data[0]);
      }

      const question = this.cliManager.prompter.buildQuestion(PromptMessages.INPUT_SPECIFIC_SVC_ENV, 'svcEnv', PromptTypes.LIST, null, data);
      this.cliManager.prompter.prompt(question, (err, results) => {
        if (err) {
          return done(err);
        }

        const envName = results.svcEnv;
        const env = data.find(x => x.name === envName);

        done(null, env);
      });
    });
  }


  /**
   * Gathers the required data to setup a flex service.
   * @param done
   * @private
   */
  _getInitInput(done) {
    const input = {};

    async.waterfall([
      (next) => {
        this.organizationsService.getAll((err, orgs) => {
          if (err) {
            return next(err);
          }

          if (isEmpty(orgs)) {
            return next(new KinveyError(Errors.NoOrgsFound));
          }

          next(null, orgs);
        });
      },
      (orgs, next) => {
        this._getOrgChoice(orgs, next);
      },
      (chosenOrg, next) => {
        input.schemaVersion = this.cliManager.config.defaultSchemaVersion;
        input.domainEntityId = chosenOrg.id;
        input.domain = DomainTypes.ORG;
        this.servicesService.getAllInternalFlexServicesByDomain(chosenOrg, next);
      },
      (services, next) => {
        this._getServiceChoice(services, (err, data) => {
          if (err) {
            return next(err);
          }

          input.serviceId = data.id;
          input.serviceName = data.name;
          next(null, input.serviceId);
        });
      },
      (serviceId, next) => {
        this._getSvcEnvChoice(serviceId, (err, env) => {
          if (err) {
            return next(err);
          }

          input.svcEnvId = env.id;
          next();
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
    const serviceId = this._metadata.serviceId;
    let finalEnvVars;
    let jobId;

    async.series([
      (next) => {
        this._findSvcEnvId(options, next);
      },
      (next) => {
        if (!isNullOrUndefined(options[FlexOptionsNames.ENV_VARS_REPLACE])) {
          finalEnvVars = Object.assign({}, this._metadata[FlexOptionsNames.ENV_VARS_REPLACE]);
          return setImmediate(next);
        }

        if (!this._metadata[FlexOptionsNames.ENV_VARS_SET]) {
          return setImmediate(next);
        }

        this.servicesService.getSpecifiedOrDefaultSvcEnv(serviceId, this._metadata.svcEnvId, (err, data) => {
          if (err) {
            return next(err);
          }

          if (data.environmentVariables) {
            finalEnvVars = Object.assign({}, data.environmentVariables, this._metadata[FlexOptionsNames.ENV_VARS_SET]);
          } else {
            finalEnvVars = Object.assign({}, this._metadata[FlexOptionsNames.ENV_VARS_SET]);
          }

          next();
        });
      },
      (next) => {
        const serviceId = this._metadata.serviceId;
        const svcEnvId = this._metadata.svcEnvId;
        const dir = this.cliManager.config.paths.package;
        const schemaVersion = this.cliManager.config.defaultSchemaVersion;
        const runtime = CLIRuntimeToAPIRuntime[options[FlexOptionsNames.RUNTIME]];
        const deployOpts = {
          serviceId,
          svcEnvId,
          dir,
          schemaVersion,
          runtime,
          envVars: finalEnvVars
        };
        this.servicesService.deployFlexProject(deployOpts, (err, deployJobId) => {
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

    const hasDeployment = !isEmpty(data.deployment);
    if (hasDeployment) {
      if (data.runtime) {
        result.runtime = APIRuntimeToCLIRuntime[data.runtime];
      }
    }

    if (!isNullOrUndefined(serviceName)) {
      result.name = serviceName;
    }
    result.id = serviceId;
    result.svcEnvId = data.svcEnvId;

    const hasDeployInfo = data.requestedAt && !isEmpty(data.deployUserInfo);
    if (hasDeployInfo) {
      result.requestedAt = moment(data.requestedAt).format('dddd, MMMM Do YYYY, h:mm:ss A');
      result.deployerEmail = data.deployUserInfo.email;

      if (data.deployUserInfo.firstName && data.deployUserInfo.lastName) {
        result.deployerName = `${data.deployUserInfo.firstName} ${data.deployUserInfo.lastName}`;
      }
    }

    if (hasDeployment) {
      result.deploymentStatus = FlexController.paintServiceStatus(data.deployment.status);
      result.deploymentVersion = data.deployment.version;
      if (data.deployment.runtime) {
        result.deploymentRuntime = APIRuntimeToCLIRuntime[data.deployment.runtime];
      }
    }

    return result;
  }

  status(options, done) {
    this._findSvcEnvId(options, (err) => {
      if (err) {
        return done(err);
      }

      const statusOpts = {
        serviceId: this._metadata.serviceId,
        svcEnvId: this._metadata.svcEnvId,
        schemaVersion: this._metadata.schemaVersion
      };
      this.servicesService.getServiceStatus(statusOpts, (err, result) => {
        if (err) {
          return done(err);
        }

        result.serviceId = this._metadata.serviceId;
        result.svcEnvId = this._metadata.svcEnvId;
        const tableData = this.getTableDataFromStatusData(result, this._metadata);
        const cmdResult = new CommandResult()
          .setRawData(result)
          .setTableData(tableData);
        done(null, cmdResult);
      });
    });
  }

  show(options, done) {
    const rawData = {};

    async.series([
      (next) => {
        this._findSvcEnvId(options, next);
      },
      (next) => {
        this.servicesService.getSpecifiedOrDefaultSvcEnv(this._metadata.serviceId, this._metadata.svcEnvId, (err, data) => {
          if (err) {
            return next(err);
          }

          rawData.svcEnvName = data.name;
          rawData.svcEnvId = data.id;
          if (data.description) {
            rawData.description = data.description;
          }

          if (data.runtime) {
            rawData.runtime = APIRuntimeToCLIRuntime[data.runtime] || 'UNKNOWN';
          }

          rawData.secret = data.secret;
          if (data.environmentVariables) {
            rawData.environmentVariables = data.environmentVariables;
          }

          next();
        });
      },
      (next) => {
        this.servicesService.getById(this._metadata.serviceId, (err, data) => {
          if (err) {
            return next(err);
          }

          // set some service info
          rawData.serviceName = data.name;
          if (data.access.writers.apps) {
            rawData.app = data.access.writers.apps[0];
          } else {
            rawData.org = data.access.writers.organizations[0];
          }

          next();
        });
      }
    ], (err) => {
      if (err) {
        return done(err);
      }

      const tableData = Object.assign({}, rawData);
      // flatten env vars for table view
      if (tableData.environmentVariables) {
        Object.keys(tableData.environmentVariables).forEach((k) => {
          tableData[`environmentVariables.${k}`] = tableData.environmentVariables[k];
        });

        delete tableData.environmentVariables;
      }

      const cmdResult = new CommandResult()
        .setRawData(rawData)
        .setTableData(tableData);
      done(null, cmdResult);
    });
  }

  create(options, done) {
    let serviceId;

    async.waterfall([
      (next) => {
        this.organizationsService.getByIdOrName(this._metadata.orgId, next);
      },
      (org, next) => {
        const data = {
          name: options.name,
          type: 'internal',
          access: {
            writers: {
              organizations: [org.id]
            }
          }
        };

        this.servicesService.create(data, next);
      },
      (service, next) => {
        serviceId = service.id;

        const data = {
          name: options[FlexOptionsNames.SVC_ENV],
          secret: !isNullOrUndefined(options[FlexOptionsNames.SERVICE_SECRET])
            ? options[FlexOptionsNames.SERVICE_SECRET] : generateSecretKey(),
          environmentVariables: this._metadata[FlexOptionsNames.ENV_VARS_SET]
        };

        if (!isNullOrUndefined(options[FlexOptionsNames.RUNTIME])) {
          data.runtime = CLIRuntimeToAPIRuntime[options[FlexOptionsNames.RUNTIME]];
        }

        const endpoint = `v3/services/${service.id}/environments`;
        this.cliManager.sendRequest({ endpoint, data, method: 'POST' }, next);
      }
    ], (err, result) => {
      if (err) {
        return done(err);
      }

      const rawResult = {
        id: serviceId,
        secret: result.secret
      };
      const msg = `Created service: ${rawResult.id}. Secret: ${rawResult.secret}`;
      const cmdResult = new CommandResult()
        .setRawData(rawResult)
        .setCustomMsg(msg);
      done(null, cmdResult);
    });
  }

  update(options, done) {
    async.waterfall([
      (next) => {
        this._findSvcEnvId(options, next);
      },
      (next) => {
        this.servicesService.getSpecifiedOrDefaultSvcEnv(this._metadata.serviceId, this._metadata.svcEnvId, next);
      },
      (existingEntity, next) => {
        if (!isNullOrUndefined(options[FlexOptionsNames.ENV_VARS_REPLACE])) {
          existingEntity.environmentVariables = Object.assign({}, this._metadata[FlexOptionsNames.ENV_VARS_REPLACE]);
        } else if (!isNullOrUndefined(options[FlexOptionsNames.ENV_VARS_SET])) {
          existingEntity.environmentVariables = Object.assign({}, existingEntity.environmentVariables, this._metadata[FlexOptionsNames.ENV_VARS_SET]);
        }

        if (isNullOrUndefined(existingEntity.description)) {
          delete existingEntity.description;
        }

        delete existingEntity.id;

        existingEntity.runtime = CLIRuntimeToAPIRuntime[options[FlexOptionsNames.RUNTIME]];
        if (isNullOrUndefined(existingEntity.runtime)) { // backend might return it as null anyways
          delete existingEntity.runtime;
        }

        this.servicesService.updateSvcEnv(this._metadata.serviceId, this._metadata.svcEnvId, existingEntity, next);
      }
    ], (err) => {
      if (err) {
        return done(err);
      }

      const cmdResult = new CommandResult()
        .setRawData({ id: this._metadata.svcEnvId })
        .setBasicMsg(OperationType.UPDATE, EntityType.SCV_ENV, this._metadata.svcEnvId);
      done(null, cmdResult);
    });
  }

  list(options, done) {
    async.waterfall([
      (next) => {
        this.organizationsService.getByIdOrName(this._metadata.orgId, next);
      },
      (fetchedOrg, next) => {
        this.servicesService.getAllInternalFlexServicesByDomain(fetchedOrg, next);
      }
    ], (err, services) => {
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

      log.timestamp = x.timestamp;
      log.threshold = x.threshold;

      if (!isNullOrUndefined(x.message)) {
        const msgAsString = typeof x.message === 'string' ? x.message : JSON.stringify(x.message);
        // remove EOL characters
        log.message = (msgAsString.replace(/\r?\n|\r/g, ' ')).trim();
      }

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
        this._findSvcEnvId(options, next);
      },
      (next) => {
        this.servicesService.getServiceLogs(options, this._metadata.serviceId, this._metadata.svcEnvId, this._metadata.schemaVersion, next);
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
        this._findSvcEnvId(options, next);
      },
      (next) => {
        this.servicesService.execRecycle(this._metadata.schemaVersion, this._metadata.serviceId, this._metadata.svcEnvId, (err, recycleJobId) => {
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
    const serviceId = this._metadata.serviceId;

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
