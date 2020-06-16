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
const { EntityType, HTTPMethod, LogLevel } = require('./../Constants');
const { Endpoints, getTransformedError, getUsingEntityMsg } = require('./../Utils');

class OrganizationsService extends BaseService {
  getAll(done) {
    const endpoint = Endpoints.orgs(this.cliManager.config.defaultSchemaVersion);
    super.getAllEntities(endpoint, done);
  }

  getByIdOrName(identifier, done) {
    const endpointAll = Endpoints.orgs(this.cliManager.config.defaultSchemaVersion);
    const endpointId = Endpoints.orgs(this.cliManager.config.defaultSchemaVersion, identifier);
    this.cliManager.log(LogLevel.DEBUG, getUsingEntityMsg(EntityType.ORG, identifier));
    super.getEntityByIdOrName(identifier, endpointAll, endpointId, (err, entity) => {
      if (err) {
        return done(getTransformedError(err, EntityType.ORG, identifier));
      }

      done(null, entity);
    });
  }

  update(id, data, done) {
    const endpoint = Endpoints.orgs(this.cliManager.config.defaultSchemaVersion, id);
    this.cliManager.sendRequest({ endpoint, data, method: HTTPMethod.PUT }, done);
  }
}

module.exports = OrganizationsService;
