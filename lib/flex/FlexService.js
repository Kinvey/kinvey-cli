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

const AESjs = require('aes-js');
const async = require('async');
const chalk = require('chalk');
const moment = require('moment');

const archiver = require('archiver');
const path = require('path');

const { APIRuntimeToCLIRuntime, CLIRuntime, DomainTypes, EntityType, Errors, FlexOptionsNames, HTTPMethod, InfoMessages, LogErrorMessages,
  LogLevel, PromptMessages, PromptTypes, ServiceStatus, DeploymentStatus } = require('../Constants');
const BaseService = require('./../BaseService');
const KinveyError = require('../KinveyError');
const { Endpoints, formatList, findAndSortInternalServices, getCustomNotFoundError, isArtifact, isEmpty, isNullOrUndefined, isValidNonZeroInteger, isValidTimestamp, readJSON } = require('../Utils');

const StatusColorMapping = new Map([
  [ServiceStatus.ONLINE, chalk.greenBright(ServiceStatus.ONLINE)],
  [ServiceStatus.UPDATING, chalk.yellowBright(ServiceStatus.UPDATING)],
  [ServiceStatus.NEW, chalk.cyanBright(ServiceStatus.NEW)],
  [ServiceStatus.ERROR, chalk.redBright(ServiceStatus.ERROR)],
  [DeploymentStatus.COMPLETED, chalk.greenBright(DeploymentStatus.COMPLETED)],
  [DeploymentStatus.RUNNING, chalk.yellowBright(DeploymentStatus.RUNNING)]
]);

class FlexService extends BaseService {
  static paintServiceStatus(status) {
    if (!isEmpty(status)) {
      return StatusColorMapping.get(status.toUpperCase()) || status;
    }
    return status;
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
   * Gets all apps or orgs. If none found, passes an error to callback.
   * @param {Constants.DomainTypes} domainType
   * @param done
   * @private
   */
  _getDomainEntities(domainType, done) {
    let endpoint;
    const isAppDomain = domainType === DomainTypes.APP;
    if (isAppDomain) {
      endpoint = Endpoints.apps(this.cliManager.config.defaultSchemaVersion);
    } else {
      endpoint = Endpoints.orgs(this.cliManager.config.defaultSchemaVersion);
    }

    this.cliManager.sendRequest({ endpoint }, (err, data) => {
      if (err) {
        return done(err);
      }

      if (data.length === 0) {
        const errNoEntities = isAppDomain ? new KinveyError(Errors.NoAppsFound) : new KinveyError(Errors.NoOrgsFound);
        return done(errNoEntities);
      }

      done(null, data);
    });
  }

  /**
   * Gets all the internal services (sorted) for a domain. If none found, passes an error to callback.
   * @param {Constants.DomainTypes} domainType
   * @param {Object} entity
   * @param done
   * @private
   */
  getServices(domainType, entity, done) {
    const schemaVersion = entity.schemaVersion || this.cliManager.config.defaultSchemaVersion;
    const endpoint = Endpoints.servicesByDomain(domainType, entity.id, schemaVersion);
    this.cliManager.sendRequest({ endpoint }, (err, data) => {
      if (err) {
        return done(err);
      }

      const result = findAndSortInternalServices(data);
      if (isEmpty(result)) {
        return done(new KinveyError(Errors.NoFlexServicesFound));
      }

      done(null, result);
    });
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
        this._getDomainEntities(DomainTypes.ORG, (err, data) => {
          if (err) {
            if (err.name === Errors.NoOrgsFound.NAME) {
              return next();
            }

            return next(err);
          }

          result[DomainTypes.ORG] = data;
          next();
        });
      },
      (next) => {
        this._getDomainEntities(DomainTypes.APP, (err, data) => {
          if (err) {
            if (err.name === Errors.NoAppsFound.NAME) {
              return next();
            }

            return next(err);
          }

          result[DomainTypes.APP] = data;
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
   * Gathers the required data to setup a flex service.
   * @param done
   * @private
   */
  getInitInput(done) {
    const input = {};
    let allDomainEntities;
    let isAppDomain;

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
        this.getServices(input.domain, entity, next);
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

  // eslint-disable-next-line class-methods-use-this
  validateProject(dir, done) {
    const packagePath = path.join(dir, 'package.json');
    readJSON(packagePath, (err, json) => {
      if (!json || !json.dependencies || !json.dependencies['kinvey-flex-sdk']) {
        return done(new KinveyError(Errors.InvalidProject));
      }

      done(err, json.version);
    });
  }

  deployProject(dir, serviceId, pkgVersion, schemaVersion, uploadTimeout, maxUploadSize, artifacts, envVars, runtime, done) {
    this.cliManager.log(LogLevel.DEBUG, 'Creating archive from %s', chalk.cyan(dir));
    const archive = archiver.create('tar');

    const attachment = {
      value: archive,
      options: {
        filename: 'archive.tar',
        contentType: 'application/tar'
      }
    };

    const params = {
      dataLinkId: serviceId,
      version: pkgVersion
    };

    if (!isNullOrUndefined(envVars)) {
      params.environmentVariables = envVars;
    }

    if (!isNullOrUndefined(runtime)) {
      params.runtime = runtime;
    }

    const req = this.cliManager.sendRequest({
      method: 'POST',
      endpoint: Endpoints.jobs(schemaVersion),
      headers: {
        'Transfer-Encoding': 'chunked'
      },
      formData: {
        type: 'deployDataLink',
        params: JSON.stringify(params),
        file: attachment
      },
      timeout: uploadTimeout
    }, (err, data) => {
      if (err) {
        return done(err);
      }

      done(null, data.job);
    });

    req.on('pipe', () => req.removeHeader('Content-Length'));

    archive.on('data', () => {
      const size = archive.pointer();
      if (size > maxUploadSize) {
        this.cliManager.log(LogLevel.DEBUG, 'Max archive size exceeded (%s bytes, max %s bytes)', chalk.cyan(size), chalk.cyan(maxUploadSize));
        req.emit('error', new KinveyError(Errors.ProjectMaxFileSizeExceeded));
      }
    });

    archive.on('finish', () => this.cliManager.log(LogLevel.DEBUG, 'Created archive, %s bytes written', chalk.cyan(archive.pointer())));

    req.once('error', (err) => {
      this.cliManager.log(LogLevel.DEBUG, 'Aborting the request because of error: %s', chalk.cyan(err.message || err));
      archive.removeAllListeners('finish');
      archive.abort();
      req.abort();
    });

    archive.bulk([
      {
        cwd: dir,
        src: '**/*',
        dest: false,
        dot: true,
        expand: true,
        filter: filepath => !isArtifact(artifacts, dir, filepath)
      }
    ]);

    archive.finalize();
  }

  /**
   * Returns secret key. 256-bit key derived from 58 digit key.
   * @returns {String}
   */
  // eslint-disable-next-line class-methods-use-this
  generateSecret() {
    let ret = '';
    const length = 58;
    while (ret.length < length) {
      ret += Math.random().toString(16).substring(2);
    }

    const text = ret.substring(0, length);

    const key256 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
      16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
      29, 30, 31];
    const textBytes = AESjs.utils.utf8.toBytes(text);

    // The counter is optional, and if omitted will begin at 1
    const aesCtr = new AESjs.ModeOfOperation.ctr(key256, new AESjs.Counter(5)); // eslint-disable-line
    const encryptedBytes = aesCtr.encrypt(textBytes);
    const result = AESjs.utils.hex.fromBytes(encryptedBytes);
    return result;
  }

  createService(data, domainId, domainType, done) {
    const endpoint = Endpoints.servicesByDomain(domainType, domainId, this.cliManager.config.defaultSchemaVersion);
    this.cliManager.sendRequest({ endpoint, data, method: HTTPMethod.POST }, done);
  }

  _getJob(jobId, schemaVersion, done) {
    this.cliManager.sendRequest({ endpoint: Endpoints.jobs(schemaVersion, jobId) }, done);
  }

  jobStatus(jobId, schemaVersion, done) {
    this._getJob(jobId, schemaVersion, (err, data) => {
      if (err) {
        return done(err);
      }

      const statusInfo = {
        status: data.status,
        progress: data.progress,
        jobId: data.jobId
      };

      done(null, statusInfo);
    });
  }

  getServiceStatus({ serviceId, schemaVersion }, done) {
    this.cliManager.sendRequest({ endpoint: Endpoints.serviceStatus(schemaVersion, serviceId) }, done);
  }

  // eslint-disable-next-line class-methods-use-this
  getTableDataFromStatusData(data, { serviceId, serviceName }) {
    const result = {};

    result.status = FlexService.paintServiceStatus(data.status);
    result.version = data.version;

    const hasDeployment = !isEmpty(data.deployment);
    if (hasDeployment) {
      result.runtime = APIRuntimeToCLIRuntime[data.runtime] || CLIRuntime.NODE6;
    }

    if (!isNullOrUndefined(serviceName)) {
      result.name = serviceName;
    }
    result.id = serviceId;

    const hasDeployInfo = data.requestedAt && !isEmpty(data.deployUserInfo);
    if (hasDeployInfo) {
      result.requestedAt = moment(data.requestedAt).format('dddd, MMMM Do YYYY, h:mm:ss A');
      result.deployerEmail = data.deployUserInfo.email;

      if (data.deployUserInfo.firstName && data.deployUserInfo.lastName) {
        result.deployerName = `${data.deployUserInfo.firstName} ${data.deployUserInfo.lastName}`;
      }
    }

    if (hasDeployment) {
      result.deploymentStatus = FlexService.paintServiceStatus(data.deployment.status);
      result.deploymentVersion = data.deployment.version;
      result.deploymentRuntime = APIRuntimeToCLIRuntime[data.deployment.runtime] || CLIRuntime.NODE6;
    }

    return result;
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

  getServiceLogs({ from, to, number, page }, serviceId, schemaVersion, done) {
    let paramAdded = false;
    let endpoint = Endpoints.serviceLogs(schemaVersion, serviceId);

    if (from != null) {
      endpoint += `?from=${from}`;
      paramAdded = true;
    }

    if (to != null) {
      if (paramAdded) {
        endpoint += `&to=${to}`;
      } else {
        endpoint += `?to=${to}`;
        paramAdded = true;
      }
    }

    if (number != null) {
      if (paramAdded) {
        endpoint += `&limit=${number}`;
      } else {
        endpoint += `?limit=${number}`;
        paramAdded = true;
      }
    }

    if (page != null) {
      if (paramAdded) {
        endpoint += `&page=${page}`;
      } else {
        endpoint += `?page=${page}`;
      }
    }

    this.cliManager.sendRequest({ endpoint }, done);
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

  execRecycle(schemaVersion, serviceId, done) {
    const options = {
      endpoint: Endpoints.jobs(schemaVersion),
      method: HTTPMethod.POST,
      data: {
        type: 'recycleDataLink',
        params: {
          dataLinkId: serviceId
        }
      }
    };

    this.cliManager.sendRequest(options, (err, data) => {
      if (err) {
        return done(err);
      }

      done(null, data.job);
    });
  }

  getServiceById(id, done) {
    this.cliManager.sendRequest({ endpoint: Endpoints.services(this.cliManager.config.defaultSchemaVersion, id) }, done);
  }

  updateServiceById(id, data, done) {
    const endpoint = Endpoints.services(this.cliManager.config.defaultSchemaVersion, id);
    this.cliManager.sendRequest({ endpoint, data, method: HTTPMethod.PUT }, done);
  }

  deleteServiceById(id, done) {
    async.series([
      (next) => {
        this.getServiceById(id, (err, service) => {
          if (err) {
            return next(err);
          }

          const isInternalFlex = service && service.type === 'internal';
          if (!isInternalFlex) {
            return setImmediate(() => { next(getCustomNotFoundError(EntityType.INTERNAL_FLEX_SERVICE, id)); });
          }

          next();
        });
      },
      (next) => {
        const endpoint = Endpoints.services(this.cliManager.config.defaultSchemaVersion, id);
        this.cliManager.sendRequest({ endpoint, method: HTTPMethod.DELETE }, next);
      }
    ], done);
  }
}

module.exports = FlexService;
