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
const cloneDeep = require('lodash.clonedeep');

const { BackendServiceType, CLIRuntimeToAPIRuntime, ConfigFiles, DomainTypes, Errors, LogLevel, OperationType } = require('./Constants');
const FileProcessorHelper = require('./FileProcessorHelper');
const { getObjectByOmitting, getObjectByPicking, isEmpty, isNullOrUndefined } = require('./Utils');

const flexType = 'flex';
const rapidDataType = 'rapidData';

class ServiceFileProcessor {
  constructor(options) {
    this.cliManager = options.cliManager;
    this.servicesService = options.servicesService;
  }

  /**
   * Process service configuration.
   * @param {Object} options
   * @param {String} [options.name] Service name
   * @param {Object} options.parsedData Data to process
   * @param {String} options.domainId ID of service's owner
   * @param {Constants.DomainTypes} options.domainType Type of service's owner/scope - app or org
   * @param done
   */
  process(options, done) {
    const operationType = options.operation;
    const source = options.parsedData;
    if (operationType === OperationType.CREATE) {
      this._createService(source, options, done);
    } else if (operationType === OperationType.UPDATE) {
      this._updateService(source, options, done);
    } else {
      return setImmediate(() => { done(new Error(`Operation type not supported: ${operationType}`)); });
    }
  }

  _createService(source, options, done) {
    const serviceType = source.type;
    if (serviceType === ConfigFiles.ServiceType.FLEX_INTERNAL || serviceType === ConfigFiles.ServiceType.FLEX_EXTERNAL) {
      this._createFlexService(source, options, done);
    } else {
      this._createRapidDataService(source, options, done);
    }
  }

  static _buildAccess({ domainId, domainType }) {
    const writers = {};
    if (domainType === DomainTypes.APP) {
      writers.apps = [domainId];
    } else {
      writers.organizations = [domainId];
    }

    return { writers };
  }

  _createFlexService(source, options, done) {
    let service;

    async.series([
      (next) => {
        const data = {
          name: options.name,
          type: source.type === ConfigFiles.ServiceType.FLEX_INTERNAL ? BackendServiceType.FLEX_INTERNAL : BackendServiceType.FLEX_EXTERNAL,
          access: ServiceFileProcessor._buildAccess(options)
        };

        if (!isNullOrUndefined(source.description)) {
          data.description = source.description;
        }

        this.servicesService.create(data, (err, result) => {
          if (err) {
            return done(err);
          }

          service = result;
          next();
        });
      },
      (next) => {
        if (isNullOrUndefined(source.environments) || isEmpty(source.environments)) {
          return setImmediate(next);
        }

        this._createSvcEnvs(service.id, flexType, source.environments, next);
      }
    ], (err) => {
      if (err) {
        return done(err);
      }

      done(null, service);
    });
  }

  _createFlexSvcEnv(serviceId, svcEnvName, source, done) {
    const data = {
      name: svcEnvName,
      secret: source.secret,
      environmentVariables: source.environmentVariables
    };

    if (source.description) {
      data.description = source.description;
    }

    if (source.host) {
      data.host = source.host;
    }

    if (source.runtime) {
      data.runtime = CLIRuntimeToAPIRuntime[source.runtime];
    }

    this.servicesService.createSvcEnv(serviceId, data, (err, svcEnv) => {
      if (err) {
        return done(err);
      }

      const result = { svcEnvId: svcEnv.id };
      this._deployToSvcEnv(serviceId, svcEnv.id, svcEnv.name, source, (err) => {
        if (err) {
          return done(err);
        }

        done(null, result);
      });
    });
  }

  _createRapidDataSvcEnv(serviceId, svcEnvName, source, done) {
    const data = Object.assign({}, source);
    data.name = svcEnvName;
    this.servicesService.createSvcEnv(serviceId, data, done);
  }

  _createRapidDataService(source, options, done) {
    let service;

    async.series([
      (next) => {
        const data = ServiceFileProcessor._buildRapidDataServiceObjectWoEnv(source, options.name, {}, options.domainId, options.domainType);
        this.servicesService.create(data, (err, createdService) => {
          if (err) {
            return next(err);
          }

          service = createdService;
          next();
        });
      },
      (next) => {
        this._createSvcEnvs(service.id, rapidDataType, source.environments, next);
      }
    ], (err) => {
      if (err) {
        return done(err);
      }

      done(null, service);
    });
  }

  _updateService(source, options, done) {
    const serviceType = source.type;
    if (serviceType === ConfigFiles.ServiceType.FLEX_INTERNAL || serviceType === ConfigFiles.ServiceType.FLEX_EXTERNAL) {
      this._modifyFlexService(source, options, done);
    } else {
      this._modifyRapidDataService(source, options, done);
    }
  }

  _modifyFlexService(source, options, done) {
    const serviceId = options.serviceId;
    let updateData;
    let jobId;

    async.series([
      (next) => {
        this.servicesService.getById(serviceId, (err, originalService) => {
          if (err) {
            return next(err);
          }

          const data = {
            name: source.name || originalService.name,
            type: originalService.type // cannot be updated but required from the backend
          };

          if (!isNullOrUndefined(source.description)) {
            data.description = source.description;
          }

          updateData = Object.assign({}, data, { access: originalService.access });

          next();
        });
      },
      (next) => {
        this.servicesService.update(updateData, serviceId, next);
      },
      (next) => {
        this._modifySvcEnvs(serviceId, flexType, source.environments, next);
      }
    ], (err) => {
      if (err) {
        return done(err);
      }

      done(null, { id: serviceId });
    });
  }

  _modifySvcEnvs(serviceId, serviceType, source, done) {
    if (isNullOrUndefined(source) || isEmpty(source)) {
      return setImmediate(done);
    }

    let groupedSvcEnvs = {};
    let originalSvcEnvs;

    async.series([
      (next) => {
        this.servicesService.getServiceEnvs(serviceId, (err, data) => {
          if (err) {
            return done(err);
          }

          originalSvcEnvs = data;
          groupedSvcEnvs = FileProcessorHelper.groupEntitiesPerOperationType(originalSvcEnvs, source);
          next();
        });
      },
      (next) => {
        this._updateSvcEnvs(serviceId, serviceType, originalSvcEnvs, groupedSvcEnvs[OperationType.UPDATE], next);
      },
      (next) => {
        this._createSvcEnvs(serviceId, serviceType, groupedSvcEnvs[OperationType.CREATE], next);
      }
    ], done);
  }

  _createSvcEnvs(serviceId, serviceType, svcEnvs, done) {
    if (isNullOrUndefined(svcEnvs) || isEmpty(svcEnvs)) {
      return setImmediate(done);
    }

    const svcEnvNames = Object.keys(svcEnvs);
    async.eachSeries(
      svcEnvNames,
      (currEnvName, next) => {
        const currEnv = svcEnvs[currEnvName];
        this.cliManager.log(LogLevel.INFO, `Creating svc env: ${currEnvName}`);
        if (serviceType === flexType) {
          this._createFlexSvcEnv(serviceId, currEnvName, currEnv, next);
        } else {
          this._createRapidDataSvcEnv(serviceId, currEnvName, currEnv, next);
        }
      },
      done
    );
  }

  _updateSvcEnvs(serviceId, serviceType, originalSvcEnvs, svcEnvsToUpdate, done) {
    async.eachSeries(
      svcEnvsToUpdate,
      (currEnv, next) => {
        const currName = Object.keys(currEnv)[0];
        const originalSvcEnv = originalSvcEnvs.find(x => x.name === currName);
        this.cliManager.log(LogLevel.INFO, `Updating svc env: ${currName}`);
        if (serviceType === flexType) {
          this._updateFlexSvcEnv(serviceId, currName, originalSvcEnv, currEnv[currName], next);
        } else {
          this._updateRapidDataSvcEnv(serviceId, currName, originalSvcEnv, currEnv[currName], next);
        }
      },
      done
    );
  }

  _deployToSvcEnv(serviceId, svcEnvId, svcEnvName, source, done) {
    const dir = source.sourcePath;
    if (!dir) {
      return setImmediate(done);
    }

    const deployOpts = {
      serviceId,
      svcEnvId,
      dir,
      schemaVersion: this.cliManager.config.defaultSchemaVersion
    };
    this.servicesService.deployFlexProject(deployOpts, (err, id) => {
      if (err) {
        if (err.name === Errors.DeploymentVersionTooLow.NAME) {
          this.cliManager.log(LogLevel.WARN, `Skipped deploy for svc env with identifier '${svcEnvId}'(${svcEnvName}): ${err.message}`);
          return done();
        }

        return done(err);
      }

      const infoMsg = `Initiated deploy to service with identifier '${serviceId}' and svc env with identifier '${svcEnvId}'(${svcEnvName}). Job ID: ${id}`;
      this.cliManager.log(LogLevel.INFO, infoMsg);
      done(null, id);
    });
  }

  _updateFlexSvcEnv(serviceId, svcEnvName, originalSvcEnv, svcEnvToUpdate, done) {
    let updateData = {};
    updateData.name = svcEnvToUpdate.name || svcEnvName;
    if (svcEnvToUpdate.runtime) {
      svcEnvToUpdate.runtime = CLIRuntimeToAPIRuntime[svcEnvToUpdate.runtime];
    }

    updateData = Object.assign(updateData, svcEnvToUpdate);
    delete updateData.sourcePath;
    updateData.host = updateData.host || originalSvcEnv.host;

    this.servicesService.updateSvcEnv(serviceId, originalSvcEnv.id, updateData, (err, result) => {
      if (err) {
        return done(err);
      }

      this._deployToSvcEnv(serviceId, originalSvcEnv.id, result.name, svcEnvToUpdate, done);
    });
  }

  _updateRapidDataSvcEnv(serviceId, svcEnvName, originalSvcEnv, svcEnvToUpdate, done) {
    let updateData = {};
    updateData.name = svcEnvToUpdate.name || svcEnvName;
    updateData = Object.assign(updateData, svcEnvToUpdate);
    this.servicesService.updateSvcEnv(serviceId, originalSvcEnv.id, updateData, done);
  }

  _modifyRapidDataService(source, options, done) {
    const serviceId = options.serviceId;
    let updateData;

    async.series([
      (next) => {
        this.servicesService.getById(serviceId, (err, originalService) => {
          if (err) {
            return next(err);
          }

          updateData = ServiceFileProcessor._buildRapidDataServiceObjectWoEnv(source, null, originalService);

          next();
        });
      },
      (next) => {
        this.servicesService.update(updateData, serviceId, next);
      },
      (next) => {
        this._modifySvcEnvs(serviceId, rapidDataType, source.environments, next);
      }
    ], (err) => {
      if (err) {
        return done(err);
      }

      done(null, { id: serviceId });
    });
  }

  static _buildRapidDataServiceObjectWoEnv(source, name, original, domainId, domainType) {
    original = original || {}; // eslint-disable-line no-param-reassign
    const result = getObjectByOmitting(source, ['configType', 'schemaVersion', 'type', 'environments']);
    result.name = name || source.name || original.name;

    if (source.baseConfig) {
      result.baseConfig = source.baseConfig;
      result.type = BackendServiceType.REST;
    } else {
      result.type = ConfigFiles.ConfigToBackendServiceType[source.type];
      if (source.type === ConfigFiles.ServiceType.DATA_DIRECT) {
        result.baseConfig = ConfigFiles.BaseConfigType.DATA_DIRECT;
      } else if (source.type === ConfigFiles.ServiceType.POKIT_DOK) {
        result.baseConfig = ConfigFiles.BaseConfigType.POKIT_DOK;
      }
    }

    if (isNullOrUndefined(result.description)) {
      delete result.description;
    }

    if (original.access) { // it's an update, hence access cannot change
      result.access = Object.assign({}, original.access);
    } else {
      result.access = ServiceFileProcessor._buildAccess({ domainId, domainType });
    }

    return result;
  }
}

module.exports = ServiceFileProcessor;
