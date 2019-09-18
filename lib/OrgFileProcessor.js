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
        // update org settings
        const nothingToUpdate = isNullOrUndefined(configOrg.settings) || isNullOrUndefined(configOrg.settings.security)
          || isEmpty(configOrg.settings.security);
        if (nothingToUpdate) {
          return setImmediate(next);
        }

        this.organizationsService.update(fetchedOrg.id, { security: configOrg.settings.security }, next);
      },
      (next) => {
        this.servicesService.getAllOwnedByOrg(fetchedOrg.id, false, (err, data) => {
          if (err) {
            return next(err);
          }

          existingServices = data;
          const configServices = configOrg.services || {};
          groupedServices = FileProcessorHelper.groupEntitiesPerOperationType(existingServices, configServices);
          next();
        });
      },
      (next) => {
        this._createServices({ services: groupedServices[OperationType.CREATE], orgId: fetchedOrg.id }, next);
      },
      (next) => {
        this._updateServices({ services: groupedServices[OperationType.UPDATE], existingServices, orgId: fetchedOrg.id }, next);
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

  /**
   * Creates services.
   * @param {Object} options
   * @param {Object} options.services Services to be created in config format.
   * @param {String} options.orgId Org ID.
   * @param done
   * @private
   */
  _createServices(options, done) {
    if (isNullOrUndefined(options.services) || isEmpty(options.services)) {
      return setImmediate(done);
    }

    const servicesNames = Object.keys(options.services);
    async.eachSeries(
      servicesNames,
      (currName, next) => {
        this.cliManager.log(LogLevel.INFO, `Creating service: ${currName}`);
        this.serviceFileProcessor.process(
          {
            operation: OperationType.CREATE,
            parsedData: options.services[currName],
            name: currName,
            domainId: options.orgId,
            domainType: DomainTypes.ORG
          },
          next
        );
      },
      done
    );
  }

  _updateServices(options, done) {
    const configServices = options.services;
    if (isEmpty(configServices)) {
      return setImmediate(done);
    }

    const existingServices = options.existingServices;
    const operation = OperationType.UPDATE;

    async.eachSeries(
      configServices,
      (currService, next) => {
        const nameIdentifier = Object.keys(currService)[0];
        const existingService = existingServices.find(x => x.name === nameIdentifier);
        const updateData = currService[nameIdentifier];
        updateData.name = updateData.name || nameIdentifier;
        const processOptions = {
          operation,
          parsedData: updateData,
          serviceId: existingService.id,
          domainId: options.orgId,
          domainType: DomainTypes.ORG
        };
        this.cliManager.log(LogLevel.INFO, `Updating service: ${nameIdentifier}`);
        this.serviceFileProcessor.process(processOptions, next);
      },
      done
    );
  }

  _createApps({ apps, orgId }, done) {
    if (isNullOrUndefined(apps) || isEmpty(apps)) {
      return setImmediate(done);
    }

    const appNames = Object.keys(apps);
    async.eachSeries(
      appNames,
      (currName, next) => {
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
