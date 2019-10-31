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

const EOL = require('os').EOL;

const request = require('request');

const { Errors, HTTPMethod } = require('./Constants');
const KinveyError = require('./KinveyError');
const Utils = require('./Utils');

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
   * @param {String} options.cliVersion
   * @param {Object} [options.headers]
   * @params {String} [options.method] HTTP method
   * @param {String} [options.endpoint] Endpoint, relative to the base URL (e.g. 'v2/apps')
   * @param {String} [options.query] Query string that will be appended to the endpoint
   * @param {Number} [options.timeout]
   * @param [options.data] Set as request body
   * @param [options.formData]
   * @param {Boolean} [options.skipAuth] If true, doesn't send authorization header.
   * @param {Boolean} [options.isBaas] If true, options.baasHost will be used (if set) or the host will be modified.
   * @param {String} [options.baasHost] BAAS host that will be used if options.isBaas is true.
   */
  constructor(user, options) {
    this.options = {};
    this._init(user, options);
  }

  _init(user, options) {
    this._buildHeaders(user, options);
    this._buildURL(user, options);

    this.options.method = options.method || HTTPMethod.GET;
    if (options.timeout) {
      this.options.timeout = options.timeout;
    }
    this.options.json = true;

    if (options.data) {
      this.options.body = options.data;
    }

    if (options.formData) {
      this.options.formData = options.formData;
    }
  }

  _buildHeaders(user, options) {
    this.options.headers = {};
    if (!Utils.isNullOrUndefined(options.headers)) {
      this.options.headers = options.headers;
    }

    this.options.headers['X-Kinvey-Device-Information'] = Utils.getDeviceInformation(options.cliVersion);
    this._buildAuthHeader(user, options);
  }

  _buildAuthHeader(user, options) {
    if (options.skipAuth) {
      return;
    }

    if (!Utils.isNullOrUndefined(this.options.headers.Authorization)) {
      return;
    }

    if (!Utils.isEmpty(user)) {
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

    if (options.isBaas) {
      host = options.baasHost || host.replace('manage', 'baas');
    }

    if (!host.endsWith('/')) {
      host = `${host}/`;
    }

    this.options.url = `${host}${options.endpoint}`;

    if (options.query) {
      this.options.qs = options.query;
    }
  }

  static _getDebugMessage(debug) {
    if (Utils.isNullOrUndefined(debug)) {
      return '';
    }

    let debugMsg = '';
    if (debug.message) {
      debugMsg = debug.message;
    } else if (typeof debug === 'string') {
      debugMsg = debug;
    } else if (typeof debug === 'object') {
      debugMsg = JSON.stringify(debug);
    }

    return debugMsg;
  }

  static _getProcessedError(err, response) {
    const isSuccess = !err && response && response.statusCode >= 200 && response.statusCode < 300;
    if (isSuccess) {
      return null;
    }

    if (err) {
      return Utils.getErrorFromRequestError(err);
    }

    // status is not 2xx
    if (response.body) {
      let errMsg = response.body.description || '';
      const debugMsg = Request._getDebugMessage(response.body.debug);
      if (debugMsg) {
        errMsg += ` ${debugMsg}`;
      }

      const errors = response.body.errors;
      if (!Utils.isEmpty(errors) && Array.isArray(errors)) {
        errors.forEach((x) => {
          const field = x.field ? `Field: ${x.field}.` : '';
          errMsg += `${EOL}\t${field} ${x.message}`;
        });
      }

      return new KinveyError(response.body.code, errMsg);
    }

    let errMsg = response.statusCode;
    if (response.statusMessage) {
      errMsg += ` ${response.statusMessage}`;
    }

    return new KinveyError(Errors.RequestError.NAME, errMsg);
  }

  _send(done) {
    return request(this.options, done);
  }

  /**
   * Sends request. Callback receives error if one has occurred or status code is different than 2xx.
   * @param done
   * @returns {*} Request instance that could be used to abort the request.
   */
  send(done) {
    return this._send((err, response) => {
      const errResult = Request._getProcessedError(err, response);
      if (errResult) {
        return done(errResult, response || {});
      }

      done(null, response);
    });
  }
}

module.exports = Request;
