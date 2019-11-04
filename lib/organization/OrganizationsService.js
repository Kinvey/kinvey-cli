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

const BaseService = require('./../BaseService');
const { EntityType, Errors, HTTPMethod, LogLevel } = require('./../Constants');
const { Endpoints, getCustomEntityError, getCustomNotFoundError, getUsingEntityMsg, isEmpty } = require('./../Utils');

class OrganizationsService extends BaseService {
  getAll(done) {
    const endpoint = Endpoints.orgs(this.cliManager.config.defaultSchemaVersion);
    const queryForAllOrgs = { query: '{}' };
    this.cliManager.sendRequest({ endpoint, query: queryForAllOrgs }, (err, allOrgs) => {
      if (err) {
        if (err.name !== 'InsufficientCredentials') {
          return done(err);
        }

        return this.cliManager.sendRequest({ endpoint }, (err, orgsForUser) => {
          if (err) {
            return done(err);
          }

          return done(null, orgsForUser);
        });
      }

      done(null, allOrgs);
    });
  }

  getByIdOrName(identifier, done) {
    this.cliManager.log(LogLevel.DEBUG, getUsingEntityMsg(EntityType.ORG, identifier));
    this.getAll((err, allOrgs) => {
      if (err) {
        return done(err);
      }

      const foundOrgs = allOrgs.filter(x => x.name === identifier || x.id === identifier);
      if (isEmpty(foundOrgs)) {
        return done(getCustomNotFoundError(EntityType.ORG, identifier));
      }

      if (foundOrgs.length > 1) {
        return done(getCustomEntityError(EntityType.ORG, identifier, Errors.TooManyEntitiesFound.NAME));
      }

      done(null, foundOrgs[0]);
    });
  }

  update(id, data, done) {
    const endpoint = Endpoints.orgs(this.cliManager.config.defaultSchemaVersion, id);
    this.cliManager.sendRequest({ endpoint, data, method: HTTPMethod.PUT }, done);
  }
}

module.exports = OrganizationsService;
