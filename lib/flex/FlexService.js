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

const archiver = require('archiver');
const path = require('path');

const { DomainTypes, Errors, FlexOptionsNames, HTTPMethod, InfoMessages, LogErrorMessages, LogLevel, PromptMessages, PromptTypes, ServiceStatus } = require('../Constants');
const BaseService = require('./../BaseService');
const KinveyError = require('../KinveyError');
const { Endpoints, formatList, findAndSortInternalServices, isArtifact, isEmpty, isNullOrUndefined, isValidNonZeroInteger, isValidTimestamp, readJSON } = require('../Utils');

class FlexService extends BaseService {
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
   * @param {Boolean} isAppDomain
   * @param done
   * @private
   */
  _getDomainEntityChoice(entities, isAppDomain, done) {
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
   * @param {Boolean} isDomainApp
   * @param {Object} entity
   * @param done
   * @private
   */
  getServices(isDomainApp, entity, done) {
    const domainType = isDomainApp ? 'apps' : 'organizations';
    const endpoint = Endpoints.servicesByDomain(domainType, entity.id, null, entity.schemaVersion);
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
        isAppDomain = domain === DomainTypes.APP;
        this._getDomainEntityChoice(entities, isAppDomain, next);
      },
      (entity, next) => {
        entity.schemaVersion = entity.schemaVersion || this.cliManager.config.defaultSchemaVersion;
        input.schemaVersion = entity.schemaVersion;
        input.domainEntityId = entity.id;
        this.getServices(isAppDomain, entity, next);
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

  deployProject(dir, serviceId, pkgVersion, schemaVersion, uploadTimeout, maxUploadSize, artifacts, done) {
    this.cliManager.log(LogLevel.DEBUG, 'Creating archive from %s', chalk.cyan(dir));
    const archive = archiver.create('tar');

    const attachment = {
      value: archive,
      options: {
        filename: 'archive.tar',
        contentType: 'application/tar'
      }
    };

    const req = this.cliManager.sendRequest({
      method: 'POST',
      endpoint: Endpoints.jobs(schemaVersion),
      headers: {
        'Transfer-Encoding': 'chunked'
      },
      formData: {
        type: 'deployDataLink',
        params: JSON.stringify({
          dataLinkId: serviceId,
          version: pkgVersion
        }),
        file: attachment
      },
      timeout: uploadTimeout
    }, (err, data) => {
      if (err) {
        return done(err);
      }

      done(null, data.job);
    });

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
}

module.exports = FlexService;
