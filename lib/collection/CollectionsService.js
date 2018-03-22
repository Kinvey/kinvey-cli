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
const { HTTPMethod } = require('./../Constants');
const { Endpoints } = require('./../Utils');

class CollectionsService extends BaseService {
  getAll(envId, done) {
    const endpoint = Endpoints.collections(this.cliManager.config.defaultSchemaVersion, envId);
    this.cliManager.sendRequest({ endpoint }, done);
  }

  create(data, envId, done) {
    const endpoint = Endpoints.collections(this.cliManager.config.defaultSchemaVersion, envId);
    this.cliManager.sendRequest({ endpoint, data, method: HTTPMethod.POST }, done);
  }

  deleteById(envId, id, done) {
    const endpoint = Endpoints.collections(this.cliManager.config.defaultSchemaVersion, envId, id);
    this.cliManager.sendRequest({ endpoint, method: HTTPMethod.DELETE }, done);
  }
}

module.exports = CollectionsService;
