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
const path = require('path');
const async = require('async');
const chalk = require('chalk');
const validUrl = require('valid-url');
const isemail = require('isemail');
const isnil = require('lodash.isnil');
const isempty = require('lodash.isempty');
const logger = require('./logger.js');
const moment = require('moment');
const { HTTPConnectionErrors, PromptMessages } = require('./constants');

const utils = {};
utils.formatHost = function formatHost(host) {
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
};

utils.formatList = function formatList(list, name) {
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
};

utils.formatHostList = function formatHostList(list) {
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
};

utils.readFile = function readFile(file, cb) {
  logger.debug('Reading contents from file %s', chalk.cyan(file));
  return fs.readFile(file, cb);
};

utils.readJSON = function readJSON(file, cb) {
  logger.debug('Reading JSON from file %s', chalk.cyan(file));
  return async.waterfall([
    (next) => utils.readFile(file, next),
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
utils.readJSONSync = function readJSONSync(filePath) {
  const rawData = fs.readFileSync(filePath);
  const jsonData = JSON.parse(rawData);
  return jsonData;
};

utils.writeFile = function writeFile(file, contents, cb) {
  logger.debug('Writing contents to file %s', chalk.cyan(file));
  return fs.writeFile(file, contents, cb);
};

utils.writeJSON = function writeJSON(file, json, cb) {
  logger.debug('Writing JSON to file %s', chalk.cyan(file));
  const contents = JSON.stringify(json);
  return utils.writeFile(file, contents, cb);
};

utils.isValidMFAToken = function isValidMFAToken(value) {
  return (/^\d{6}$/.test(value));
};

utils.isValidEmail = function isValidEmail(value) {
  return isemail(value);
};

utils.isNullOrUndefined = function isNullOrUndefined(value) {
  return isnil(value);
};

utils.isEmpty = function isEmpty(value) {
  return isempty(value);
};

utils.isValidTimestamp = function isValidTimestamp(ts) {
  return moment(ts, moment.ISO_8601, true).isValid();
};

utils.isValidNonZeroInteger = function isValidNonZeroInteger(number) {
  if (number === 0 || number === '0') return false;
  return /^\d+$/.test(number);
};

utils.validateEmail = function validateEmail(value) {
  if (utils.isValidEmail(value)) {
    return true;
  }

  return PromptMessages.INVALID_EMAIL_ADDRESS;
};

utils.isStringWhitespace = function isStringWhitespace(value) {
  const trimmedValue = value.trim();
  return trimmedValue.length < 1;
};

utils.askForValue = function askForValue(value) {
  if (utils.isNullOrUndefined(value)) {
    return true;
  }

  return false;
};

utils.validateString = function validateString(value) {
  if (!utils.isStringWhitespace(value)) {
    return true;
  }

  return PromptMessages.INVALID_STRING;
};

utils.validateMFAToken = function validateMFAToken(value) {
  if (utils.isValidMFAToken(value)) {
    return true;
  }

  return PromptMessages.INVALID_MFA_TOKEN;
};

utils.Endpoints = {
  version: (schemaVersion) => {
    return `v${schemaVersion}`;
  },
  session: () => {
    return 'session';
  },
  apps: (schemaVersion) => {
    return `${utils.Endpoints.version(schemaVersion)}/apps`;
  },
  orgs: (schemaVersion) => {
    return `${utils.Endpoints.version(schemaVersion)}/organizations`;
  },
  servicesByDomain: (domainType, domainId, serviceId, schemaVersion) => {
    return `${utils.Endpoints.version(schemaVersion)}/${domainType}/${domainId}/data-links`;
  },
  jobs: (schemaVersion, id) => {
    const idPart = id ? `/${id}` : '';
    return `${utils.Endpoints.version(schemaVersion)}/jobs${idPart}`;
  },
  services: (schemaVersion, serviceId) => {
    return `${utils.Endpoints.version(schemaVersion)}/data-links/${serviceId}`;
  },
  serviceStatus: (schemaVersion, serviceId) => {
    return `${utils.Endpoints.services(schemaVersion, serviceId)}/status`;
  },
  serviceLogs: (schemaVersion, serviceId) => {
    return `${utils.Endpoints.services(schemaVersion, serviceId)}/logs`;
  }
};

utils.getCommandNameFromOptions = function getCommandNameFromOptions(options) {
  let name;
  if (options._ && options._.length) {
    name = options._.join(' ');
  }

  return name;
};

utils.isConnectionError = function isConnectionError(err) {
  if (!(err && err.message)) {
    return false;
  }

  for (let i = 0; i < HTTPConnectionErrors.length; i++) {
    const connectionErr = HTTPConnectionErrors[i];
    if (err.message.includes(connectionErr)) {
      return true;
    }
  }

  return false;
};

utils.findAndSortInternalServices = function findAndSortInternalServices(services) {
  const result = services.filter((el) => el.type === 'internal');
  result.sort((x, y) => {
    if (x.name.toLowerCase() < y.name.toLowerCase()) {
      return -1;
    }

    return 1;
  });

  return result;
};

utils.isArtifact = function isArtifact(artifacts, base, filepath) {
  const relative = path.normalize(path.relative(base, filepath));
  for (let i = 0; i < artifacts.length; i++) {
    const pattern = artifacts[i];
    if (relative.indexOf(pattern) === 0 || (`${relative}/`) === pattern) return true;
  }
  return false;
};

module.exports = utils;
