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

const BaseService = require('./../BaseService');
const { ActiveItemType, AppOptionsName, EntityType, EnvOptionsName, HTTPMethod, LogLevel } = require('./../Constants');
const { Endpoints, getCustomNotFoundError, getItemError, getUsingEntityMsg, isNotFoundError, isNullOrUndefined } = require('./../Utils');

class EnvironmentsService extends BaseService {
  getAll(appId, done) {
    const endpoint = Endpoints.envsByAppId(this.cliManager.config.defaultSchemaVersion, appId);
    super.getAllEntities(endpoint, done);
  }

  getByIdOrName(identifier, appId, done) {
    const endpointAll = Endpoints.envsByAppId(this.cliManager.config.defaultSchemaVersion, appId);
    const endpointId = Endpoints.envs(this.cliManager.config.defaultSchemaVersion, identifier);
    this.cliManager.log(LogLevel.DEBUG, getUsingEntityMsg(EntityType.ENV, identifier));
    super.getEntityByIdOrName(identifier, endpointAll, endpointId, (err, entity) => {
      if (isNotFoundError(err)) {
        return done(getCustomNotFoundError(EntityType.ENV, identifier));
      }

      done(err, entity);
    });
  }

  getById(id, done) {
    const endpoint = Endpoints.envs(this.cliManager.config.defaultSchemaVersion, id);
    this.cliManager.log(LogLevel.DEBUG, getUsingEntityMsg(EntityType.ENV, id));
    this.cliManager.sendRequest({ endpoint }, (err, entity) => {
      if (isNotFoundError(err)) {
        return done(getCustomNotFoundError(EntityType.ENV, id));
      }

      done(err, entity);
    });
  }

  getActiveOrSpecified(options, done) {
    const specifiedEnv = options[EnvOptionsName.ENV];
    const activeEnv = this.cliManager.getActiveItemId(ActiveItemType.ENV);
    const useActive = isNullOrUndefined(specifiedEnv) && !isNullOrUndefined(activeEnv);
    let wantedEnv;
    let appId;

    if (!activeEnv && !specifiedEnv) {
      return setImmediate(() => done(getItemError(EntityType.ENV)));
    }

    async.series([
      (next) => {
        if (!useActive) {
          return setImmediate(next);
        }

        this.getById(activeEnv, (err, data) => {
          if (err) {
            return next(err);
          }

          wantedEnv = data;
          next();
        });
      },
      (next) => {
        if (wantedEnv) {
          return setImmediate(next);
        }

        this.getAppId(options[AppOptionsName.APP], (err, id) => {
          if (err) {
            return next(err);
          }

          appId = id;
          next();
        });
      },
      (next) => {
        if (wantedEnv) {
          return setImmediate(next);
        }

        this.getByIdOrName(specifiedEnv, appId, (err, data) => {
          if (err) {
            return next(err);
          }

          wantedEnv = data;
          next();
        });
      }
    ], (err) => {
      if (err) {
        return done(err);
      }

      done(null, wantedEnv);
    });
  }

  getAppId(appIdentifier, done) {
    let appId;

    const activeAppId = this.cliManager.getActiveItemId(ActiveItemType.APP);
    if (!isNullOrUndefined(activeAppId) && isNullOrUndefined(appIdentifier)) {
      appId = activeAppId;
      this.cliManager.log(LogLevel.DEBUG, getUsingEntityMsg(EntityType.APP, appId));
      return setImmediate(() => {
        done(null, appId);
      });
    }

    const endpointAll = Endpoints.apps(this.cliManager.config.defaultSchemaVersion);
    const endpointId = Endpoints.apps(this.cliManager.config.defaultSchemaVersion, appIdentifier);
    this.cliManager.log(LogLevel.DEBUG, getUsingEntityMsg(EntityType.APP, appIdentifier));
    super.getEntityByIdOrName(appIdentifier, endpointAll, endpointId, (err, data) => {
      if (err) {
        if (isNotFoundError(err)) {
          return done(getCustomNotFoundError(EntityType.APP, appIdentifier));
        }

        return done(err);
      }

      appId = data.id;
      done(null, appId);
    });
  }

  create(data, appId, done) {
    const endpoint = Endpoints.envsByAppId(this.cliManager.config.defaultSchemaVersion, appId);
    this.cliManager.sendRequest({ endpoint, data, method: HTTPMethod.POST }, done);
  }

  clone(data, done) {
    const endpoint = Endpoints.jobs(this.cliManager.config.defaultSchemaVersion);
    this.cliManager.sendRequest({ endpoint, data, method: HTTPMethod.POST }, done);
  }

  deleteById(id, done) {
    const endpoint = Endpoints.envs(this.cliManager.config.defaultSchemaVersion, id);
    this.cliManager.sendRequest({ endpoint, method: HTTPMethod.DELETE }, done);
  }
}

module.exports = EnvironmentsService;
