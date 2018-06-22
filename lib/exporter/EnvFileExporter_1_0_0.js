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
const isString = require('lodash.isstring');
const findKey = require('lodash.findkey');


const Utils = require('../Utils');

const { ActiveItemType, AppOptionsName, CommonOptionsNames, ConfigType, EntityType, EnvOptionsName, Errors, Mapping, OperationType, BackendCollectionPermission, DomainTypes } = require('../Constants');
const KinveyError = require('../KinveyError');

class EnvFileExporterV1 {
  constructor(options) {
    // TODO: change that to be supplied from the user
    this.storeCodeAsFile = true;

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
    const self = this;

    const env = options.env;
    const envId = env.id;
    let services = [];

    const config = {};
    config.schemaVersion = '1.0.0';
    config.configType = 'environment';

    async.series([
      (next) => {
        this.applicationsService.getByIdOrName(env.app, (err, app) => {
          if (err) return next(err);
          self.servicesService.getAllByDomainType(DomainTypes.APP, { id: env.app }, (errAppServices, appServices) => {
            if (errAppServices) return next(errAppServices);
            services = services.concat(appServices);

            if (!app.organizationId) {
              return setImmediate(next);
            }

            self.servicesService.getAllByDomainType(DomainTypes.ORG, { id: app.organizationId }, (errOrgServices, orgServices) => {
              if (errOrgServices) return next(errOrgServices);
              services = services.concat(orgServices);
              next();
            });
          });
        });
      },
      (next) => {
        EnvFileExporterV1._exportSettings(env, (err, settings) => {
          config.settings = settings;
        });
        next(null);
      },
      (next) => {
        this._exportCollections(env, (err, result) => {
          if (err) return next(err);
          config.collections = result;
          next();
        });
      },
      (next) => {
        this._exportCollectionHooks(envId, services, (err, result) => {
          if (err) return next(err);
          config.collectionHooks = result;
          next();
        });
      },
      (next) => {
        this._exportCustomEndpoints(envId, services, (err, result) => {
          if (err) return next(err);
          config.customEndpoints = result;
          next();
        });
      },
      (next) => {
        this._exportCommonCode(envId, (err, result) => {
          if (err) return next(err);
          config.commonCode = result;
          next();
        });
      },
      (next) => {
        this._exportRoles(env, (err, result) => {
          if (err) return next(err);
          config.roles = result;
          next();
        });
      },
      (next) => {
        this._exportGroups(env, (err, result) => {
          if (err) return next(err);
          // config.groups = result;
          next();
        });
      },
      (next) => {
        this._exportPushSettings(envId, (err, result) => {
          if (err) return next(err);
          config.push = result;
          next();
        });
      }
    ], (err) => {
      if (err) {
        return done(err);
      }

      done(null, config);
    });
  }

  static _exportSettings(env, done) {
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

    const result = {};
    async.waterfall([
      (next) => {
        // Get all roles, as we need them for exporting collection permissions
        self.rolesService.getAll(env, next);
      },
      (roles, next) => {
        apiRoles = roles;
        self.collectionsService.getAll(envId, next);
      },
      (collections, next) => {
        async.forEachSeries(
          collections,
          (collection, iter) => {
            if (EnvFileExporterV1._mustExportCollection(collection.name)) {
              self._transformCollection(collection, apiRoles, (err, configCollection) => {
                result[collection.name] = configCollection;
                iter();
              });
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
    const result = {};

    async.waterfall([
      (next) => {
        self.businessLogicService.getCollectionHooks(envId, next);
      },
      (collectionHooks, callback) => {
        async.forEachSeries(
          collectionHooks,
          (collectionHook, nextCollection) => {
            const collectionName = collectionHook.collectionName;
            const hooksObject = {};

            const hooks = collectionHook.hooks;
            async.forEachSeries(
              hooks,
              (hook, nextHook) => {
                self._transformCollectionHook(hook, services, (err, transformedHook) => {
                  if (err) return nextHook(err);

                  hooksObject[hook.name] = transformedHook;
                  nextHook();
                });
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

    const result = {};

    async.waterfall([
      (next) => {
        self.businessLogicService.getEndpoints(envId, null, next);
      },
      (customEndpoints, callback) => {
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
    const result = {};
    async.waterfall([
      (next) => {
        self.businessLogicService.getCommonCode(envId, null, '["code"]', next);
      },
      (commonCodeScripts, callback) => {
        async.forEachSeries(
          commonCodeScripts,
          (commonCodeScript, nextScript) => {
            self._transformCommonCodeScript(commonCodeScript, (err, transformedCommonCodeScript) => {
              if (err) return nextScript(err);

              result[commonCodeScript.name] = transformedCommonCodeScript;
              nextScript();
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

  _exportRoles(env, done) {
    const self = this;
    const result = {};
    async.waterfall([
      (next) => {
        self.rolesService.getAll(env, next);
      },
      (roles, callback) => {
        async.forEachSeries(
          roles,
          (role, nextRole) => {
            EnvFileExporterV1._transformRole(role, (err, transformedRole) => {
              if (err) return nextRole(err);
              const roleKey = role.name.replace(/\W/g, '-');
              result[roleKey] = transformedRole;
              nextRole();
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

  _exportGroups(env, done) {
    const self = this;
    const result = {};
    async.waterfall([
      (next) => {
        self.groupsService.getAll(env, next);
      },
      (groups, callback) => {
        async.forEachSeries(
          groups,
          (group, nextGroup) => {
            EnvFileExporterV1._transformGroup(group, (err, transformedGroup) => {
              if (err) return nextGroup(err);
              result[group._id] = transformedGroup;
              nextGroup();
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

  _exportPushSettings(envId, done) {
    const self = this;
    let result = {};
    async.waterfall([
      (next) => {
        self.pushService.getPushSettings(envId, next);
      },
      (pushSettings, callback) => {
        // Remove iOS push settings - we do not support those currently
        delete pushSettings.ios;

        if (!pushSettings.android) {
          delete pushSettings.android;
        } else {
          // Convert projectId to senderId for Android settings
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

  static _mustExportCollection(collectionName) {
    return true;
  }

  static _transformPermissionsObject(configPermissions, apiPermissions, permissionsType) {
    if (apiPermissions[permissionsType]) {
      apiPermissions[permissionsType].forEach((item) => {
        if (!configPermissions[item.roleId]) configPermissions[item.roleId] = {};
        configPermissions[item.roleId][permissionsType] = item.type;
      });
    }
  }

  _transformCollection(apiCollection, apiRoles, done) {
    const self = this;
    const configCollection = {};

    async.series([
      function transformTypeDlg(callback) {
        if (apiCollection.dataLink) {
          configCollection.type = 'external';
          self.servicesService.getById(apiCollection.dataLink.id, (err, service) => {
            if (err) return done(err);

            configCollection.service = service.name;
            configCollection.serviceObject = apiCollection.dataLink.serviceObjectName;

            callback(null, configCollection);
          });
        } else {
          configCollection.type = 'internal';
          callback(null);
        }
      },
      function transformPermissionsDlg(callback) {
        const apiPermissions = apiCollection.permissions;
        if (apiPermissions) {
          if (isString(apiPermissions)) {
            // The permissions are set using the quick form, not by role
            const permissionsString = findKey(BackendCollectionPermission, item => item === apiPermissions);
            configCollection.permissions = permissionsString;
          } else {
            // The permissions are set by role, we need to transform them to the format used in config files
            const configPermissionsById = {};
            EnvFileExporterV1._transformPermissionsObject(configPermissionsById, apiPermissions, 'create');
            EnvFileExporterV1._transformPermissionsObject(configPermissionsById, apiPermissions, 'read');
            EnvFileExporterV1._transformPermissionsObject(configPermissionsById, apiPermissions, 'update');
            EnvFileExporterV1._transformPermissionsObject(configPermissionsById, apiPermissions, 'delete');

            // We now have the permissions by role ID. We need to replace role ID with role name
            const configPermissionsByName = {};
            for (const roleId in configPermissionsById) {
              const roleObject = apiRoles.find(role => role._id === roleId);
              if (roleObject) {
                const roleName = roleObject.name;
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
    (err) => {
      done(err, configCollection);
    });
  }

  _transformCollectionHook(apiCollectionHook, services, done) {
    const hookObject = {};

    if (apiCollectionHook.host) {
      const service = EnvFileExporterV1._getServiceByBackingServerId(apiCollectionHook.host, services);
      const serviceIdentifier = service ? service.name : '[unknown]';
      hookObject.type = 'external';
      hookObject.service = serviceIdentifier;
      hookObject.handlerName = apiCollectionHook.sdkHandlerName;

      done(null, hookObject);
    } else {
      hookObject.type = 'internal';
      let filename;
      if (this.storeCodeAsFile) {
        filename = 'hooks/' + apiCollectionHook.name + '.js';
      }
      EnvFileExporterV1._transformCode(apiCollectionHook.code, hookObject, filename, (err, result) => done(err, hookObject));
    }
  }

  _transformCustomEndpoint(apiCustomEndpoint, services, done) {
    const endpointObject = {};

    if (apiCustomEndpoint.schedule) {
      if (isString(apiCustomEndpoint.schedule)) {
        endpointObject.schedule = {
          start: apiCustomEndpoint.schedule
        };
      } else {
        endpointObject.schedule = apiCustomEndpoint.schedule;
      }
    }

    if (apiCustomEndpoint.host) {
      const service = EnvFileExporterV1._getServiceByBackingServerId(apiCustomEndpoint.host, services);
      const serviceIdentifier = service ? service.name : '[unknown]';
      endpointObject.type = 'external';
      endpointObject.service = serviceIdentifier;
      endpointObject.handlerName = apiCustomEndpoint.sdkHandlerName;
      done(null, endpointObject);
    } else {
      endpointObject.type = 'internal';
      let filename;
      if (this.storeCodeAsFile) {
        filename = 'endpoints/' + apiCustomEndpoint.name + '.js';
      }
      EnvFileExporterV1._transformCode(apiCustomEndpoint.code, endpointObject, filename, err => done(err, endpointObject));
    }
  }

  static _getServiceByBackingServerId(backingServerId, services) {
    for (let i = 0; i < services.length; i += 1) {
      const service = services[i];
      for (let j = 0; j < service.backingServers.length; j += 1) {
        const backingServer = service.backingServers[j];
        if (backingServer._id === backingServerId) {
          return service;
        }
      }
    }
    return null;
  }

  _transformCommonCodeScript(apiCommonCode, done) {
    const endpointObject = {};
    let filename;
    if (this.storeCodeAsFile) {
      filename = 'common/' + apiCommonCode.name + '.js';
    }
    EnvFileExporterV1._transformCode(apiCommonCode.code, endpointObject, filename, err => done(err, endpointObject));
  }

  static _transformCode(sourceCodeString, targetObject, filename, done) {
    if (filename) {
      targetObject.codeFile = filename;
      Utils.mkdirp(filename);
      fs.writeFile(filename, sourceCodeString, done);
    } else {
      targetObject.code = sourceCodeString;
      done();
    }
  }

  static _transformRole(apiRole, done) {
    const configRole = {};

    configRole.name = apiRole.name;
    configRole.description = apiRole.description;

    done(null, configRole);
  }

  static _transformGroup(apiGroup, done) {
    const configGroup = {};

    configGroup.name = apiGroup.name;
    configGroup.description = apiGroup.description;

    if (apiGroup.groups && apiGroup.groups.length) {
      configGroup.groups = [];
      apiGroup.groups.forEach((groupReference) => {
        configGroup.groups.push(groupReference._id);
      });
    }

    done(null, configGroup);
  }
}

module.exports = EnvFileExporterV1;