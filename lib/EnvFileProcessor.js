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

const { AppOptionsName, CollectionHook, DomainTypes, EndpointFieldNames, EntityType, EnvOptionsName, LogLevel, OperationType } = require('./Constants');
const { Endpoints, getCustomNotFoundError, getObjectByOmitting, isEmpty, isNullOrUndefined } = require('./Utils');

class EnvFileProcessor {
  constructor(options) {
    this.cliManager = options.cliManager;
    this.environmentsService = options.environmentsService;
    this.collectionsService = options.collectionsService;
    this.blService = options.businessLogicService;
  }

  process(options, done) {
    const operationType = options.operation;
    const source = options.parsedData;
    if (operationType === OperationType.CREATE) {
      this._createEnv(source, options, done);
    } else if (operationType === OperationType.UPDATE) {
      this._updateEnv(source, options, done);
    } else {
      return setImmediate(() => { done(new Error(`Operation type not supported: ${operationType}`)); });
    }
  }

  _createEnv(source, options, done) {
    let envId;
    let env;

    async.series([
      (next) => {
        let envData = { name: options.name };
        if (source.settings) {
          envData = Object.assign(envData, source.settings);
        }

        this.cliManager.log(LogLevel.INFO, `Creating environment: ${envData.name}`);

        this.environmentsService.create(envData, options[AppOptionsName.APP], (err, data) => {
          if (err) {
            return next(err);
          }

          envId = data.id;
          next();
        });
      },
      (next) => {
        this.environmentsService.getById(envId, (err, data) => {
          if (err) {
            return next(err);
          }

          env = data;
          next();
        });
      },
      (next) => {
        this._createCommonCode(envId, source.commonCode, next);
      },
      (next) => {
        this._modifyCollections(source.collections, env, next);
      },
      (next) => {
        // hooks must be created when collections creation has completed
        this._createOrUpdateCollectionHooks(env, source.collectionHooks, next);
      },
      (next) => {
        this._createEndpoints(env, source.customEndpoints, next);
      },
      (next) => {
        this._modifyEndpoints(source.scheduledCode, env, true, next);
      }
    ], (err) => {
      if (err) {
        return done(err);
      }

      done(null, { id: envId });
    });
  }

  _createCommonCode(envId, sourceCommonCode, done) {
    if (isNullOrUndefined(sourceCommonCode) || isEmpty(sourceCommonCode)) {
      return setImmediate(done);
    }

    const commonCodeNames = Object.keys(sourceCommonCode);
    async.each(
      commonCodeNames,
      (codeName, next) => {
        const currentCommonCode = sourceCommonCode[codeName];
        const data = Object.assign({ name: codeName }, currentCommonCode);
        this.cliManager.log(LogLevel.INFO, `Creating common code: ${data.name}`);
        this.blService.createCommonCode(data, envId, next);
      },
      done
    );
  }

  _createOrUpdateCollectionHooks(env, sourceHooks, done) {
    if (isNullOrUndefined(sourceHooks) || isEmpty(sourceHooks)) {
      return setImmediate(done);
    }

    const collNames = Object.keys(sourceHooks);
    async.each(
      collNames,
      (collName, next) => {
        const hooksPerCollection = Object.assign({}, sourceHooks[collName]);
        const hookNames = Object.keys(hooksPerCollection);

        async.each(
          hookNames,
          (hookName, cb) => {
            const currentHook = hooksPerCollection[hookName];
            this._setServiceOnHookOrEndpoint(currentHook, hookName, env, (err) => {
              if (err) {
                return cb(err);
              }

              const mappedHookName = CollectionHook[hookName];
              if (isNullOrUndefined(mappedHookName)) {
                return cb(new Error(`Invalid hook name specified for ${collName} collection: ${hookName}`));
              }

              this.cliManager.log(LogLevel.INFO, `Creating/updating hook for ${collName} collection: ${hookName}`);
              this.blService.createOrUpdateHook(currentHook, env.id, collName, mappedHookName, cb);
            });
          },
          next
        );
      },
      done
    );
  }

  _createEndpoints(env, sourceEndpoints, done) {
    if (isNullOrUndefined(sourceEndpoints) || isEmpty(sourceEndpoints)) {
      return setImmediate(done);
    }

    const endpointNames = Object.keys(sourceEndpoints);
    async.each(
      endpointNames,
      (name, next) => {
        const currentEndpoint = Object.assign({}, sourceEndpoints[name]);
        this._setServiceOnHookOrEndpoint(currentEndpoint, name, env, (err) => {
          if (err) {
            return next(err);
          }

          this.cliManager.log(LogLevel.INFO, `Creating endpoint: ${name}`);
          currentEndpoint.name = name;
          this.blService.createEndpoint(currentEndpoint, env.id, next);
        });
      },
      done
    );
  }

  _updateEnv(source, options, done) {
    const env = options[EnvOptionsName.ENV];
    const envId = env.id;

    async.series([
      (next) => {
        // TODO: cli-55 where will be the 'name' - in settings or on first level
        let envData = { name: env.name };
        envData = Object.assign(envData, source.settings);
        this.cliManager.log(LogLevel.INFO, `Updating environment: ${envData.name}`);
        this.environmentsService.update(envId, envData, next);
      },
      (next) => {
        this._modifyCommonCode(source.commonCode, env, next);
      },
      (next) => {
        this._modifyCollections(source.collections, env, next);
      },
      (next) => {
        this._createOrUpdateCollectionHooks(env, source.collectionHooks, next);
      },
      (next) => {
        this._modifyEndpoints(source.customEndpoints, env, false, next);
      },
      (next) => {
        this._modifyEndpoints(source.scheduledCode, env, true, next);
      }
    ], (err) => {
      if (err) {
        return done(err);
      }

      done(null, { id: envId });
    });
  }

  _modifyCollections(collections = {}, env, done) {
    let groupedEntities;
    const envId = env.id;

    async.series([
      (next) => {
        this.collectionsService.getAll(envId, (err, originalCollections) => {
          if (err) {
            return next(err);
          }

          groupedEntities = this._groupEntitiesPerOperationType(originalCollections, collections);
          next();
        });
      },
      // we're not removing entities, at least for now
      // (next) => {
      //   this._deleteCollections(collectionsToDelete, envId, next);
      // },
      (next) => {
        this._updateCollections(groupedEntities[OperationType.UPDATE], env, next);
      },
      (next) => {
        this._createCollections(groupedEntities[OperationType.CREATE], env, next);
      }
    ], done);
  }

  /**
   * Modifies endpoints based on what data is provided and what data already exists in the backend.
   * @param {Object} endpoints Contains endpoints names along with data to modify.
   * @param {Object} env
   * @param {Boolean} isScheduledCode Must be true if existing endpoints should be scheduled.
   * @param done
   * @returns {*}
   * @private
   */
  _modifyEndpoints(endpoints = {}, env, isScheduledCode, done) {
    // remove this check if we start deleting endpoints that are not included in config file
    if (isEmpty(endpoints)) {
      return setImmediate(done);
    }

    let groupedEntities;
    let existingEndpoints;
    const envId = env.id;

    async.series([
      (next) => {
        this.blService.getEndpoints(envId, null, (err, originalEndpoints) => {
          if (err) {
            return next(err);
          }

          existingEndpoints = originalEndpoints;
          groupedEntities = this._groupEntitiesPerOperationType(originalEndpoints, endpoints);
          if (isScheduledCode && !isEmpty(groupedEntities[OperationType.CREATE])) {
            const errMsg = `Cannot schedule non-existing endpoints: ${Object.keys(groupedEntities[OperationType.CREATE]).join(', ')}`;
            return next(new Error(errMsg));
          }

          next();
        });
      },
      (next) => {
        this._updateEndpoints(groupedEntities[OperationType.UPDATE], existingEndpoints, env, isScheduledCode, next);
      },
      (next) => {
        this._createEndpoints(env, groupedEntities[OperationType.CREATE], next);
      }
    ], done);
  }

  _updateEndpoints(endpointsToUpdate, allExistingEndpoints, env, isScheduledCode, done) {
    const envId = env.id;

    async.each(
      endpointsToUpdate,
      (endpoint, next) => {
        const nameIdentifier = Object.keys(endpoint)[0];
        this.cliManager.log(LogLevel.INFO, `Updating endpoint: ${nameIdentifier}`);
        const existingEndpoint = allExistingEndpoints.find(x => x.name === nameIdentifier);
        const updateData = endpoint[nameIdentifier];
        updateData.name = updateData.name || nameIdentifier;
        let modifiedUpdateData = {};
        if (isScheduledCode) {
          if (isNullOrUndefined(updateData.start)) {
            return next(new Error(`Missing required property for endpoint "${nameIdentifier}": start`));
          }

          let schedule;
          if (!isNullOrUndefined(updateData.interval)) {
            schedule = {
              interval: updateData.interval,
              start: updateData.start
            };
          } else {
            schedule = updateData.start;
          }

          // the endpoint cannot be scheduled by sending only the schedule property
          // the backend might return null values but it won't accept them
          EndpointFieldNames.forEach((fieldName) => {
            if (!isNullOrUndefined(existingEndpoint[fieldName])) {
              modifiedUpdateData[fieldName] = existingEndpoint[fieldName];
            }
          });

          modifiedUpdateData.schedule = schedule;
        } else {
          modifiedUpdateData = Object.assign({}, updateData);
          if (!isNullOrUndefined(existingEndpoint) && !isNullOrUndefined(existingEndpoint.schedule)) {
            modifiedUpdateData.schedule = existingEndpoint.schedule;
          }
        }

        this._setServiceOnHookOrEndpoint(modifiedUpdateData, nameIdentifier, env, (err) => {
          if (err) {
            return next(err);
          }

          this.blService.updateEndpoint(nameIdentifier, modifiedUpdateData, envId, next);
        });
      },
      done
    );
  }

  /**
   * Groups modifiedEntities per operation type: create, update, delete.
   * @param {Array} originalEntities A list of strings or a list of objects with a 'name' property.
   * @param {Object} modifiedEntities Keys on first level are the entity's name. Ex.: { "someName": {...}, "anyName": {...} }
   * @returns {Object}
   * @private
   */
  // eslint-disable-next-line
  _groupEntitiesPerOperationType(originalEntities, modifiedEntities) {
    const entitiesToDelete = [];
    const entitiesToCreate = {};
    const entitiesToUpdate = [];

    const entityNamesToModify = Object.keys(modifiedEntities);

    originalEntities.forEach((originalEntity) => {
      let originalName;
      if (originalEntity && isNullOrUndefined(originalEntity.name)) {
        originalName = originalEntity;
      } else {
        originalName = originalEntity.name;
      }

      if (!entityNamesToModify.includes(originalName)) {
        entitiesToDelete.push(originalName);
      } else {
        entitiesToUpdate.push({
          [originalName]: modifiedEntities[originalName]
        });
      }
    });

    entityNamesToModify.forEach((entityName) => {
      const entityAlreadyExists = originalEntities.find((x) => {
        if (!isNullOrUndefined(x.name)) {
          return x.name === entityName;
        }

        return x === entityName;
      });

      if (!entityAlreadyExists) {
        entitiesToCreate[entityName] = modifiedEntities[entityName];
      }
    });

    return {
      [OperationType.CREATE]: entitiesToCreate,
      [OperationType.UPDATE]: entitiesToUpdate,
      [OperationType.DELETE]: entitiesToDelete
    };
  }

  _modifyCommonCode(commonCode = {}, env, done) {
    const envId = env.id;
    let groupedEntities;

    async.series([
      (next) => {
        this.blService.getCommonCode(envId, null, (err, originalCommonModules) => {
          if (err) {
            return next(err);
          }

          groupedEntities = this._groupEntitiesPerOperationType(originalCommonModules, commonCode);
          next();
        });
      },
      (next) => {
        this._updateCommonCode(groupedEntities[OperationType.UPDATE], env, next);
      },
      (next) => {
        this._createCommonCode(envId, groupedEntities[OperationType.CREATE], next);
      }
    ], done);
  }

  _updateCommonCode(commonCodeModules, env, done) {
    const envId = env.id;

    async.each(
      commonCodeModules,
      (commonModule, next) => {
        const moduleName = Object.keys(commonModule)[0];
        this.cliManager.log(LogLevel.INFO, `Updating common code module: ${moduleName}`);
        const sourceModule = commonModule[moduleName];
        sourceModule.name = sourceModule.name || moduleName;
        this.blService.updateCommonCode(moduleName, sourceModule, envId, next);
      },
      done
    );
  }

  static _getFilteredCollectionData(sourceCollection) {
    const collBlacklist = ['type', 'service', 'handlerName'];
    const filteredData = getObjectByOmitting(sourceCollection, collBlacklist);
    return filteredData;
  }

  /**
   * @param {Object} collections Object of objects. On first level each object contains one property that is the name of
   * the collection.
   * @param {Object} env
   * @param done
   * @returns {*}
   * @private
   */
  _createCollections(collections, env, done) {
    if (isEmpty(collections)) {
      return setImmediate(done);
    }

    const collectionNames = Object.keys(collections);
    async.each(
      collectionNames,
      (collName, next) => {
        this._createCollection(collName, collections[collName], env, next);
      },
      done
    );
  }

  /**
   * Sets proper dataLink property to a collection object if the collection is external.
   * @param {Object} sourceColl
   * @param {Object} targetColl
   * @param {Object} env
   * @param done
   * @returns {*}
   * @private
   */
  _setServiceOnCollection(sourceColl, targetColl, env, done) {
    this._findServiceFromSource(sourceColl, targetColl.name, env, (err, data) => {
      if (err) {
        return done(err);
      }

      if (data) {
        targetColl.dataLink = {
          serviceObjectName: sourceColl.handlerName,
          id: data.id,
          backingServerId: data.backingServers[0]._id
        };
      }

      done();
    });
  }

  _setServiceOnHookOrEndpoint(source, name, env, done) {
    this._findServiceFromSource(source, name, env, (err, data) => {
      if (err) {
        return done(err);
      }

      if (data) {
        source.host = data.backingServers[0].host;
        source.sdkHandlerName = source.handlerName;
      }

      done();
    });
  }

  _findServiceFromSource(source, name, env, done) {
    if (source.type !== 'external') {
      return setImmediate(done);
    }

    if (isNullOrUndefined(source.service) || isNullOrUndefined(source.handlerName)) {
      return setImmediate(() => { done(new Error(`Missing required properties for "${name}": service and/or handlerName.`)); });
    }

    const domain = isNullOrUndefined(env.app) ? DomainTypes.ORG : DomainTypes.APP;
    const domainId = env.app || env.org;
    this._getService(source.service, domain, domainId, (err, data) => {
      if (err) {
        return done(err);
      }

      if (!data.backingServers || !data.backingServers[0] || isNullOrUndefined(data.backingServers[0]._id)) {
        return done(new Error(`No backing servers found in service: ${source.service}`));
      }

      done(null, data);
    });
  }

  _createCollection(collName, sourceColl, env, done) {
    this.cliManager.log(LogLevel.INFO, `Creating collection: ${collName}`);

    if (sourceColl.type !== 'internal' && sourceColl.type !== 'external') {
      return setImmediate(() => { done(new Error(`Collection type different than 'internal/external': ${sourceColl.type}`)); });
    }

    const collData = EnvFileProcessor._getFilteredCollectionData(sourceColl);
    collData.name = collName;

    async.series([
      (next) => {
        this._setServiceOnCollection(sourceColl, collData, env, next);
      },
      (next) => {
        const envId = env.id;
        this.collectionsService.create(collData, envId, next);
      }
    ], done);
  }

  _getService(serviceIdentifier, domain, entityId, done) {
    const domainType = domain === 'app' ? 'apps' : 'organizations';
    const endpoint = Endpoints.servicesByDomain(domainType, entityId, null, this.cliManager.config.defaultSchemaVersion);
    this.cliManager.sendRequest({ endpoint }, (err, data) => {
      if (err) {
        return done(err);
      }

      const service = data.find(x => x.id === serviceIdentifier || x.name === serviceIdentifier);
      if (!service) {
        return done(getCustomNotFoundError(EntityType.SERVICE, serviceIdentifier));
      }

      done(null, service);
    });
  }

  _updateCollections(collections, env, done) {
    const envId = env.id;

    async.each(
      collections,
      (coll, next) => {
        const collName = Object.keys(coll)[0];
        this.cliManager.log(LogLevel.INFO, `Updating collection: ${collName}`);
        const sourceColl = coll[collName];
        const data = EnvFileProcessor._getFilteredCollectionData(sourceColl);
        data.name = data.name || collName;
        this._setServiceOnCollection(sourceColl, data, env, (err) => {
          if (err) {
            return next(err);
          }

          this.collectionsService.update(envId, collName, data, next);
        });
      },
      done
    );
  }

  _deleteCollections(collections, envId, done) {
    async.each(
      collections,
      (collName, next) => {
        this.cliManager.log(LogLevel.INFO, `Deleting collection ${collName}`);
        this.collectionsService.deleteById(envId, collName, next);
      },
      done
    );
  }
}

module.exports = EnvFileProcessor;