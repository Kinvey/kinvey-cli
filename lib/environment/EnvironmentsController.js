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
}

module.exports = EnvironmentsController;
