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

class SitesService extends BaseService {
  getByIdOrName(identifier, done) {
    this.getAll((err, data) => {
      if (err) {
        return done(err);
      }

      const wantedSite = data.find(x => x.id === identifier || x.name === identifier);
      if (!wantedSite) {
        return done(getCustomNotFoundError(EntityType.SITE, identifier));
      }

      done(null, wantedSite);
    });
  }

  getAll(done) {
    const endpoint = Endpoints.sites(this.cliManager.config.defaultSchemaVersion);
    super.getAllEntities(endpoint, done);
  }

  create(data, done) {
    const endpoint = Endpoints.sites(this.cliManager.config.defaultSchemaVersion);
    this.cliManager.sendRequest({ endpoint, data, method: HTTPMethod.POST }, done);
  }

  publish(siteId, publishData, done) {
    const endpoint = Endpoints.sitePublish(this.cliManager.config.defaultSchemaVersion, siteId);
    this.cliManager.sendRequest({ endpoint, data: publishData, method: HTTPMethod.POST }, done);
  }

  status(siteId, done) {
    const endpoint = Endpoints.siteStatus(this.cliManager.config.defaultSchemaVersion, siteId);
    this.cliManager.sendRequest({ endpoint }, done);
  }

  unpublish(siteId, done) {
    const endpoint = Endpoints.siteUnpublish(this.cliManager.config.defaultSchemaVersion, siteId);
    this.cliManager.sendRequest({ endpoint, method: HTTPMethod.POST }, done);
  }

  removeByIdOrName(identifier, done) {
    let siteId;

    async.series([
      (next) => {
        this.getByIdOrName(identifier, (err, data) => {
          if (err) {
            return next(err);
          }

          siteId = data.id;
          next();
        });
      },
      (next) => {
        const endpoint = Endpoints.sites(this.cliManager.config.defaultSchemaVersion, siteId);
        this.cliManager.sendRequest({ endpoint, method: HTTPMethod.DELETE }, next);
      }
    ], (err) => {
      if (err) {
        return done(err);
      }

      done(null, siteId);
    });
  }
}

module.exports = SitesService;
