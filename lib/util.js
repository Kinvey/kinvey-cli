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

const fs = require('fs');
const async = require('async');
const chalk = require('chalk');
const validUrl = require('valid-url');
const KinveyError = require('./error.js');
const logger = require('./logger.js');
const request = require('./request.js');

const user = require('./user.js');

function formatHost(host) {
  let validHost = validUrl.isHttpUri(host);
  if (validHost) {
    if (validHost.slice(-1) !== '/') {
      validHost = `${validHost}/`;
    }
    return validHost;
  }

  validHost = validUrl.isHttpsUri(host);
  if (validHost) {
    if (validHost.slice(-1) !== '/') {
      validHost = `${validHost}/`;
    }
    return validHost;
  }

  return 'https://' + host + '-manage.kinvey.com/';
}

function formatList(list, name) {
  if (name == null) name = 'name';
  const result = list.map((el) => {
    return {
      name: el[name],
      value: el
    };
  });
  result.sort((x, y) => {
    if (x[name].toLowerCase() < y[name].toLowerCase()) return -1;
    return 1;
  });
  return result;
}

function formatHostList(list) {
  const result = list.map((el) => {
    return {
      name: el,
      value: el
    };
  });
  result.unshift({
    name: 'all hosts',
    value: null
  });
  return result;
}

function makeRequest(options, cb) {
  if (options.method == null) options.method = 'GET';
  if (user.isLoggedIn()) {
    if (options.headers == null) options.headers = {};
    if (options.headers != null) options.headers.Authorization = `Kinvey ${user.getToken()}`;
  }
  logger.debug('Request:  %s %s', options.method, options.url);
  return request.Request(options, (err, response) => {
    const connErrors = ['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'PROTOCOL_CONNECTION_LOST'];
    if (err != null) {
      if (err.message.indexOf('ENOTFOUND') !== -1) return cb(new KinveyError('InvalidConfigUrl'));
      for (let i = 0; i < connErrors.length; i++) {
        const msg = connErrors[i];
        if (err.message.indexOf(msg) !== -1) return cb(new KinveyError('ConnectionError'));
      }
      return cb(err);
    }
    logger.debug('Response: %s %s %s', options.method, options.url, chalk.green(response.statusCode));
    if (parseInt(response.statusCode / 100, 10) === 2) return cb(null, response);
    if ((response.body != null && response.body.code != null) && response.body.code === 'InvalidCredentials') {
      logger.warn('Invalid credentials, please authenticate.');
      if (options.refresh !== false) {
        return user.refresh((err) => {
          if (err != null) return cb(err);
          return makeRequest(options, cb);
        });
      }
    }
    if (response.body != null && response.body != null) return cb(new KinveyError(response.body.code, response.body.description));
    return cb(new KinveyError('RequestError', response.statusCode));
  });
}

function readFile(file, cb) {
  logger.debug('Reading contents from file %s', chalk.cyan(file));
  return fs.readFile(file, cb);
}

function readJSON(file, cb) {
  logger.debug('Reading JSON from file %s', chalk.cyan(file));
  return async.waterfall([
    (next) => readFile(file, next),
    (data, next) => {
      let json = null;
      try {
        logger.debug('Parsing JSON from file: %s', chalk.cyan(file));
        json = JSON.parse(data);
      } catch (error) {
        logger.warn('Invalid JSON in file %s', chalk.cyan(file));
        return next(error);
      }
      return next(null, json);
    }
  ], cb);
}

function writeFile(file, contents, cb) {
  logger.debug('Writing contents to file %s', chalk.cyan(file));
  return fs.writeFile(file, contents, cb);
}

function writeJSON(file, json, cb) {
  logger.debug('Writing JSON to file %s', chalk.cyan(file));
  const contents = JSON.stringify(json);
  return writeFile(file, contents, cb);
}

function handleActionFailure(err, cb) {
  if (err != null) {
    logger.error('%s', err);
    if (cb == null) process.exit(-1);
  }
  if (cb != null) cb(err);
}

exports.formatHost = formatHost;
exports.formatList = formatList;
exports.formatHostList = formatHostList;
exports.makeRequest = makeRequest;
exports.readFile = readFile;
exports.readJSON = readJSON;
exports.writeFile = writeFile;
exports.writeJSON = writeJSON;
exports.handleActionFailure = handleActionFailure;
