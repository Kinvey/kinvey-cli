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
const { EntityType, HTTPMethod, LogLevel } = require('./../Constants');
const { Endpoints, getUsingEntityMsg, getCustomNotFoundError, isNotFoundError } = require('./../Utils');

class ApplicationsService extends BaseService {
  getAll(done) {
    const endpoint = Endpoints.apps(this.cliManager.config.defaultSchemaVersion);
    super.getAllEntities(endpoint, done);
  }

  getByIdOrName(identifier, done) {
    const endpointAll = Endpoints.apps(this.cliManager.config.defaultSchemaVersion);
    const endpointId = Endpoints.apps(this.cliManager.config.defaultSchemaVersion, identifier);
    this.cliManager.log(LogLevel.DEBUG, getUsingEntityMsg(EntityType.APP, identifier));
    super.getEntityByIdOrName(identifier, endpointAll, endpointId, (err, entity) => {
      if (isNotFoundError(err)) {
        return done(getCustomNotFoundError(EntityType.APP, identifier));
      }

      done(err, entity);
    });
  }

  getByOrg(orgId, done) {
    const endpoint = Endpoints.appsByOrg(this.cliManager.config.defaultSchemaVersion, orgId);
    this.cliManager.sendRequest({ endpoint }, done);
  }

  create(data, done) {
    const endpoint = Endpoints.apps(this.cliManager.config.defaultSchemaVersion);
    this.cliManager.sendRequest({ endpoint, data, method: HTTPMethod.POST }, done);
  }

  update(id, data, done) {
    const endpoint = Endpoints.apps(this.cliManager.config.defaultSchemaVersion, id);
    this.cliManager.sendRequest({ endpoint, data, method: HTTPMethod.PUT }, done);
  }

  removeByIdOrName(identifier, done) {
    let appId;

    async.series([
      (next) => {
        this.getByIdOrName(identifier, (err, data) => {
          if (err) {
            return next(err);
          }

          appId = data.id;
          next();
        });
      },
      (next) => {
        const endpoint = Endpoints.apps(this.cliManager.config.defaultSchemaVersion, appId);
        this.cliManager.sendRequest({ endpoint, method: HTTPMethod.DELETE }, next);
      }
    ], (err) => {
      if (err) {
        return done(err);
      }

      done(null, appId);
    });
  }
}

module.exports = ApplicationsService;
