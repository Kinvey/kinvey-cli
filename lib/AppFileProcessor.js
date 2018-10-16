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

class AppFileProcessor {
  constructor(options) {
    this.cliManager = options.cliManager;
    this.envFileProcessor = options.envFileProcessor;
    this.serviceFileProcessor = options.serviceFileProcessor;
    this.applicationsService = options.applicationsService;
    this.environmentsService = options.environmentsService;
  }

  process(options, done) {
    const operationType = options.operation;
    const configApp = options.parsedData;
    if (operationType === OperationType.CREATE) {
      this._createApp(configApp, options, done);
    } else if (operationType === OperationType.UPDATE) {
      this._updateApp(configApp, options, done);
    } else {
      return setImmediate(() => { done(new Error(`Operation type not supported: ${operationType}`)); });
    }
  }

  _createApp(configApp, options, done) {
    let app;

    async.series([
      (next) => {
        const data = getObjectByPicking(configApp.settings, ['realtime', 'sessionTimeoutInSeconds']);
        data.name = options.name;
        const orgId = options[OrgOptionsName.ORG];
        if (!isNullOrUndefined(orgId)) {
          data.organizationId = orgId;
        }

        this.cliManager.log(LogLevel.INFO, `Creating app: ${data.name}`);
        this.applicationsService.create(data, (err, result) => {
          if (err) {
            return next(err);
          }

          app = result;
          next();
        });
      },
      (next) => {
        this._createServices({ services: configApp.services, appId: app.id }, next);
      },
      (next) => {
        this._createInitialEnvs(app, configApp.environments, next);
      }
    ], (err) => {
      if (err) {
        return done(err);
      }

      done(null, { id: app.id });
    });
  }

  /**
   * Creates services.
   * @param {Object} options
   * @param {Object} options.services Services to be created in config format.
   * @param {String} options.appId App ID.
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
            domainId: options.appId,
            domainType: DomainTypes.APP
          },
          next
        );
      },
      done
    );
  }

  /**
   * Creates environments for a first time in an app. Takes into account the default env created by the backend.
   * @param {Object} app
   * @param {String} app.id
   * @param {Array} app.environments
   * @param {Object} configEnvs
   * @param done
   * @private
   */
  _createInitialEnvs(app, configEnvs, done) {
    if (isNullOrUndefined(configEnvs) || isEmpty(configEnvs)) {
      return setImmediate(done);
    }

    const envNames = Object.keys(configEnvs);
    const defaultEnvName = 'development';
    const findDefEnv = x => x.name.toLowerCase() === defaultEnvName;
    let configContainsDefaultEnv = false;

    async.series([
      (next) => {
        async.eachSeries(
          envNames,
          (currentName, cb) => {
            // the backend creates a default env (when creating an app) called Development
            const currentNameLowered = currentName.toLowerCase();
            const isDefaultEnv = currentNameLowered === defaultEnvName;
            const operation = isDefaultEnv ? OperationType.UPDATE : OperationType.CREATE;
            const options = {
              operation,
              name: currentName,
              parsedData: configEnvs[currentName],
              [AppOptionsName.APP]: app.id
            };

            if (isDefaultEnv) {
              options.env = app.environments.find(findDefEnv);
              if (configContainsDefaultEnv === false) {
                configContainsDefaultEnv = true;
              }
            }

            this.envFileProcessor.process(options, cb);
          },
          next
        );
      },
      (next) => {
        const shouldRemoveDefaultEnv = configContainsDefaultEnv === false;
        if (!shouldRemoveDefaultEnv) {
          return setImmediate(next);
        }

        const env = app.environments.find(findDefEnv);
        if (!env) {
          return setImmediate(next);
        }

        this.environmentsService.deleteById(env.id, next);
      }
    ], done);
  }

  _createEnvs(appId, configEnvs, done) {
    if (isNullOrUndefined(configEnvs) || isEmpty(configEnvs)) {
      return setImmediate(done);
    }

    const envNames = Object.keys(configEnvs);

    async.eachSeries(
      envNames,
      (currentName, next) => {
        const options = {
          operation: OperationType.CREATE,
          name: currentName,
          parsedData: configEnvs[currentName],
          [AppOptionsName.APP]: appId
        };
        this.envFileProcessor.process(options, next);
      },
      done
    );
  }

  /**
   * Takes envs in config format. The ones that already exist in the backend are updated, the rest - created.
   * @param {Object} app
   * @param {String} app.id
   * @param {Array} app.environments
   * @param {Object} configEnvs
   * @param done
   * @returns {number | Number}
   * @private
   */
  _modifyEnvs(app, configEnvs, done) {
    if (isNullOrUndefined(configEnvs) || isEmpty(configEnvs)) {
      return setImmediate(done);
    }

    const existingEnvs = app.environments;
    const groupedEntities = FileProcessorHelper.groupEntitiesPerOperationType(existingEnvs, configEnvs);

    async.series([
      (next) => {
        this._updateEnvs(existingEnvs, groupedEntities[OperationType.UPDATE], next);
      },
      (next) => {
        this._createEnvs(app.id, groupedEntities[OperationType.CREATE], next);
      }
    ], done);
  }

  _updateEnvs(existingEnvs, configEnvs, done) {
    const operation = OperationType.UPDATE;

    async.eachSeries(
      configEnvs,
      (currEnv, next) => {
        const nameIdentifier = Object.keys(currEnv)[0];
        const env = existingEnvs.find(x => x.name === nameIdentifier);
        const options = {
          operation,
          parsedData: currEnv,
          [EnvOptionsName.ENV]: env
        };
        this.envFileProcessor.process(options, next);
      },
      done
    );
  }

  _updateApp(configApp, options, done) {
    const app = options[AppOptionsName.APP];
    const appId = app.id;

    async.series([
      (next) => {
        let data = { name: app.name };
        data = Object.assign(data, configApp.settings);
        this.cliManager.log(LogLevel.INFO, `Updating app: ${data.name}`);
        this.applicationsService.update(appId, data, next);
      },
      (next) => {
        this._modifyEnvs(app, configApp.environments, next);
      }
    ], (err) => {
      if (err) {
        return done(err);
      }

      done(null, { id: appId });
    });
  }
}

module.exports = AppFileProcessor;
