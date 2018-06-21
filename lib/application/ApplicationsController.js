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
const { ActiveItemType, AppOptionsName, CommonOptionsNames, EntityType, Mapping, OperationType } = require('../Constants');
const KinveyError = require('../KinveyError');
const { isNullOrUndefined, getItemError, mapFromSource, sortList } = require('../Utils');

class ApplicationsController extends BaseController {
  constructor(options) {
    super(options);
    this.applicationsService = options.applicationsService;
  }

  create(options, done) {
    const payload = {
      name: options.name
    };

    this.applicationsService.create(payload, (err, data) => {
      if (err) {
        return done(err);
      }

      const cmdResult = new CommandResult()
        .setRawData({ id: data.id })
        .setBasicMsg(OperationType.CREATE, EntityType.APP, data.id);
      done(null, cmdResult);
    });
  }

  list(options, done) {
    this.applicationsService.getAll((err, data) => {
      if (err) {
        return done(err);
      }

      const result = mapFromSource(Mapping[EntityType.APP].BASIC, data);

      const cmdResult = new CommandResult()
        .setTableData(sortList(result))
        .setRawData(data);
      done(null, cmdResult);
    });
  }

  show(options, done) {
    const activeApp = this.cliManager.getActiveItem(ActiveItemType.APP);
    const appToShow = options[AppOptionsName.APP] || (activeApp && activeApp.id);
    if (isNullOrUndefined(appToShow)) {
      return setImmediate(() => done(getItemError(EntityType.APP)));
    }

    this.applicationsService.getByIdOrName(appToShow, (err, data) => {
      if (err) {
        return done(err);
      }

      const result = mapFromSource(Mapping[EntityType.APP].DETAILS, data);

      const cmdResult = new CommandResult()
        .setTableData(result)
        .setRawData(data);
      done(null, cmdResult);
    });
  }

  use(options, done) {
    const wantedApp = options[AppOptionsName.APP];
    let appToSet;

    async.series([
      (next) => {
        this.applicationsService.getByIdOrName(wantedApp, (err, data) => {
          if (err) {
            return next(err);
          }

          appToSet = data;
          next();
        });
      },
      (next) => {
        this.cliManager.setActiveItem(ActiveItemType.APP, appToSet, next);
      }
    ], (err) => {
      if (err) {
        return done(err);
      }

      const cmdResult = new CommandResult()
        .setRawData({ id: appToSet.id })
        .setBasicMsg(OperationType.ACTIVATE, EntityType.APP);
      done(null, cmdResult);
    });
  }

  deleteApp(options, done) {
    const activeApp = this.cliManager.getActiveItem(ActiveItemType.APP);
    const appIdentifier = options[AppOptionsName.APP] || (activeApp && activeApp.id);
    if (isNullOrUndefined(appIdentifier)) {
      return setImmediate(() => done(getItemError(EntityType.APP)));
    }

    let id;

    async.series([
      (next) => {
        super.confirmDeleteOperation(options[CommonOptionsNames.NO_PROMPT], EntityType.APP, appIdentifier, next);
      },
      (next) => {
        this.applicationsService.removeByIdOrName(appIdentifier, (err, removedId) => {
          if (err) {
            return next(err);
          }

          id = removedId;
          next();
        });
      },
      (next) => {
        this.cliManager.removeActiveItem(ActiveItemType.APP, id, () => {
          next();
        });
      }
    ], (err) => {
      if (err) {
        return done(err);
      }

      const cmdResult = new CommandResult()
        .setRawData({ id })
        .setBasicMsg(OperationType.DELETE, EntityType.APP);
      done(null, cmdResult);
    });
  }
}

module.exports = ApplicationsController;
