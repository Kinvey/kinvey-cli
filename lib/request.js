/**
 * Copyright (c) 2017, Kinvey, Inc. All rights reserved.
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

const request = require('request');

const config = require('config');
const { Errors, HTTPMethod } = require('./constants');
const KinveyError = require('./kinvey-error');
const { isConnectionError, isEmpty, isNullOrUndefined } = require('./utils');

/**
 * Responsible for making HTTP requests.
 */
class Request {
  /**
   * Create an instance.
   * @param {Object} [user]
   * @param {String} user.email
   * @param {String} user.token
   * @param {String} user.host
   * @param {Object} options
   * @param {Object} [options.headers]
   * @params {String} [options.method] HTTP method
   * @param {String} [options.endpoint] Endpoint, relative to the base URL (e.g. 'v2/apps')
   * @param {Number} [options.timeout]
   * @param [options.data] Set as request body
   * @param [options.formData]
   */
  constructor(user, options) {
    this.options = {};
    this._init(user, options);
  }

  _init(user, options) {
    this.options.headers = {};
    if (!isNullOrUndefined(options.headers)) {
      this.options.headers = options.headers;
    }

    this._buildAuthHeader(user, options);
    this._buildURL(user, options);

    this.options.method = options.method || HTTPMethod.GET;
    this.options.timeout = options.timeout || config.timeout;
    this.options.json = true;

    if (options.data) {
      this.options.body = options.data;
    }

    if (options.formData) {
      this.options.formData = options.formData;
    }
  }

  _buildAuthHeader(user, options) {
    if (options.skipAuth) {
      return;
    }

    if (!isEmpty(user)) {
      this.options.headers.Authorization = `Kinvey ${user.token}`;
    }
  }

  _buildURL(user, options) {
    let host;
    if (user) {
      host = user.host;
    } else {
      host = options.host;
    }

    this.options.url = `${host}${options.endpoint}`;
  }

  _getProcessedError(err, response) {
    const isSuccess = !err && response && response.statusCode >= 200 && response.statusCode < 300;
    if (isSuccess) {
      return null;
    }

    if (err) {
      if (err.message.includes('ENOTFOUND')) {
        return new KinveyError(Errors.InvalidConfigUrl);
      }

      if (isConnectionError(err)) {
        return new KinveyError(Errors.ConnectionError);
      }

      return err;
    }

    // status is not 2xx
    if (response.statusCode === 401) {
      return new KinveyError(Errors.InvalidCredentials);
    }

    if (response.body) {
      const errMsg = response.body.debug || response.body.description;
      return new KinveyError(response.body.code, errMsg);
    }

    return new KinveyError(Errors.RequestError.NAME, response.statusCode);
  }

  /**
   * Sends request. Callback receives error if one has occurred or status code is different than 2xx.
   * @param done
   * @returns {*} Request instance that could be used to abort the request.
   */
  send(done) {
    return request(this.options, (err, response) => {
      const errResult = this._getProcessedError(err, response);
      if (errResult) {
        response = response || {};
        return done(errResult, response);
      }

      done(null, response);
    });
  }
}

module.exports = Request;
