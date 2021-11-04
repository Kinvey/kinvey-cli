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
const path = require('path');
const isString = require('lodash.isstring');
const findKey = require('lodash.findkey');

const { BackendCollectionPermission, DomainTypes, AllowedPermissionsOperations, LogLevel } = require('../Constants');
const { isEmpty, isNullOrUndefined, mkdirp, writeConfigFile } = require('../Utils');

class EnvFileExporterV1 {
  constructor(options) {
    this.cliManager = options.cliManager;
    this.applicationsService = options.applicationsService;
    this.collectionsService = options.collectionsService;
    this.businessLogicService = options.businessLogicService;
    this.rolesService = options.rolesService;
    this.groupsService = options.groupsService;
    this.pushService = options.pushService;
    this.servicesService = options.servicesService;
  }

  export(options, done) {
    this.storeCodeAsFile = true;
    let writeToFile = true;
    if (!isNullOrUndefined(options.storeCodeAsFile)) {
      this.storeCodeAsFile = options.storeCodeAsFile;
    }

    if (!isNullOrUndefined(options.writeToFile)) {
      writeToFile = options.writeToFile;
    }

    let filepath = '';
    let dirname = '';
    if (writeToFile) {
      filepath = path.resolve(options.filename);
      dirname = path.dirname(filepath);
    }

    const env = options.env;
    const envId = env.id;
    let services = [];

    const config = {};
    config.schemaVersion = '1.0.0';
    config.configType = 'environment';

    this.cliManager.log(LogLevel.INFO, `Starting export for environment: ${env.name}(${env.id})`);

    async.series([
      (next) => {
        this.cliManager.log(LogLevel.DEBUG, 'Getting all services...');
        this.applicationsService.getByIdOrName(env.app, (err, app) => {
          if (err) return next(err);
          const includeSvcEnvs = true;
          this.servicesService.getAllByDomainType(app, includeSvcEnvs, (errAppServices, data) => {
            if (errAppServices) return next(errAppServices);
            services = data;
            next();
          });
        });
      },
      (next) => {
        this.cliManager.log(LogLevel.INFO, 'Exporting environment settings...');
        EnvFileExporterV1._exportSettings(env, (err, settings) => {
          config.settings = settings;
          next(err);
        });
      },
      (next) => {
        this.cliManager.log(LogLevel.INFO, 'Exporting collections...');
        this._exportCollections(env, services, (err, result) => {
          if (err) return next(err);
          config.collections = result;
          next();
        });
      },
      (next) => {
        this.cliManager.log(LogLevel.INFO, 'Exporting collection hooks...');
        this._exportCollectionHooks(envId, services, dirname, (err, result) => {
          if (err) return next(err);
          config.collectionHooks = result;
          next();
        });
      },
      (next) => {
        this.cliManager.log(LogLevel.INFO, 'Exporting custom endpoints...');
        this._exportCustomEndpoints(envId, services, dirname, (err, result) => {
          if (err) return next(err);
          config.customEndpoints = result;
          next();
        });
      },
      (next) => {
        this.cliManager.log(LogLevel.INFO, 'Exporting common code...');
        this._exportCommonCode(envId, dirname, (err, result) => {
          if (err) return next(err);
          config.commonCode = result;
          next();
        });
      },
      (next) => {
        this.cliManager.log(LogLevel.INFO, 'Exporting roles...');
        this._exportRoles(env, (err, result) => {
          if (err) return next(err);
          config.roles = result;
          next();
        });
      },
      (next) => {
        this.cliManager.log(LogLevel.INFO, 'Exporting groups...');
        this._exportGroups(env, (err, result) => {
          if (err) return next(err);
          config.groups = result;
          next();
        });
      },
      (next) => {
        this.cliManager.log(LogLevel.INFO, 'Exporting push settings...');
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

      if (writeToFile) {
        // Write the config file
        this.cliManager.log(LogLevel.INFO, `Writing configuration to file: ${filepath}`);
        return writeConfigFile(filepath, config, done);
      }

      done(null, config);
    });
  }

  static _exportSettings(env, done) {
    const settings = {
      emailVerification: env.emailVerification,
      apiVersion: env.apiVersion,
      passwordReset: env.passwordReset
    };

    if (settings.emailVerification) {
      if (settings.emailVerification.since === null) delete settings.emailVerification.since;
    }

    done(null, settings);
  }

  _exportCollections(env, apiServices, done) {
    const envId = env.id;
    let apiRoles;

    const result = {};
    async.waterfall([
      (next) => {
        // Get all roles, as we need them for exporting collection permissions
        this.rolesService.getAll(env, next);
      },
      (roles, next) => {
        apiRoles = roles;
        this.collectionsService.getAll(envId, next);
      },
      (collections, next) => {
        async.forEachSeries(
          collections,
          (collection, iter) => {
            EnvFileExporterV1._transformCollection(collection, apiRoles, apiServices, (err, configCollection) => {
              if (err) return iter(err);

              result[collection.name] = configCollection;
              iter();
            });
          },
          next
        );
      }
    ], (err) => {
      done(err, result);
    });
  }

  _exportCollectionHooks(envId, services, dirname, done) {
    let result = {};

    async.waterfall([
      (next) => {
        this.businessLogicService.getCollectionHooks(envId, next);
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
                this._transformCollectionHook(hook, collectionName, services, dirname, (err, transformedHook) => {
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
      if (isEmpty(result)) result = undefined;
      done(err, result);
    });
  }

  _exportCustomEndpoints(envId, services, dirname, done) {
    let result = {};

    async.waterfall([
      (next) => {
        this.businessLogicService.getEndpoints(envId, null, next);
      },
      (customEndpoints, callback) => {
        async.forEachSeries(
          customEndpoints,
          (customEndpoint, nextEndpoint) => {
            this._transformCustomEndpoint(customEndpoint, services, dirname, (err, transformedCustomEndpoint) => {
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
      if (isEmpty(result)) result = undefined;
      done(err, result);
    });
  }

  _exportCommonCode(envId, dirname, done) {
    let result = {};

    async.waterfall([
      (next) => {
        this.businessLogicService.getCommonCode(envId, null, '["code"]', next);
      },
      (commonCodeScripts, callback) => {
        async.forEachSeries(
          commonCodeScripts,
          (commonCodeScript, nextScript) => {
            this._transformCommonCodeScript(commonCodeScript, dirname, (err, transformedCommonCodeScript) => {
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
      if (isEmpty(result)) result = undefined;
      done(err, result);
    });
  }

  _exportRoles(env, done) {
    let result = {};

    async.waterfall([
      (next) => {
        this.rolesService.getAll(env, next);
      },
      (roles, callback) => {
        async.forEachSeries(
          roles,
          (role, nextRole) => {
            EnvFileExporterV1._transformRole(role, (err, transformedRole) => {
              if (err) return nextRole(err);
              result[role.name] = transformedRole;
              nextRole();
            });
          },
          callback
        );
      }
    ],
    (err) => {
      if (isEmpty(result)) result = undefined;
      done(err, result);
    });
  }

  _exportGroups(env, done) {
    let result = {};

    async.waterfall([
      (next) => {
        this.groupsService.getAll(env, next);
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
      if (isEmpty(result)) result = undefined;
      done(err, result);
    });
  }

  _exportPushSettings(envId, done) {
    let result = {};
    async.waterfall([
      (next) => {
        this.pushService.getPushSettings(envId, next);
      },
      (pushSettings, callback) => {
        if (!pushSettings.ios) {
          delete pushSettings.ios;
        } else {
          pushSettings.ios = {
            production: pushSettings.ios.production,
            certificateFilename: pushSettings.ios.certificateFilename
          };
        }

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
      if (isEmpty(result)) result = undefined;
      done(err, result);
    });
  }

  static _transformPermissionsObject(configPermissions, apiPermissions, permissionsType) {
    if (apiPermissions[permissionsType]) {
      apiPermissions[permissionsType].forEach((item) => {
        if (!configPermissions[item.roleId]) configPermissions[item.roleId] = {};
        configPermissions[item.roleId][permissionsType] = item.type;
      });
    }
  }

  static _transformCollection(apiCollection, apiRoles, apiServices, done) {
    const configCollection = {};

    async.series([
      (callback) => {
        if (apiCollection.dataLink) {
          configCollection.type = 'external';

          const service = apiServices.find((element) => {
            return element.id === apiCollection.dataLink.id;
          });

          let serviceName = '[unknown]';
          let svcEnvName = '[unknown]';
          if (service) {
            serviceName = service.name;

            const svcEnv = service.environments.find(x => x.id === apiCollection.dataLink.backingServerId);
            if (svcEnv) {
              svcEnvName = svcEnv.name;
            }
          }

          configCollection.service = serviceName;
          configCollection.serviceEnvironment = svcEnvName;
          configCollection.serviceObject = apiCollection.dataLink.serviceObjectName;

          callback(null, configCollection);
        } else {
          configCollection.type = 'internal';
          callback(null);
        }
      },
      (callback) => {
        const apiPermissions = apiCollection.permissions;
        if (apiPermissions) {
          if (isString(apiPermissions)) {
            // The permissions are set using the quick form, not by role
            const permissionsString = findKey(BackendCollectionPermission, item => item === apiPermissions);
            configCollection.permissions = permissionsString;
          } else {
            // The permissions are set by role, we need to transform them to the format used in config files
            const configPermissionsById = {};
            AllowedPermissionsOperations.forEach((item) => {
              EnvFileExporterV1._transformPermissionsObject(configPermissionsById, apiPermissions, item);
            });

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

  _transformCollectionHook(apiCollectionHook, collectionName, services, dirname, done) {
    const hookObject = {};

    if (apiCollectionHook.host) {
      EnvFileExporterV1._setServiceInfoOnConfigHookOrEndpoint(hookObject, apiCollectionHook, services);
      setImmediate(() => { done(null, hookObject); });
    } else {
      hookObject.type = 'internal';
      let filename;
      if (this.storeCodeAsFile) {
        // Not using path.join() on purpose, so that paths are compatible with any OS
        filename = `./hooks/${collectionName}/${apiCollectionHook.name}.js`;
      }
      EnvFileExporterV1._transformCode(apiCollectionHook.code, hookObject, dirname, filename, (err, result) => done(err, hookObject));
    }
  }

  _transformCustomEndpoint(apiCustomEndpoint, services, dirname, done) {
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
      EnvFileExporterV1._setServiceInfoOnConfigHookOrEndpoint(endpointObject, apiCustomEndpoint, services);
      setImmediate(() => { done(null, endpointObject); });
    } else {
      endpointObject.type = 'internal';
      let filename;
      if (this.storeCodeAsFile) {
        // Not using path.join() on purpose, so that paths are compatible with any OS
        filename = `./endpoints/${apiCustomEndpoint.name}.js`;
      }
      EnvFileExporterV1._transformCode(apiCustomEndpoint.code, endpointObject, dirname, filename, err => done(err, endpointObject));
    }
  }

  static _getSvcInfoBySvcEnvId(svcEnvId, services) {
    for (let i = 0; i < services.length; i += 1) {
      const service = services[i];
      for (let j = 0; j < service.environments.length; j += 1) {
        const svcEnv = service.environments[j];
        if (svcEnv.id === svcEnvId) {
          return Object.assign({ svcEnvName: svcEnv.name }, service);
        }
      }
    }
    return {};
  }

  static _setServiceInfoOnConfigHookOrEndpoint(configEntity, apiEntity, apiServices) {
    if (!apiEntity.host) {
      return;
    }

    const result = EnvFileExporterV1._getSvcInfoBySvcEnvId(apiEntity.host, apiServices);
    const serviceIdentifier = result.name || '[unknown]';
    const svcEnvIdentifier = result.svcEnvName || '[unknown]';
    configEntity.type = 'external';
    configEntity.service = serviceIdentifier;
    configEntity.serviceEnvironment = svcEnvIdentifier;
    configEntity.handlerName = apiEntity.sdkHandlerName;
  }

  _transformCommonCodeScript(apiCommonCode, dirname, done) {
    const endpointObject = {};
    let filename;
    if (this.storeCodeAsFile) {
      // Not using path.join() on purpose, so that paths are compatible with any OS
      filename = `./common/${apiCommonCode.name}.js`;
    }
    EnvFileExporterV1._transformCode(apiCommonCode.code, endpointObject, dirname, filename, err => done(err, endpointObject));
  }

  static _transformCode(sourceCodeString, targetObject, dirname, filename, done) {
    if (filename) {
      const filepath = path.join(dirname, filename);
      targetObject.codeFile = filename;
      mkdirp(filepath, (err) => {
        if (err) return done(err);
        fs.writeFile(filepath, sourceCodeString, done);
      });
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
