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

const BaseService = require('./BaseService');
const { EndpointFieldNames, HTTPMethod, OperationType } = require('./Constants');
const { Endpoints, getObjectByOmitting, isNullOrUndefined, readFile } = require('./Utils');

class BusinessLogicService extends BaseService {
  getCommonCode(envId, name, fields, done) {
    let endpoint = Endpoints.commonCode(this.cliManager.config.defaultSchemaVersion, envId, name);
    if (fields) endpoint += '?fields=' + encodeURIComponent(fields);
    this.cliManager.sendRequest({ endpoint, method: HTTPMethod.GET }, done);
  }

  createCommonCode(source = {}, envId, done) {
    const data = getObjectByOmitting(source, ['codeFile']);

    async.series([
      (next) => {
        BusinessLogicService._getCodeContent(source, source.name, (err, code) => {
          if (err) {
            return next(err);
          }

          data.code = code;
          next();
        });
      },
      (next) => {
        const endpoint = Endpoints.commonCode(this.cliManager.config.defaultSchemaVersion, envId);
        this.cliManager.sendRequest({ endpoint, data, method: HTTPMethod.POST }, next);
      }
    ], (err, results) => {
      if (err) {
        return done(err);
      }

      done(null, results.pop());
    });
  }

  updateCommonCode(name, source, envId, done) {
    const data = getObjectByOmitting(source, ['codeFile']);

    async.series([
      (next) => {
        BusinessLogicService._getCodeContent(source, name, (err, code) => {
          if (err) {
            return next(err);
          }

          data.code = code;
          next();
        });
      },
      (next) => {
        const endpoint = Endpoints.commonCode(this.cliManager.config.defaultSchemaVersion, envId, name);
        this.cliManager.sendRequest({ endpoint, data, method: HTTPMethod.PUT }, next);
      }
    ], (err, results) => {
      if (err) {
        return done(err);
      }

      done(null, results.pop());
    });
  }

  getCollectionHooks(envId, done) {
    let endpoint = Endpoints.collectionHooks(this.cliManager.config.defaultSchemaVersion, envId);
    endpoint += '?fields=["sdkHandlerName","host", "code"]';
    this.cliManager.sendRequest({ endpoint }, done);
  }

  createOrUpdateHook(source = {}, envId, collName, hookName, done) {
    const data = getObjectByOmitting(source, ['codeFile', 'type', 'service', 'handlerName']);

    async.series([
      (next) => {
        BusinessLogicService._getCodeContent(source, hookName, (err, code) => {
          if (err) {
            return next(err);
          }

          data.code = code;
          next();
        });
      },
      (next) => {
        const endpoint = Endpoints.hooks(this.cliManager.config.defaultSchemaVersion, envId, collName, hookName);
        this.cliManager.sendRequest({ endpoint, data, method: HTTPMethod.PUT }, next);
      }
    ], (err, results) => {
      if (err) {
        return done(err);
      }

      done(null, results.pop());
    });
  }

  createEndpoint(source = {}, envId, done) {
    this._createOrUpdateEndpoint(source, envId, OperationType.CREATE, null, done);
  }

  updateEndpoint(name, source = {}, envId, done) {
    this._createOrUpdateEndpoint(source, envId, OperationType.UPDATE, name, done);
  }

  _createOrUpdateEndpoint(source = {}, envId, operationType, name, done) {
    const data = getObjectByOmitting(source, ['codeFile', 'type', 'service', 'handlerName']);

    async.series([
      (next) => {
        BusinessLogicService._getCodeContent(source, source.name, (err, code) => {
          if (err) {
            return next(err);
          }

          data.code = code;
          next();
        });
      },
      (next) => {
        const endpoint = Endpoints.endpoints(this.cliManager.config.defaultSchemaVersion, envId, name);
        const method = operationType === OperationType.CREATE ? HTTPMethod.POST : HTTPMethod.PUT;
        this.cliManager.sendRequest({ endpoint, data, method }, next);
      }
    ], (err, results) => {
      if (err) {
        return done(err);
      }

      done(null, results.pop());
    });
  }

  getEndpoints(envId, name, done) {
    const endpoint = Endpoints.endpoints(this.cliManager.config.defaultSchemaVersion, envId, name);
    const fields = EndpointFieldNames.reduce((accumulator, currentField, index, arr) => {
      let currentValue = `"${currentField}"`;
      if (index < arr.length - 1) {
        currentValue += ',';
      }

      accumulator += currentValue;
      return accumulator;
    }, '');

    const query = isNullOrUndefined(name) ? `fields=[${fields}]` : null;
    this.cliManager.sendRequest({ endpoint, query, method: HTTPMethod.GET }, done);
  }

  static _getCodeContent(source, name, done) {
    const inlineCodeIsSet = isNullOrUndefined(source.code) === false;
    const codeFileIsSet = isNullOrUndefined(source.codeFile) === false;
    if (!inlineCodeIsSet && !codeFileIsSet) {
      return setImmediate(() => { done(new Error(`Either "code" or "codeFile" must be set for "${name}".`)); });
    }

    if (inlineCodeIsSet) {
      return setImmediate(() => { done(null, source.code); });
    }

    readFile(source.codeFile, (err, content) => {
      if (err) {
        return done(err);
      }

      done(null, content.toString());
    });
  }
}

module.exports = BusinessLogicService;
