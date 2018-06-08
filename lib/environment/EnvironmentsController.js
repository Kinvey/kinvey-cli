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

const BaseController = require('../BaseController');
const CommandResult = require('../CommandResult');
const { ActiveItemType, AppOptionsName, CommonOptionsNames, ConfigType, EntityType, EnvOptionsName, Errors, Mapping, OperationType } = require('../Constants');
const KinveyError = require('../KinveyError');
const { getCommandNameFromOptions, isNullOrUndefined, mapFromSource, sortList } = require('../Utils');

class EnvironmentsController extends BaseController {
  constructor(options) {
    super(options);
    this.environmentsService = options.environmentsService;
    this.applicationsService = options.applicationsService;
    this.collectionsService = options.collectionsService;
    this.businessLogicService = options.businessLogicService;
    this.rolesService = options.rolesService;
    this.groupsService = options.groupsService;
  }

  preProcessOptions(options) {
    const cmd = getCommandNameFromOptions(options);
    const appIsRequired = isNullOrUndefined(this.cliManager.getActiveItemId(ActiveItemType.ENV));
    options[AppOptionsName.APP] = options[AppOptionsName.APP] || this.cliManager.getActiveItemId(ActiveItemType.APP);
    const appIsMissing = isNullOrUndefined(options[AppOptionsName.APP]);
    if (appIsRequired && appIsMissing) {
      throw new KinveyError(Errors.AppRequired);
    }

    return true;
  }

  create(options, done) {
    let appId;

    async.series([
      (next) => {
        this.environmentsService.getAppId(options[AppOptionsName.APP], (err, id) => {
          if (err) {
            return next(err);
          }

          appId = id;
          next();
        });
      },
      (next) => {
        if (options.file) {
          const processOptions = {
            [AppOptionsName.APP]: appId,
            file: options.file,
            name: options.name,
            operation: OperationType.CREATE,
            configType: ConfigType.ENV
          };
          this.cliManager.processConfigFile(processOptions, next);
        } else {
          const newEnv = {
            name: options.name
          };
          this.environmentsService.create(newEnv, appId, next);
        }
      }
    ], (err, results) => {
      if (err) {
        return done(err);
      }

      const result = results.pop();
      const cmdResult = new CommandResult()
        .setRawData({ id: result.id })
        .setBasicMsg(OperationType.CREATE, EntityType.ENV);
      done(null, cmdResult);
    });
  }

  update(options, done) {
    this.environmentsService.getActiveOrSpecified(options, (err, env) => {
      if (err) {
        return done(err);
      }

      const processOptions = {
        [EnvOptionsName.ENV]: env,
        file: options.file,
        operation: OperationType.UPDATE,
        configType: ConfigType.ENV
      };
      this.cliManager.processConfigFile(processOptions, (err, data) => {
        if (err) {
          return done(err);
        }

        const cmdResult = new CommandResult()
          .setRawData({ id: data.id })
          .setBasicMsg(OperationType.UPDATE, EntityType.ENV);
        done(null, cmdResult);
      });
    });
  }

  list(options, done) {
    const appIdentifier = options[AppOptionsName.APP];
    let appId;

    async.series([
      (next) => {
        this.environmentsService.getAppId(appIdentifier, (err, id) => {
          if (err) {
            return next(err);
          }

          appId = id;
          next();
        });
      },
      (next) => {
        this.environmentsService.getAll(appId, next);
      }
    ], (err, results) => {
      if (err) {
        return done(err);
      }

      const data = results.pop();
      const result = mapFromSource(Mapping[EntityType.ENV].BASIC, data);
      const cmdResult = new CommandResult()
        .setTableData(sortList(result))
        .setRawData(data);
      done(null, cmdResult);
    });
  }

  show(options, done) {
    this.environmentsService.getActiveOrSpecified(options, (err, env) => {
      if (err) {
        return done(err);
      }

      const cmdResult = new CommandResult()
        .setTableData(mapFromSource(Mapping[EntityType.ENV].DETAILS, env))
        .setRawData(env);
      done(null, cmdResult);
    });
  }

  use(options, done) {
    const wantedEntity = options[EnvOptionsName.ENV];
    const appIdentifier = options[AppOptionsName.APP];
    let appId;
    let itemToSet;

    async.series([
      (next) => {
        this.environmentsService.getAppId(appIdentifier, (err, id) => {
          if (err) {
            return next(err);
          }

          appId = id;
          next();
        });
      },
      (next) => {
        this.environmentsService.getByIdOrName(wantedEntity, appId, (err, data) => {
          if (err) {
            return next(err);
          }

          itemToSet = data;
          next();
        });
      },
      (next) => {
        this.cliManager.setActiveItem(ActiveItemType.ENV, itemToSet, next);
      }
    ], (err) => {
      if (err) {
        return done(err);
      }

      const cmdResult = new CommandResult()
        .setRawData({ id: itemToSet.id })
        .setBasicMsg(OperationType.ACTIVATE, EntityType.ENV);
      done(null, cmdResult);
    });
  }

  deleteEnv(options, done) {
    async.waterfall([
      (next) => {
        this.environmentsService.getActiveOrSpecified(options, (err, data) => {
          if (err) {
            return next(err);
          }

          next(null, data.id);
        });
      },
      (envId, next) => {
        super.confirmDeleteOperation(options[CommonOptionsNames.NO_PROMPT], EntityType.ENV, envId, (err) => {
          if (err) {
            return next(err);
          }

          next(null, envId);
        });
      },
      (envId, next) => {
        this.environmentsService.deleteById(envId, (err) => {
          next(err, envId);
        });
      },
      (id, next) => {
        this.cliManager.removeActiveItem(ActiveItemType.ENV, id, () => {
          next(null, id);
        });
      }
    ], (err, id) => {
      if (err) {
        return done(err);
      }

      const cmdResult = new CommandResult()
        .setBasicMsg(OperationType.DELETE, EntityType.ENV, id)
        .setRawData({ id });
      done(null, cmdResult);
    });
  }

  export(options, done) {
    const filename = options.file;
    let envId;
    let env;
    let config = {};
    config.configType = "environment";

    async.series([
      (next) => {
        this.environmentsService.getActiveOrSpecified(options, (err, data) => {
          if (err) {
            return next(err);
          }
          envId = data.id;
          env = data;
          console.log(envId);

          next(null);
        });
      },
      (next) => {
        this._exportCollections(envId, function(err, result) {
          if (err) return next(err);
          config.collections = result;
          next();
        })
      },
      (next) => {
        this._exportCollectionHooks(envId, function(err, result) {
          if (err) return next(err);
          config.collectionHooks = result;
          next();
        })
      },
      (next) => {
        this._exportCustomEndpoints(envId, function(err, result) {
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
          config.groups = result;
          next();
        })
      }
    ], (err) => {
      if (err) {
        console.error(err);
        return done(err);
      } else {
        console.log(JSON.stringify(config, null, 2));
        fs.writeFile(filename, JSON.stringify(config, null, 2), (err) => {
          this.cliManager.processCommandResult(err, null, done);
        });

        const cmdResult = new CommandResult()
          .setBasicMsg(OperationType.DELETE, EntityType.ENV, envId)
          .setRawData({ id: envId });
        done(null, cmdResult);
      }
    });
  }

  _exportCollections(envId, done) {
    const self = this;

    let result = {};
    async.waterfall([
      (next) => {
        self.collectionsService.getAll(envId, next);
      },
      (collections, next) => {
        //console.log(JSON.stringify(collections, null, 2));
        async.forEachSeries(
          collections,
          (collection, iter) => {
            if (self._mustExportCollection(collection.name)) {
              self._transformCollection(collection, (err, configCollection) => {
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

  _exportCollectionHooks(envId, done) {
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
                  self._transformCollectionHook(hook, (err, transformedHook) => {
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

  _exportCustomEndpoints(envId, done) {
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
              self._transformCustomEndpoint(customEndpoint, (err, transformedCustomEndpoint) => {
                if (err) return nextEndpoint(err);

                result[customEndpoint.name] = transformedCustomEndpoint;
                nextEndpoint();
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
          console.log(JSON.stringify(groups, null, 2));
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

  _mustExportCollection(collectionName) {
    if (collectionName === 'user' || collectionName === '_blob') {
      return false;
    } else {
      return true;
    }
  }

  _transformCollection(apiCollection, done) {
    let configCollection = {};

    if (apiCollection.dataLink) {
      configCollection.type = 'service';
    } else {
      configCollection.type = 'internal';
    }

    done(null, configCollection);
  }

  _transformCollectionHook(apiCollectionHook, done) {
    let hookObject = {};

    if (apiCollectionHook.host) {
      hookObject.type = 'service';
      hookObject.service = apiCollectionHook.host;
      hookObject.handlerName = apiCollectionHook.sdkHandlerName;

      return done(null, hookObject);
    } else {
      hookObject.type = 'inline';
      let filename;
      if (this.storeCodeAsFile) {
        filename = "hooks/" + apiCollectionHook.name + ".json";
      }
      this._transformCode(apiCollectionHook.code, hookObject, filename, (err, result) => done(err, hookObject));
    }
  }

  _transformCustomEndpoint(apiCustomEndpoint, done) {
    let endpointObject = {};

    if (apiCustomEndpoint.host) {
      endpointObject.type = 'service';
      endpointObject.service = apiCustomEndpoint.host;
      endpointObject.handlerName = apiCustomEndpoint.sdkHandlerName;

      return done(null, endpointObject);
    } else {
      endpointObject.type = 'inline';
      let filename;
      if (this.storeCodeAsFile) {
        filename = "endpoints/" + apiCustomEndpoint.name + ".json";
      }
      this._transformCode(apiCustomEndpoint.code, endpointObject, filename, (err, result) => done(err, endpointObject));
    }
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

module.exports = EnvironmentsController;
