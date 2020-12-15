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

const BaseService = require('./BaseService');
const { HTTPMethod } = require('./Constants');

class RolesService extends BaseService {
  static getAuthorizationHeaderValue(env) {
    const envIdMasterSecretPair = `${env.id}:${env.masterSecret}`;
    const encodedEnvIdMasterSecretPair = (Buffer.from(envIdMasterSecretPair)).toString('base64');
    return `Basic ${encodedEnvIdMasterSecretPair}`;
  }

  getAll(env, done) {
    const endpoint = `roles/${env.id}`;
    const options = {
      endpoint,
      isBaas: true,
      headers: {
        Authorization: RolesService.getAuthorizationHeaderValue(env)
      }
    };
    this.cliManager.sendRequest(options, done);
  }

  create(data, env, done) {
    const endpoint = `roles/${env.id}`;
    const options = {
      endpoint,
      data,
      method: HTTPMethod.POST,
      isBaas: true,
      headers: {
        Authorization: RolesService.getAuthorizationHeaderValue(env)
      }
    };
    this.cliManager.sendRequest(options, done);
  }

  update(id, data, env, done) {
    const endpoint = `roles/${env.id}/${id}`;
    const options = {
      endpoint,
      data,
      method: HTTPMethod.PUT,
      isBaas: true,
      headers: {
        Authorization: RolesService.getAuthorizationHeaderValue(env)
      }
    };
    this.cliManager.sendRequest(options, done);
  }
}

module.exports = RolesService;
