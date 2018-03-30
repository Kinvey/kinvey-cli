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

const { AppOptionsName, ConfigType, DomainTypes, EntityType, EnvOptionsName, LogLevel, OperationType } = require('./Constants');
const { Endpoints, getConfigTypeError, getCustomNotFoundError, getObjectByOmitting, isEmpty, isNullOrUndefined, readJSON } = require('./Utils');

class ConfigFileProcessor {
  constructor(options) {
    this.cliManager = options.cliManager;
    this.organizationsService = options.organizationsService;
    this.applicationsService = options.applicationsService;
    this.environmentsService = options.environmentsService;
    this.collectionsService = options.collectionsService;
  }

  _create(source, options, done) {
    if (source.configType === ConfigType.ENV) {
      return this._createEnv(source, options, done);
    }

    return setImmediate(() => { done(getConfigTypeError(source.configType)); });
  }

  _update(source, options, done) {
    if (source.configType === ConfigType.ENV) {
      return this._updateEnv(source, options, done);
    }

    return setImmediate(() => { done(getConfigTypeError(source.configType)); });
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
        this._createCollections(source.collections, env, next);
      }
    ], (err) => {
      if (err) {
        return done(err);
      }

      done(null, { id: envId });
    });
  }

  _updateEnv(source, options, done) {
    const envId = options[EnvOptionsName.ENV].id;

    async.series([
      (next) => {
        // TODO: cli-55 where will be the 'name' - in settings or on first level
        let envData = { name: options[EnvOptionsName.ENV].name };
        envData = Object.assign(envData, source.settings);
        this.cliManager.log(LogLevel.INFO, `Updating environment: ${envData.name}`);
        this.environmentsService.update(envId, envData, next);
      },
      (next) => {
        this._modifyCollections(source.collections, options[EnvOptionsName.ENV], next);
      }
    ], (err) => {
      if (err) {
        return done(err);
      }

      done(null, { id: envId });
    });
  }

  _modifyCollections(collections = {}, env, done) {
    const collectionsToDelete = [];
    const collectionsToCreate = {};
    const collectionsToUpdate = [];
    const envId = env.id;

    async.waterfall([
      (next) => {
        this.collectionsService.getAll(envId, next);
      },
      (originalCollections, next) => {
        const collNamesToModify = Object.keys(collections);
        // the '_blob' and 'user' collections will always be present - they can be 'deleted'(emptied), permissions can be updated
        originalCollections.forEach((originalColl) => {
          const originalName = originalColl.name;
          if (!collNamesToModify.includes(originalName)) {
            collectionsToDelete.push(originalName);
          } else {
            collectionsToUpdate.push({
              [originalName]: collections[originalName]
            });
          }
        });

        collNamesToModify.forEach((collName) => {
          const collAlreadyExists = originalCollections.find(x => x.name === collName);
          if (!collAlreadyExists) {
            collectionsToCreate[collName] = collections[collName];
          }
        });

        setImmediate(next);
      },
      (next) => {
        this._deleteCollections(collectionsToDelete, envId, next);
      },
      (next) => {
        this._updateCollections(collectionsToUpdate, env, next);
      },
      (next) => {
        this._createCollections(collectionsToCreate, env, next);
      }
    ], done);
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
    if (sourceColl.type !== 'external') {
      return setImmediate(done);
    }

    if (isNullOrUndefined(sourceColl.service) || isNullOrUndefined(sourceColl.handlerName)) {
      return setImmediate(() => { done(new Error(`Missing required properties for external collection "${targetColl.name}": service and/or handlerName.`)); });
    }

    const domain = isNullOrUndefined(env.app) ? DomainTypes.ORG : DomainTypes.APP;
    const domainId = env.app || env.org;
    this._getService(sourceColl.service, domain, domainId, (err, data) => {
      if (err) {
        return done(err);
      }

      // "dataLink": {
      //   "serviceObjectName": "CoolCollection",
      //     "id": "390da348eaf132e2b05bdc7026bbab3a",
      //     "backingServerId": "b865a7c29e074182bb3c1dbc463a1e51"
      // },
      if (!data.backingServers || !data.backingServers[0] || isNullOrUndefined(data.backingServers[0]._id)) {
        return done(new Error(`No backing servers found in service: ${sourceColl.service}`));
      }

      targetColl.dataLink = {
        serviceObjectName: sourceColl.handlerName,
        id: data.id,
        backingServerId: data.backingServers[0]._id
      };

      done();
    });
  }

  _createCollection(collName, sourceColl, env, done) {
    const isSystemColl = collName === '_blob' || collName === 'user';
    if (isSystemColl) {
      return setImmediate(done);
    }

    this.cliManager.log(LogLevel.INFO, `Creating collection: ${collName}`);

    if (sourceColl.type !== 'internal' && sourceColl.type !== 'external') {
      return setImmediate(() => { done(new Error(`Collection type different than 'internal/external': ${sourceColl.type}`)); });
    }

    const collData = ConfigFileProcessor._getFilteredCollectionData(sourceColl);
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

  // TODO: cli-55 Move this?
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
        const data = ConfigFileProcessor._getFilteredCollectionData(sourceColl);
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

  /**
   * Processes a config file.
   * @param {Object} options
   * @param {String} options.file File path
   * @param {Constants.OperationType} options.operationType
   * @param {Constants.ConfigType} options.configType - The expected config type.
   * @param {String} [options.name] - Name of entity to create.
   * @param done
   */
  process(options, done) {
    async.waterfall([
      (next) => {
        readJSON(options.file, next);
      },
      (parsedData, next) => {
        const expectedConfigType = options.configType;
        if (expectedConfigType !== parsedData.configType) {
          const errMsg = `You have specified the wrong type of config file. Expected: ${expectedConfigType}`;
          return setImmediate(() => next(new Error(errMsg)));
        }

        const operationType = options.operation;
        if (operationType === OperationType.CREATE) {
          this._create(parsedData, options, next);
        } else if (operationType === OperationType.UPDATE) {
          this._update(parsedData, options, next);
        } else {
          return setImmediate(() => { next(new Error(`Operation type not supported: ${operationType}`)); });
        }
      }
    ], done);
  }
}

module.exports = ConfigFileProcessor;
