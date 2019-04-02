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
const path = require('path');

const BaseService = require('./../BaseService');
const { HTTPMethod, LogLevel } = require('./../Constants');
const KinveyError = require('./../KinveyError');
const { Endpoints, isEmpty, isNullOrUndefined } = require('./../Utils');

class SiteEnvsService extends BaseService {
  create(data, siteId, done) {
    const endpoint = Endpoints.siteEnvs(this.cliManager.config.defaultSchemaVersion, siteId);
    this.cliManager.sendRequest({ endpoint, data, method: HTTPMethod.POST }, done);
  }

  getAll(siteId, done) {
    const endpoint = Endpoints.siteEnvs(this.cliManager.config.defaultSchemaVersion, siteId);
    this.cliManager.sendRequest({ endpoint }, done);
  }

  /**
   * Passes to callback appropriate form data for site deploy from relative or absolute path.
   * @param {String} initialPath Relative or absolute path.
   * @param done
   */
  static buildFormData(initialPath, done) {
    const result = {};

    let traversePath;
    traversePath = (currPath, relativePathToInitialTarget) => { // eslint-disable-line
      if (fs.lstatSync(currPath).isFile()) {
        const key = relativePathToInitialTarget || path.basename(currPath);
        result[key] = fs.createReadStream(currPath);
        return;
      }

      if (!fs.lstatSync(currPath).isDirectory()) {
        throw new Error('Path must be either path to file or to directory.');
      }

      const dirContents = fs.readdirSync(currPath);
      dirContents.forEach((x) => {
        const separator = relativePathToInitialTarget ? '/' : ''; // evades leading slash
        traversePath(path.join(currPath, x), `${relativePathToInitialTarget}${separator}${x}`);
      });
    };

    if (!fs.existsSync(initialPath)) {
      return setImmediate(() => { done(new KinveyError('InvalidPath', `Path '${initialPath}' does not exist.`)); });
    }

    try {
      traversePath(initialPath, '');
    } catch (ex) {
      return setImmediate(() => { done(ex); });
    }

    return setImmediate(() => { done(null, result); });
  }

  deploy({ siteId, siteEnvId, targetPath }, done) {
    SiteEnvsService.buildFormData(targetPath, (err, formData) => {
      if (err) {
        return done(err);
      }

      const req = this.cliManager.sendRequest({
        method: HTTPMethod.POST,
        endpoint: Endpoints.siteDeploy(this.cliManager.config.defaultSchemaVersion, siteId, siteEnvId),
        headers: {
          'Transfer-Encoding': 'chunked'
        },
        formData,
        timeout: this.cliManager.config.siteUploadTimeout
      }, (err, data) => {
        if (err) {
          return done(err);
        }

        done(null, data);
      });

      req.on('pipe', () => req.removeHeader('Content-Length'));
      req.once('error', (err) => {
        this.cliManager.log(LogLevel.DEBUG, 'Aborting the request because of error: %s', err.message || err);
        req.abort();
      });
    });
  }
}

module.exports = SiteEnvsService;
