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

const { AllowedPermissionsOperations, AppOptionsName, BackendCollectionPermission, CollectionHook, DomainTypes,
  EntityType, EnvOptionsName, LogLevel, OperationType } = require('./Constants');
const { Endpoints, getCustomNotFoundError, getObjectByOmitting, isEmpty, isNullOrUndefined } = require('./Utils');

class EnvFileProcessor {
  constructor(options) {
    this.cliManager = options.cliManager;
    this.environmentsService = options.environmentsService;
    this.collectionsService = options.collectionsService;
    this.blService = options.businessLogicService;
    this.rolesService = options.rolesService;
    this.groupsService = options.groupsService;
    this.pushService = options.pushService;
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
        this._createRoles(env, source.roles, next);
      },
      (next) => {
        this._createGroups(env, source.groups, next);
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
        this._modifyPushSettings(source.push, envId, next);
      }
    ], (err) => {
      if (err) {
        return done(err);
      }

      done(null, { id: envId });
    });
  }

  _createRoles(env, sourceRoles, done) {
    if (isNullOrUndefined(sourceRoles) || isEmpty(sourceRoles)) {
      return setImmediate(done);
    }

    const roles = Object.keys(sourceRoles);
    async.each(
      roles,
      (roleName, next) => {
        const currentRole = sourceRoles[roleName];
        const data = Object.assign({ name: roleName }, currentRole);
        this.cliManager.log(LogLevel.INFO, `Creating role: ${data.name}`);
        this.rolesService.create(data, env, next);
      },
      done
    );
  }

  _createGroups(env, sourceGroups, done) {
    if (isNullOrUndefined(sourceGroups) || isEmpty(sourceGroups)) {
      return setImmediate(done);
    }

    const groups = Object.keys(sourceGroups);
    async.each(
      groups,
      (groupId, next) => {
        const currentGroup = sourceGroups[groupId];
        const data = Object.assign({ _id: groupId }, currentGroup);
        if (Array.isArray(currentGroup.groups)) {
          data.groups = EnvFileProcessor._buildChildGroups(currentGroup.groups);
        }

        this.cliManager.log(LogLevel.INFO, `Creating group: ${data._id}`);
        this.groupsService.create(data, env, next);
      },
      done
    );
  }

  static _buildChildGroups(childGroups) {
    const result = childGroups.map((x) => {
      return {
        _type: 'KinveyRef',
        _collection: 'group',
        _id: x
      };
    });

    return result;
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
        if (currentEndpoint.schedule && !currentEndpoint.schedule.interval) {
          currentEndpoint.schedule = currentEndpoint.schedule.start;
        }

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
        let envData = { name: env.name };
        envData = Object.assign(envData, source.settings);
        this.cliManager.log(LogLevel.INFO, `Updating environment: ${envData.name}`);
        this.environmentsService.update(envId, envData, next);
      },
      (next) => {
        this._modifyCommonCode(source.commonCode, env, next);
      },
      (next) => {
        this._modifyRoles(source.roles, env, next);
      },
      (next) => {
        this._modifyGroups(source.groups, env, next);
      },
      (next) => {
        this._modifyCollections(source.collections, env, next);
      },
      (next) => {
        this._createOrUpdateCollectionHooks(env, source.collectionHooks, next);
      },
      (next) => {
        this._modifyEndpoints(source.customEndpoints, env, next);
      },
      (next) => {
        this._modifyPushSettings(source.push, envId, next);
      }
    ], (err) => {
      if (err) {
        return done(err);
      }

      done(null, { id: envId });
    });
  }

  _groupCollectionsPerOperationType(originalCollections, collections) {
    const groupedEntities = this._groupEntitiesPerOperationType(originalCollections, collections);
    if (!isEmpty(groupedEntities[OperationType.DELETE])) {
      const collToDel = groupedEntities[OperationType.DELETE].filter(x => x !== 'user' && x !== '_blob');
      groupedEntities[OperationType.DELETE] = collToDel;
    }

    return groupedEntities;
  }

  _modifyRoles(roles = {}, env, done) {
    if (isEmpty(roles)) {
      return setImmediate(done);
    }

    let groupedRoles;

    async.series([
      (next) => {
        this.rolesService.getAll(env, (err, originalRoles) => {
          if (err) {
            return next(err);
          }

          try {
            groupedRoles = this._groupRolesPerOperationType(originalRoles, roles);
          } catch (ex) {
            return next(ex);
          }

          next();
        });
      },
      (next) => {
        this._createRoles(env, groupedRoles[OperationType.CREATE], next);
      },
      (next) => {
        this._updateRoles(env, groupedRoles[OperationType.UPDATE], next);
      }
    ], done);
  }

  _updateRoles(env, sourceRoles, done) {
    if (isNullOrUndefined(sourceRoles) || isEmpty(sourceRoles)) {
      return setImmediate(done);
    }

    async.each(
      sourceRoles,
      (currentRole, next) => {
        this.cliManager.log(LogLevel.INFO, `Updating role: ${currentRole._id}(${currentRole.name})`);
        this.rolesService.update(currentRole._id, currentRole, env, next);
      },
      done
    );
  }

  /**
   * Groups roles to modify per operation type that should be executed. Throws if it encounters a role that is expected
   * to be updated by name but several roles with the same name already exist.
   * @param {Array} originalRoles Already existing roles from the backend.
   * @param {Object} rolesToModify Contains role names/IDs where each identifier holds an object defining the role.
   * @returns {Object}
   * @private
   */
  // eslint-disable-next-line
  _groupRolesPerOperationType(originalRoles, rolesToModify) {
    const entitiesToCreate = {};
    const entitiesToUpdate = [];

    const groupedRoles = this._groupRolesByIdentifiers(originalRoles);
    const originalRolesGroupedById = groupedRoles.byId;
    const originalRolesGroupedByName = groupedRoles.byName;
    const originalRolesDuplicatedNames = groupedRoles.duplicatedNames;

    const originalRolesIds = Object.keys(originalRolesGroupedById);
    const originalRolesNames = Object.keys(originalRolesGroupedByName);
    const rolesToModifyIdentifiers = Object.keys(rolesToModify);

    rolesToModifyIdentifiers.forEach((modifiedRoleIdentifier) => {
      const isIdAndExists = originalRolesIds.includes(modifiedRoleIdentifier);
      const isNameAndExists = originalRolesNames.includes(modifiedRoleIdentifier);
      const roleExists = isIdAndExists || isNameAndExists;
      if (roleExists) {
        let id;
        if (isIdAndExists) {
          id = modifiedRoleIdentifier;
        } else {
          if (originalRolesDuplicatedNames.includes(modifiedRoleIdentifier)) {
            throw new Error(`Cannot update role '${modifiedRoleIdentifier}' using the name as identifier as there is more than one role with this name.`);
          }

          id = originalRolesGroupedByName[modifiedRoleIdentifier]._id;
        }

        const name = rolesToModify[modifiedRoleIdentifier].name || originalRolesGroupedById[id].name;
        entitiesToUpdate.push(Object.assign({ _id: id, name }, rolesToModify[modifiedRoleIdentifier]));
      } else {
        entitiesToCreate[modifiedRoleIdentifier] = rolesToModify[modifiedRoleIdentifier];
      }
    });

    return {
      [OperationType.CREATE]: entitiesToCreate,
      [OperationType.UPDATE]: entitiesToUpdate
    };
  }

  // eslint-disable-next-line
  _groupRolesByIdentifiers(roles) {
    const result = {
      byId: {},
      byName: {},
      duplicatedNames: []
    };

    roles.forEach((role) => {
      result.byId[role._id] = role;
      const name = role.name;
      if (result.byName[name]) {
        result.duplicatedNames.push(name);
      }

      result.byName[name] = role;
    });

    return result;
  }

  _modifyCollections(collections = {}, env, done) {
    let groupedEntities;
    const envId = env.id;
    let existingRolesGrouped;

    async.series([
      (next) => {
        this.collectionsService.getAll(envId, (err, originalCollections) => {
          if (err) {
            return next(err);
          }

          groupedEntities = this._groupCollectionsPerOperationType(originalCollections, collections);
          next();
        });
      },
      (next) => {
        this.rolesService.getAll(env, (err, roles) => {
          if (err) {
            return next(err);
          }

          existingRolesGrouped = this._groupRolesByIdentifiers(roles);
          next();
        });
      },
      // we're not removing entities, at least for now
      // (next) => {
      //   this._deleteCollections(collectionsToDelete, envId, next);
      // },
      (next) => {
        this._updateCollections(groupedEntities[OperationType.UPDATE], env, existingRolesGrouped, next);
      },
      (next) => {
        this._createCollections(groupedEntities[OperationType.CREATE], env, existingRolesGrouped, next);
      }
    ], done);
  }

  _modifyGroups(groups = {}, env, done) {
    if (isEmpty(groups)) {
      return setImmediate(done);
    }

    let groupedGroups;

    async.series([
      (next) => {
        this.groupsService.getAll(env, (err, originalGroups) => {
          if (err) {
            return next(err);
          }

          try {
            groupedGroups = this._groupRolesPerOperationType(originalGroups, groups, '_id');
          } catch (ex) {
            return next(ex);
          }

          next();
        });
      },
      (next) => {
        this._createGroups(env, groupedGroups[OperationType.CREATE], next);
      },
      (next) => {
        this._updateGroups(env, groupedGroups[OperationType.UPDATE], next);
      }
    ], done);
  }

  _updateGroups(env, groups, done) {
    if (isEmpty(groups)) {
      return setImmediate(done);
    }

    async.each(
      groups,
      (currentGroup, next) => {
        if (Array.isArray(currentGroup.groups)) {
          currentGroup.groups = EnvFileProcessor._buildChildGroups(currentGroup.groups);
        }

        this.cliManager.log(LogLevel.INFO, `Updating group: ${currentGroup._id}`);
        this.groupsService.update(currentGroup._id, currentGroup, env, next);
      },
      done
    );
  }

  /**
   * Modifies endpoints - create or update.
   * @param {Object} endpoints Contains endpoints names along with data to modify.
   * @param {Object} env
   * @param done
   * @returns {*}
   * @private
   */
  _modifyEndpoints(endpoints = {}, env, done) {
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

          next();
        });
      },
      (next) => {
        this._updateEndpoints(groupedEntities[OperationType.UPDATE], env, next);
      },
      (next) => {
        this._createEndpoints(env, groupedEntities[OperationType.CREATE], next);
      }
    ], done);
  }

  _updateEndpoints(endpointsToUpdate, env, done) {
    const envId = env.id;

    async.each(
      endpointsToUpdate,
      (endpoint, next) => {
        const nameIdentifier = Object.keys(endpoint)[0];
        this.cliManager.log(LogLevel.INFO, `Updating endpoint: ${nameIdentifier}`);
        const updateData = endpoint[nameIdentifier];
        updateData.name = updateData.name || nameIdentifier;
        if (updateData.schedule && !updateData.schedule.interval) {
          updateData.schedule = updateData.schedule.start;
        }

        this._setServiceOnHookOrEndpoint(updateData, nameIdentifier, env, (err) => {
          if (err) {
            return next(err);
          }

          this.blService.updateEndpoint(nameIdentifier, updateData, envId, next);
        });
      },
      done
    );
  }

  _modifyPushSettings(sourcePush, envId, done) {
    if (isEmpty(sourcePush)) {
      return setImmediate(done);
    }

    async.series([
      (next) => {
        const androidSettings = sourcePush.android;
        if (isEmpty(androidSettings)) {
          return setImmediate(next);
        }

        const data = {
          projectId: androidSettings.senderId,
          apiKey: androidSettings.apiKey
        };
        this.cliManager.log(LogLevel.INFO, 'Modifying Android push configuration');
        this.pushService.configureAndroidSettings(envId, data, next);
      },
      (next) => {
        const iosSettings = sourcePush.ios;
        if (isEmpty(iosSettings)) {
          return setImmediate(next);
        }

        this.cliManager.log(LogLevel.INFO, 'Modifying iOS push configuration');
        this.pushService.configureIosSettings(envId, iosSettings, next);
      }
    ], done);
  }

  /**
   * Groups modifiedEntities per operation type: create, update, delete.
   * @param {Array} originalEntities A list of strings or a list of objects with a 'name' property or other property of choice.
   * @param {Object} modifiedEntities Keys on first level are the entity's name. Ex.: { "someName": {...}, "anyName": {...} }
   * @param {String} [prop] Property to group by. Defaults to 'name'.
   * @returns {Object}
   * @private
   */
  // eslint-disable-next-line
  _groupEntitiesPerOperationType(originalEntities, modifiedEntities, prop = 'name') {
    const entitiesToDelete = [];
    const entitiesToCreate = {};
    const entitiesToUpdate = [];

    const entityNamesToModify = Object.keys(modifiedEntities);

    originalEntities.forEach((originalEntity) => {
      let originalName;
      if (originalEntity && isNullOrUndefined(originalEntity[prop])) {
        originalName = originalEntity;
      } else {
        originalName = originalEntity[prop];
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
        if (!isNullOrUndefined(x[prop])) {
          return x[prop] === entityName;
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
        this.blService.getCommonCode(envId, null, null, (err, originalCommonModules) => {
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
    const collBlacklist = ['type', 'service', 'serviceObject'];
    const filteredData = getObjectByOmitting(sourceCollection, collBlacklist);
    return filteredData;
  }

  /**
   * @param {Object} collections Object of objects. On first level each object contains one property that is the name of
   * the collection.
   * @param {Object} env
   * @param {Object} groupedOriginalRoles Grouped roles from the backend.
   * @param done
   * @returns {*}
   * @private
   */
  _createCollections(collections, env, groupedOriginalRoles, done) {
    if (isEmpty(collections)) {
      return setImmediate(done);
    }

    const collectionNames = Object.keys(collections);
    async.each(
      collectionNames,
      (collName, next) => {
        this._createCollection(collName, collections[collName], env, groupedOriginalRoles, next);
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
          serviceObjectName: sourceColl.serviceObject,
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
        source.host = data.backingServers[0]._id;
        source.sdkHandlerName = source.handlerName;
      }

      done();
    });
  }

  _findServiceFromSource(source, name, env, done) {
    if (source.type !== 'external') {
      return setImmediate(done);
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

  _createCollection(collName, sourceColl, env, groupedOriginalRoles, done) {
    this.cliManager.log(LogLevel.INFO, `Creating collection: ${collName}`);

    const collData = EnvFileProcessor._getFilteredCollectionData(sourceColl);
    collData.name = collName;

    try {
      EnvFileProcessor.setPermissionsOnCollection(collData, groupedOriginalRoles);
    } catch (ex) {
      return done(ex);
    }

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
    const endpoint = Endpoints.servicesByDomain(domain, entityId, this.cliManager.config.defaultSchemaVersion);
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

  _updateCollections(collections, env, groupedOriginalRoles, done) {
    const envId = env.id;

    async.each(
      collections,
      (coll, next) => {
        const collName = Object.keys(coll)[0];
        this.cliManager.log(LogLevel.INFO, `Updating collection: ${collName}`);
        const sourceColl = coll[collName];
        const data = EnvFileProcessor._getFilteredCollectionData(sourceColl);
        data.name = data.name || collName;

        try {
          EnvFileProcessor.setPermissionsOnCollection(data, groupedOriginalRoles);
        } catch (ex) {
          return next(ex);
        }

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

  /**
   * Sets permissions on a collection in a backend accepted format. Modifies the collection object. Throws if the
   * specified role identifier does not exist or if it is a name and more than one role with this name exists.
   * @param {Object} collection
   * @param {Object} existingRoles Roles that exist on the backend.
   * @param {Object} existingRoles.byId Existing roles grouped by ID.
   * @param {Object} existingRoles.byName Existing roles grouped by name.
   * @param {Array} existingRoles.duplicatedNames A list of non-unique names.
   * @private
   */
  static setPermissionsOnCollection(collection, existingRoles) {
    const initialPermissions = collection.permissions;
    const isBasicPermissionsFormat = typeof initialPermissions === 'string';
    if (isBasicPermissionsFormat) {
      collection.permissions = BackendCollectionPermission[initialPermissions];
      return;
    }

    const transformedPermissions = {};
    AllowedPermissionsOperations.forEach((op) => { transformedPermissions[op] = []; });

    const rolesIdentifiers = Object.keys(initialPermissions);
    rolesIdentifiers.forEach((roleIdentifier) => {
      const isIdAndExists = Object.prototype.hasOwnProperty.call(existingRoles.byId, roleIdentifier);
      const isNameAndExists = Object.prototype.hasOwnProperty.call(existingRoles.byName, roleIdentifier);
      const isSystemRole = roleIdentifier === 'all-users';
      const roleExists = isIdAndExists || isNameAndExists || isSystemRole;
      const basicErrMsg = `Cannot set permissions on collection '${collection.name}'.`;
      if (!roleExists) {
        throw new Error(`${basicErrMsg} Role with identifier '${roleIdentifier}' not found.`);
      }

      let id;
      if (isIdAndExists || isSystemRole) {
        id = roleIdentifier;
      } else {
        if (existingRoles.duplicatedNames.includes(roleIdentifier)) {
          throw new Error(`${basicErrMsg} More than one role exists with name '${roleIdentifier}'.`);
        }

        id = existingRoles.byName[roleIdentifier]._id;
      }

      AllowedPermissionsOperations.forEach((op) => {
        if (Object.prototype.hasOwnProperty.call(initialPermissions[roleIdentifier], op)) {
          transformedPermissions[op].push({
            roleId: id,
            type: initialPermissions[roleIdentifier][op]
          });
        }
      });
    });

    collection.permissions = transformedPermissions;
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
