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

const fs = require('fs');

const BaseService = require('./BaseService');
const { HTTPMethod } = require('./Constants');
const { Endpoints, isNullOrUndefined } = require('./Utils');

class PushService extends BaseService {
  configureAndroidSettings(envId, data, done) {
    const endpoint = Endpoints.push(this.cliManager.config.defaultSchemaVersion, envId);
    this.cliManager.sendRequest({ endpoint, data, method: HTTPMethod.PUT }, done);
  }

  configureIosSettings(envId, data, done) {
    const formData = {
      production: JSON.stringify(data.production),
      upload: fs.createReadStream(data.certificateFilePath)
    };

    if (!isNullOrUndefined(data.password)) {
      formData.password = data.password;
    }

    const endpoint = Endpoints.push(this.cliManager.config.defaultSchemaVersion, envId);
    this.cliManager.sendRequest({
      endpoint,
      formData,
      method: HTTPMethod.POST
    }, done);
  }
}

module.exports = PushService;
