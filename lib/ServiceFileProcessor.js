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

const { BackendServiceType, ConfigFiles, DomainTypes, Errors, LogLevel, OperationType } = require('./Constants');
const FileProcessorHelper = require('./FileProcessorHelper');
const { getObjectByOmitting, getObjectByPicking, isEmpty, isNullOrUndefined } = require('./Utils');

class ServiceFileProcessor {
  constructor(options) {
    this.cliManager = options.cliManager;
    this.servicesService = options.servicesService;
  }

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

  _createFlexService(source, options, done) {
    let service;

    async.series([
      (next) => {
        const writers = {};
        if (options.domainType === DomainTypes.APP) {
          writers.apps = [options.domainId];
        } else {
          writers.organizations = [options.domainId];
        }

        const data = {
          name: options.name,
          type: source.type === ConfigFiles.ServiceType.FLEX_INTERNAL ? BackendServiceType.FLEX_INTERNAL : BackendServiceType.FLEX_EXTERNAL,
          access: {
            writers
          }
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
        if (isNullOrUndefined(source.environments) ||isEmpty(source.environments)) {
          return setImmediate(next);
        }

        this._createFlexSvcEnvs(service.id, source.environments, next);
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
      secret: source.secret
    };

    if (source.description) {
      data.description = source.description;
    }

    if (source.host) {
      data.host = source.host;
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

  _createRapidDataService(source, options, done) {
    let service;

    async.series([
      (next) => {
        const data = ServiceFileProcessor._buildRapidDataServiceObjectWoEnv(source, options.name);
        data.backingServers = ServiceFileProcessor._buildRapidDataServiceEnvs(source);

        this.servicesService.create(data, options.domainId, options.domainType, (err, createdService) => {
          if (err) {
            return next(err);
          }

          service = createdService;
          next();
        });
      },
      (next) => {
        const envName = Object.keys(source.environments)[0];
        const hasMapping = !isNullOrUndefined(source.environments[envName].mapping);
        if (!hasMapping) {
          return setImmediate(() => next(null, service));
        }

        const updateData = cloneDeep(service);
        if (isNullOrUndefined(updateData.description)) { // backend may return null for value but it won't accept it
          delete updateData.description;
        }

        updateData.backingServers = ServiceFileProcessor._buildRapidDataServiceEnvs(source, service);
        this.servicesService.update(updateData, service.id, next);
      }
    ], (err, results) => {
      if (err) {
        return done(err);
      }

      done(null, results.pop());
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
        // TODO: uncomment when backend is fixed - service update doesn't remove svc envs
        setImmediate(next);
        // this.servicesService.update(updateData, serviceId, next);
      },
      (next) => {
        this._modifyFlexSvcEnvs(serviceId, source.environments, next);
      }
    ], (err) => {
      if (err) {
        return done(err);
      }

      done(null, { id: serviceId, jobId });
    });
  }

  _modifyFlexSvcEnvs(serviceId, source, done) {
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
        this._updateFlexSvcEnvs(serviceId, originalSvcEnvs, groupedSvcEnvs[OperationType.UPDATE], next);
      },
      (next) => {
        this._createFlexSvcEnvs(serviceId, groupedSvcEnvs[OperationType.CREATE], next);
      }
    ], done);
  }

  _createFlexSvcEnvs(serviceId, svcEnvs, done) {
    if (isNullOrUndefined(svcEnvs) || isEmpty(svcEnvs)) {
      return setImmediate(done);
    }

    const svcEnvNames = Object.keys(svcEnvs);
    async.eachSeries(
      svcEnvNames,
      (currEnvName, next) => {
        this.cliManager.log(LogLevel.INFO, `Creating svc env: ${currEnvName}`);
        this._createFlexSvcEnv(serviceId, currEnvName, svcEnvs[currEnvName], next);
      },
      done
    );
  }

  _updateFlexSvcEnvs(serviceId, originalSvcEnvs, svcEnvsToUpdate, done) {
    async.eachSeries(
      svcEnvsToUpdate,
      (currEnv, next) => {
        const currName = Object.keys(currEnv)[0];
        const originalSvcEnv = originalSvcEnvs.find(x => x.name === currName);
        this.cliManager.log(LogLevel.INFO, `Updating svc env: ${currName}`);
        this._updateFlexSvcEnv(serviceId, currName, originalSvcEnv, currEnv[currName], next);
      },
      done
    );
  }

  _deployToSvcEnv(serviceId, svcEnvId, svcEnvName, source, done) {
    const dir = source.sourcePath;
    if (!dir) {
      return setImmediate(done);
    }

    this.servicesService.deployFlexProject(dir, serviceId, svcEnvId, this.cliManager.config.defaultSchemaVersion, (err, id) => {
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
    let updateData = getObjectByPicking(originalSvcEnv, ['type', 'access']);
    updateData.name = svcEnvToUpdate.name || svcEnvName;
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
          updateData.backingServers = ServiceFileProcessor._buildRapidDataServiceEnvs(source, originalService);

          next();
        });
      },
      (next) => {
        this.servicesService.update(updateData, serviceId, next);
      }
    ], (err) => {
      if (err) {
        return done(err);
      }

      done(null, { id: serviceId });
    });
  }

  static _buildRapidDataServiceObjectWoEnv(source, name, original = {}) {
    const result = getObjectByOmitting(source, ['configType', 'schemaVersion', 'type', 'environments']);
    result.name = name || source.name || original.name;
    result.type = ConfigFiles.ConfigToBackendServiceType[source.type];
    if (source.type === ConfigFiles.ServiceType.DATA_DIRECT) {
      result.baseConfig = 'dataDirect';
    }

    if (isNullOrUndefined(result.description)) {
      delete result.description;
    }

    return result;
  }

  static _buildRapidDataServiceEnvs(source, original) {
    // when we switch to v3, environments may not be there as they won't be mandatory
    const envName = Object.keys(source.environments)[0];
    const defaultEnvSettings = getObjectByOmitting(source.environments[envName], 'mapping');
    defaultEnvSettings.name = envName;
    const allBackingServers = original ? cloneDeep(original.backingServers) : [];
    allBackingServers[0] = defaultEnvSettings;

    if (!original) { // then we are 'creating' a service, so no need to search for env id and set mapping
      return allBackingServers;
    }

    const defaultEnvId = original.backingServers[0]._id;
    allBackingServers[0]._id = defaultEnvId;
    const defaultEnvMapping = cloneDeep(source.environments[envName].mapping);
    ServiceFileProcessor._setEnvOnMapping(defaultEnvId, defaultEnvMapping);
    allBackingServers[0].mapping = defaultEnvMapping;

    return allBackingServers;
  }

  static _setEnvOnMapping(serviceEnvId, mapping) {
    const serviceObjectNames = Object.keys(mapping);
    serviceObjectNames.forEach((name) => {
      mapping[name].backingServer = serviceEnvId;
    });
  }
}

module.exports = ServiceFileProcessor;
