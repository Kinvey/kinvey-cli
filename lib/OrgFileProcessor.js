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

const { AppOptionsName, DomainTypes, EnvOptionsName, LogLevel, OperationType, OrgOptionsName } = require('./Constants');
const FileProcessorHelper = require('./FileProcessorHelper');
const { getObjectByPicking, isEmpty, isNullOrUndefined } = require('./Utils');

class OrgFileProcessor {
  constructor(options) {
    this.cliManager = options.cliManager;
    this.organizationsService = options.organizationsService;
    this.serviceFileProcessor = options.serviceFileProcessor;
    this.appFileProcessor = options.appFileProcessor;
    this.applicationsService = options.applicationsService;
    this.servicesService = options.servicesService;
  }

  /**
   * Processes an org config file.
   * @param {String} options
   * @param {Constants.OperationType} options.operation Operation type.
   * @param {String} options.orgIdentifier Org identifier - ID or name.
   * @param {Object} options.parsedData Data that will be applied.
   * @param done
   */
  process(options, done) {
    const operationType = options.operation;
    const configOrg = options.parsedData;
    if (operationType !== OperationType.UPDATE) {
      return setImmediate(() => { done(new Error(`Operation type not supported: ${operationType}`)); });
    }

    this._updateOrg(configOrg, options, done);
  }

  _updateOrg(configOrg, options, done) {
    let fetchedOrg;
    let groupedServices;
    let existingServices;

    async.series([
      (next) => {
        this.organizationsService.getByIdOrName(options.orgIdentifier, (err, data) => {
          if (err) {
            return next(err);
          }

          fetchedOrg = data;
          next();
        });
      },
      (next) => {
        this._modifyApps({ configApps: configOrg.applications, orgId: fetchedOrg.id }, next);
      }
    ], (err) => {
      if (err) {
        return done(err);
      }

      done(null, { id: fetchedOrg.id });
    });
  }

  _createApps({ apps, orgId }, done) {
    if (isNullOrUndefined(apps) || isEmpty(apps)) {
      return setImmediate(done);
    }

    const appNames = Object.keys(apps);
    async.eachSeries(
      appNames,
      (currName, next) => {
        this.cliManager.log(LogLevel.INFO, `Creating app: ${currName}`);
        this.appFileProcessor.process(
          {
            operation: OperationType.CREATE,
            parsedData: apps[currName],
            name: currName,
            [OrgOptionsName.ORG]: orgId
          },
          next
        );
      },
      done
    );
  }

  _updateApps({ apps, existingApps }, done) {
    if (isNullOrUndefined(apps) || isEmpty(apps)) {
      return setImmediate(done);
    }

    async.eachSeries(
      apps,
      (currApp, next) => {
        const nameIdentifier = Object.keys(currApp)[0];
        const existingApp = existingApps.find(x => x.name === nameIdentifier);
        const options = {
          operation: OperationType.UPDATE,
          parsedData: currApp[nameIdentifier],
          [AppOptionsName.APP]: existingApp
        };
        this.appFileProcessor.process(options, next);
      },
      done
    );
  }

  _modifyApps({ configApps = {}, orgId }, done) {
    let existingApps;
    let groupedApps;

    async.series([
      (next) => {
        this.applicationsService.getByOrg(orgId, (err, data) => {
          if (err) {
            return next(err);
          }

          existingApps = data;
          groupedApps = FileProcessorHelper.groupEntitiesPerOperationType(existingApps, configApps);
          next();
        });
      },
      (next) => {
        this._createApps({ apps: groupedApps[OperationType.CREATE], orgId }, next);
      },
      (next) => {
        this._updateApps({ apps: groupedApps[OperationType.UPDATE], existingApps }, next);
      }
    ], done);
  }
}

module.exports = OrgFileProcessor;
