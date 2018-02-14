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
const os = require('os');
const path = require('path');

const async = require('async');
const chalk = require('chalk');
const validUrl = require('valid-url');
const isemail = require('isemail');
const isempty = require('lodash.isempty');
const logger = require('./logger.js');
const moment = require('moment');
const { Errors, PromptMessages } = require('./Constants');
const KinveyError = require('./KinveyError');

const Utils = {};
Utils.formatHost = function formatHost(host) {
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

  return `https://${host}-manage.kinvey.com/`;
};

Utils.formatList = function formatList(list, name) {
  if (name == null) name = 'name';
  const result = list.map(el => ({
    name: el[name],
    value: el
  }));
  result.sort((x, y) => {
    if (x[name].toLowerCase() < y[name].toLowerCase()) return -1;
    return 1;
  });
  return result;
};

Utils.formatHostList = function formatHostList(list) {
  const result = list.map(el => ({
    name: el,
    value: el
  }));
  result.unshift({
    name: 'all hosts',
    value: null
  });
  return result;
};

Utils.readFile = function readFile(file, cb) {
  logger.debug('Reading contents from file %s', chalk.cyan(file));
  return fs.readFile(file, cb);
};

Utils.readJSON = function readJSON(file, cb) {
  logger.debug('Reading JSON from file %s', chalk.cyan(file));
  return async.waterfall([
    next => Utils.readFile(file, next),
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
};

/**
 * Reads a file synchronously and returns the data in JSON. Exceptions are not caught.
 * @param {string} filePath
 */
Utils.readJSONSync = function readJSONSync(filePath) {
  const rawData = fs.readFileSync(filePath);
  const jsonData = JSON.parse(rawData);
  return jsonData;
};

Utils.writeFile = function writeFile(file, contents, cb) {
  logger.debug('Writing contents to file %s', chalk.cyan(file));
  return fs.writeFile(file, contents, cb);
};

Utils.writeJSON = function writeJSON(file, json, cb) {
  const contents = JSON.stringify(json);
  return Utils.writeFile(file, contents, cb);
};

Utils.isValidMFAToken = function isValidMFAToken(value) {
  return (/^\d{6}$/.test(value));
};

Utils.isValidEmail = function isValidEmail(value) {
  return !Utils.isNullOrUndefined(value) && isemail(value);
};

Utils.isNullOrUndefined = function isNullOrUndefined(value) {
  return value == null;
};

Utils.isEmpty = function isEmpty(value) {
  return isempty(value);
};

Utils.isValidTimestamp = function isValidTimestamp(ts) {
  return moment(ts, moment.ISO_8601, true).isValid();
};

Utils.isValidNonZeroInteger = function isValidNonZeroInteger(number) {
  if (number === 0 || number === '0') return false;
  return /^\d+$/.test(number);
};

Utils.validateEmail = function validateEmail(value) {
  if (Utils.isValidEmail(value)) {
    return true;
  }

  return PromptMessages.INVALID_EMAIL_ADDRESS;
};

Utils.isStringWhitespace = function isStringWhitespace(value) {
  const trimmedValue = value.trim();
  return trimmedValue.length < 1;
};

Utils.askForValue = function askForValue(value) {
  if (Utils.isNullOrUndefined(value)) {
    return true;
  }

  return false;
};

Utils.validateString = function validateString(value) {
  if (!Utils.isStringWhitespace(value)) {
    return true;
  }

  return PromptMessages.INVALID_STRING;
};

Utils.validateMFAToken = function validateMFAToken(value) {
  if (Utils.isValidMFAToken(value)) {
    return true;
  }

  return PromptMessages.INVALID_MFA_TOKEN;
};

Utils.Endpoints = {
  version: schemaVersion => `v${schemaVersion}`,
  session: () => 'session',
  apps: schemaVersion => `${Utils.Endpoints.version(schemaVersion)}/apps`,
  orgs: schemaVersion => `${Utils.Endpoints.version(schemaVersion)}/organizations`,
  servicesByDomain: (domainType, domainId, serviceId, schemaVersion) => `${Utils.Endpoints.version(schemaVersion)}/${domainType}/${domainId}/data-links`,
  jobs: (schemaVersion, id) => {
    const idPart = id ? `/${id}` : '';
    return `${Utils.Endpoints.version(schemaVersion)}/jobs${idPart}`;
  },
  services: (schemaVersion, serviceId) => `${Utils.Endpoints.version(schemaVersion)}/data-links/${serviceId}`,
  serviceStatus: (schemaVersion, serviceId) => `${Utils.Endpoints.services(schemaVersion, serviceId)}/status`,
  serviceLogs: (schemaVersion, serviceId) => `${Utils.Endpoints.services(schemaVersion, serviceId)}/logs`
};

Utils.getCommandNameFromOptions = function getCommandNameFromOptions(options) {
  let name;
  if (options._ && options._.length) {
    name = options._.join(' ');
  }

  return name;
};

Utils.getErrorFromRequestError = function getErrorFromRequestError(err) {
  let errResult;
  const errCode = err.code;
  if (errCode === 'ENOTFOUND') {
    errResult = new KinveyError(Errors.InvalidConfigUrl);
  } else if (errCode === 'ETIMEDOUT') {
    errResult = new KinveyError(Errors.RequestTimedOut);
  } else if (errCode === 'ECONNRESET') {
    errResult = new KinveyError(Errors.ConnectionReset);
  } else if (errCode === 'ECONNREFUSED') {
    errResult = new KinveyError(errCode, `Connection refused at ${err.address}`);
  } else {
    errResult = err;
  }

  return errResult;
};

Utils.isMFATokenError = function isMFATokenError(err) {
  return err && err.name === 'InvalidTwoFactorAuth';
};

Utils.findAndSortInternalServices = function findAndSortInternalServices(services) {
  const result = services.filter(el => el.type === 'internal');
  result.sort((x, y) => {
    if (x.name.toLowerCase() < y.name.toLowerCase()) {
      return -1;
    }

    return 1;
  });

  return result;
};

Utils.isArtifact = function isArtifact(artifacts, base, filepath) {
  const relative = path.normalize(path.relative(base, filepath));
  for (let i = 0; i < artifacts.length; i += 1) {
    const pattern = artifacts[i];
    if (relative.indexOf(pattern) === 0 || (`${relative}/`) === pattern) return true;
  }
  return false;
};

Utils.getDeviceInformation = function getDeviceInformation(cliVersion) {
  const info = `kinvey-cli/${cliVersion} ${os.platform()} ${os.release()}`;
  return info;
};

module.exports = Utils;
