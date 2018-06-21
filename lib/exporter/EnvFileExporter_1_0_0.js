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
const fs = require('fs');
const _ = require('lodash');

const { ActiveItemType, AppOptionsName, CommonOptionsNames, ConfigType, EntityType, EnvOptionsName, Errors, Mapping, OperationType, BackendCollectionPermission, DomainTypes } = require('../Constants');
const KinveyError = require('../KinveyError');

class EnvFileExporter_1_0_0 {
  constructor(options) {
    this.environmentsService = options.environmentsService;
    this.applicationsService = options.applicationsService;
    this.collectionsService = options.collectionsService;
    this.businessLogicService = options.businessLogicService;
    this.rolesService = options.rolesService;
    this.groupsService = options.groupsService;
    this.pushService = options.pushService;
    this.servicesService = options.servicesService;
  }

  export(options, done) {
    var self = this;

    const filename = options.filename;
    const env = options.env;
    const envId = env.id;

    let services = [];

    let config = {};

    config.schemaVersion = '1.0.0';

    config.configType = "environment";

    async.series([
      (next) => {
        this.applicationsService.getByIdOrName(env.app, function(err, app){
          //console.log(JSON.stringify(app, null, 4));
          if (err) return next(err);
          self.servicesService.getAllByDomainType(DomainTypes.APP, { id: env.app }, function(errAppServices, appServices) {
            //console.log(JSON.stringify(appServices, null, 4));
            if (errAppServices) return next(errAppServices);
            services = services.concat(appServices);

            self.servicesService.getAllByDomainType(DomainTypes.ORG, {id: app.organizationId }, function(errOrgServices, orgServices) {
              //console.log(JSON.stringify(orgServices, null, 4));
              if (errOrgServices) return next(errOrgServices);
              services = services.concat(orgServices);
              //console.log(JSON.stringify(services, null, 4));
              next();
            });
          })
        });
      },
      (next) => {
        this._exportSettings(env, function(err, settings){
          config.settings = settings;
        });
        next(null);
      },
      (next) => {
        this._exportCollections(env, function(err, result) {
          if (err) return next(err);
          config.collections = result;
          next();
        })
      },
      (next) => {
        this._exportCollectionHooks(envId, services, function(err, result) {
          if (err) return next(err);
          config.collectionHooks = result;
          next();
        })
      },
      (next) => {
        this._exportCustomEndpoints(envId, services, function(err, result) {
          if (err) return next(err);
          config.customEndpoints = result;
          next();
        })
      },
      (next) => {
        this._exportCommonCode(envId, function(err, result) {
          if (err) return next(err);
          config.commonCode = result;
          next();
        })
      },
      (next) => {
        this._exportRoles(env, function(err, result) {
          if (err) return next(err);
          config.roles = result;
          next();
        })
      },
      (next) => {
        this._exportGroups(env, function(err, result) {
          if (err) return next(err);
          //config.groups = result;
          next();
        })
      },
      (next) => {
        this._exportPushSettings(envId, function(err, result) {
          if (err) return next(err);
          config.push = result;
          next();
        })
      }
    ], (err) => {
      if (err) {
        return done(err);
      } else {
        done(null, config);
      }
    });
  }

  _exportSettings(env, done) {
    const settings = {
      emailVerification: env.emailVerification,
      apiVersion: env.apiVersion
    };

    if (settings.emailVerification) {
      if (settings.emailVerification.since === null) delete settings.emailVerification.since;
    }

    done(null, settings);
  }

  _exportCollections(env, done) {
    const self = this;
    const envId = env.id;
    let apiRoles;

    let result = {};
    async.waterfall([
      (next) => {
        //Get all roles, as we need them for exporting collection permissions
        self.rolesService.getAll(env, next);
      },
      (roles, next) => {
        apiRoles = roles;
        self.collectionsService.getAll(envId, next);
      },
      (collections, next) => {
        //console.log(JSON.stringify(collections, null, 2));
        async.forEachSeries(
          collections,
          (collection, iter) => {
            if (self._mustExportCollection(collection.name)) {
              self._transformCollection(collection, apiRoles, (err, configCollection) => {
                result[collection.name] = configCollection;
                iter();
              })
            } else {
              iter();
            }
          },
          next
        );
      }
    ], (err) => {
      done(err, result);
    });
  }

  _exportCollectionHooks(envId, services, done) {
    const self = this;
    let result = {};

    async.waterfall([
        (next) => {
          self.businessLogicService.getCollectionHooks(envId, next);
        },
        (collectionHooks, callback) => {
          //console.log(JSON.stringify(collectionHooks, null, 2));
          async.forEachSeries(
            collectionHooks,
            (collectionHook, nextCollection) => {
              const collectionName = collectionHook.collectionName;
              let hooksObject = {};

              const hooks = collectionHook.hooks;
              async.forEachSeries(
                hooks,
                (hook, nextHook) => {
                  self._transformCollectionHook(hook, services, (err, transformedHook) => {
                    if (err) return nextHook(err);

                    hooksObject[hook.name] = transformedHook;
                    nextHook();
                  })
                },
                (err) => {
                  if (err) return nextCollection(err);

                  result[collectionName] = hooksObject;
                  nextCollection();
                }
              );
            },
            callback
          );
        }
      ],
      (err) => {
        done(err, result);
      });
  }

  _exportCustomEndpoints(envId, services, done) {
    const self = this;

    let result = {};

    async.waterfall([
        (next) => {
          self.businessLogicService.getEndpoints(envId, null, next);
        },
        (customEndpoints, callback) => {
          //console.log(JSON.stringify(customEndpoints, null, 2));
          async.forEachSeries(
            customEndpoints,
            (customEndpoint, nextEndpoint) => {
              self._transformCustomEndpoint(customEndpoint, services, (err, transformedCustomEndpoint) => {
                if (err) return nextEndpoint(err);

                result[customEndpoint.name] = transformedCustomEndpoint;
                nextEndpoint();
              });
            },
            callback
          );
        }
      ],
      (err) => {
        done(err, result);
      });
  }

  _exportCommonCode(envId, done) {
    const self = this;
    let result = {};
    async.waterfall([
        (next) => {
          self.businessLogicService.getCommonCode(envId, null, '["code"]', next);
        },
        (commonCodeScripts, callback) => {
          //console.log(JSON.stringify(commonCodeScripts, null, 2));
          async.forEachSeries(
            commonCodeScripts,
            (commonCodeScript, nextScript) => {
              self._transformCommonCodeScript(commonCodeScript, (err, transformedCommonCodeScript) => {
                if (err) return nextScript(err);

                result[commonCodeScript.name] = transformedCommonCodeScript;
                nextScript();
              })
            },
            callback
          );
        }
      ],
      (err) => {
        done(err, result);
      });
  }

  _exportRoles(env, done) {
    const self = this;
    let result = {};
    async.waterfall([
        (next) => {
          self.rolesService.getAll(env, next);
        },
        (roles, callback) => {
          //console.log(JSON.stringify(roles, null, 2));
          async.forEachSeries(
            roles,
            (role, nextRole) => {
              self._transformRole(role, (err, transformedRole) => {
                if (err) return nextRole(err);
                let roleKey = role.name.replace(/\W/g, '-');
                result[roleKey] = transformedRole;
                nextRole();
              })
            },
            callback
          );
        }
      ],
      (err) => {
        done(err, result);
      });
  }

  _exportGroups(env, done) {
    const self = this;
    let result = {};
    async.waterfall([
        (next) => {
          self.groupsService.getAll(env, next);
        },
        (groups, callback) => {
          //console.log(JSON.stringify(groups, null, 2));
          async.forEachSeries(
            groups,
            (group, nextGroup) => {
              self._transformGroup(group, (err, transformedGroup) => {
                if (err) return nextGroup(err);
                result[group._id] = transformedGroup;
                nextGroup();
              })
            },
            callback
          );
        }
      ],
      (err) => {
        done(err, result);
      });
  }

  _exportPushSettings(envId, done) {
    const self = this;
    let result = {};
    async.waterfall([
        (next) => {
          self.pushService.getPushSettings(envId, next);
        },
        (pushSettings, callback) => {
          //console.log(JSON.stringify(pushSettings, null, 2));

          //Remove iOS push settings - we do not support those currently
          delete pushSettings.ios;

          if (!pushSettings.android) {
            delete pushSettings.android;
          } else {
            //Convert projectId to senderId for Android settings
            pushSettings.android.senderId = pushSettings.android.projectId;
            delete pushSettings.android.projectId;
          }

          result = pushSettings;
          callback();
        }
      ],
      (err) => {
        done(err, result);
      });
  }

  _mustExportCollection(collectionName) {
    return true;
  }

  _transformPermissionsObject(configPermissions, apiPermissions, permissionsType) {
    if (apiPermissions[permissionsType]) {
      apiPermissions[permissionsType].forEach(function(item){
        if (!configPermissions[item.roleId]) configPermissions[item.roleId] = {};
        const permissionsString = _.findKey(BackendCollectionPermission, (it) => (it === item.type));
        configPermissions[item.roleId][permissionsType] = item.type;
      });
    }
  }

  _transformCollection(apiCollection, apiRoles, done) {
    const self = this;
    let configCollection = {};

    async.series([
      function transformTypeDlg(callback) {
        if (apiCollection.dataLink) {
          configCollection.type = 'external';
          //self.servicesService.getById(apiCollection.dataLink.id, function(err, service) {
            //if (err) return done(err);

            configCollection.service = apiCollection.dataLink.id;//service.name;
            configCollection.serviceObject = apiCollection.dataLink.serviceObjectName;

            console.log(JSON.stringify(apiCollection, null, 2));

            callback(null, configCollection);
          //})
        } else {
          configCollection.type = 'internal';
          callback(null);
        }
      },
      function transformPermissionsDlg(callback) {
        const apiPermissions = apiCollection.permissions;
        if (apiPermissions) {
          if (_.isString(apiPermissions)) {
            //The permissions are set using the quick form, not by role
            const permissionsString = _.findKey(BackendCollectionPermission, (item) => (item === apiPermissions));
            configCollection.permissions = permissionsString;
          } else {
            //The permissions are set by role, we need to transform them to the format used in config files

            let configPermissionsById = {};
            self._transformPermissionsObject(configPermissionsById, apiPermissions, 'create');
            self._transformPermissionsObject(configPermissionsById, apiPermissions, 'read');
            self._transformPermissionsObject(configPermissionsById, apiPermissions, 'update');
            self._transformPermissionsObject(configPermissionsById, apiPermissions, 'delete');

            //console.log(JSON.stringify(configPermissionsById, null, 2));
            //We now have the permissions by role ID. We need to replace role ID with role name
            let configPermissionsByName = {};
            for (var roleId in configPermissionsById) {
              var roleObject = apiRoles.find((role) => (role._id === roleId));
              if (roleObject) {
                var roleName = roleObject.name;
                configPermissionsByName[roleName] = configPermissionsById[roleId];
              } else {
                configPermissionsByName[roleId] = configPermissionsById[roleId];
              }
            }

            configCollection.permissions = configPermissionsByName;
          }
          callback(null);
        } else {
          callback(null);
        }
      }
    ],
    function(err) {
      done(err, configCollection);
    });
  }

  _transformCollectionHook(apiCollectionHook, services, done) {
    let hookObject = {};

    if (apiCollectionHook.host) {
      const service = this._getServiceByBackingServerId(apiCollectionHook.host, services);
      const serviceIdentifier = service ? service.name : '[unknown]';
      hookObject.type = 'external';
      hookObject.service = serviceIdentifier;
      hookObject.handlerName = apiCollectionHook.sdkHandlerName;

      return done(null, hookObject);
    } else {
      hookObject.type = 'internal';
      let filename;
      if (this.storeCodeAsFile) {
        filename = "hooks/" + apiCollectionHook.name + ".json";
      }
      this._transformCode(apiCollectionHook.code, hookObject, filename, (err, result) => done(err, hookObject));
    }
  }

  _transformCustomEndpoint(apiCustomEndpoint, services, done) {
    let endpointObject = {};

    if (apiCustomEndpoint.schedule) {
      if (_.isString(apiCustomEndpoint.schedule)) {
        endpointObject.schedule = {
          start: apiCustomEndpoint.schedule
        };
      } else {
        endpointObject.schedule = apiCustomEndpoint.schedule;
      }
    }

    if (apiCustomEndpoint.host) {
      const service = this._getServiceByBackingServerId(apiCustomEndpoint.host, services);
      const serviceIdentifier = service ? service.name : '[unknown]';
      endpointObject.type = 'external';
      endpointObject.service = serviceIdentifier;
      endpointObject.handlerName = apiCustomEndpoint.sdkHandlerName;
      return done(null, endpointObject);
    } else {
      endpointObject.type = 'internal';
      let filename;
      if (this.storeCodeAsFile) {
        filename = "endpoints/" + apiCustomEndpoint.name + ".json";
      }
      this._transformCode(apiCustomEndpoint.code, endpointObject, filename, (err, result) => done(err, endpointObject));
    }
  }

  _getServiceByBackingServerId(backingServerId, services) {
    for (let i = 0; i < services.length; i++) {
      const service = services[i];
      for (var j = 0; j < service.backingServers.length; j++) {
        const backingServer = service.backingServers[j];
        if (backingServer._id === backingServerId) {
          return service;
        }
      }
    }
    return null;
  }

  _transformCommonCodeScript(apiCommonCode, done) {
    let endpointObject = {};
    let filename;
    if (this.storeCodeAsFile) {
      filename = "common/" + apiCommonCode.name + ".json";
    }
    this._transformCode(apiCommonCode.code, endpointObject, filename, (err, result) => done(err, endpointObject));
  }

  _transformCode(sourceCodeString, targetObject, filename, done) {
    if (filename) {
      targetObject.codeFile = filename;
      ensurePathExists(filename);
      fs.writeFile(filename, sourceCodeString, done);
    } else {
      targetObject.code = sourceCodeString;
      done();
    }
  }

  _transformRole(apiRole, done) {
    let configRole = {};

    configRole.name = apiRole.name;
    configRole.description = apiRole.description;

    done(null, configRole);
  }

  _transformGroup(apiGroup, done) {
    let configGroup = {};

    configGroup.name = apiGroup.name;
    configGroup.description = apiGroup.description;

    if (apiGroup.groups && apiGroup.groups.length) {
      configGroup.groups = [];
      apiGroup.groups.forEach(function(groupReference) {
        configGroup.groups.push(groupReference._id);
      });
    }

    done(null, configGroup);
  }
}

module.exports = EnvFileExporter_1_0_0;
