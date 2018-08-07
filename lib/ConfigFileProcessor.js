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
const async = require('async');
const path = require('path');
const logger = require('./logger.js');
const chalk = require('chalk');
const lodashIsObject = require('lodash.isobject');
const lodashIsString = require('lodash.isstring');
const { ConfigType, ConfigFiles } = require('./Constants');
const SchemaValidator = require('./SchemaValidator');
const { getConfigTypeError } = require('./Utils');

class ConfigFileProcessor {
  constructor(options) {
    this.envProcessor = options.envFileProcessor;
    this.serviceFileProcessor = options.serviceFileProcessor;
  }

  /**
   * Processes a config file.
   * @param {Object} options
   * @param {String} options.file File path
   * @param {Constants.OperationType} options.operationType
   * @param {Constants.ConfigType} options.configType - The expected config type.
   * @param {String} [options.name] - Name of entity to create.
   * @param done
   */
  process(options, done) {
    let actualConfigType;

    async.series([
      (next) => {
        ConfigFileProcessor.readJSONConfigFile(options.file, (err, parsedData) => {
          if (err) {
            return next(err);
          }

          options.parsedData = parsedData;
          actualConfigType = parsedData.configType;
          next();
        });
      },
      (next) => {
        const expectedConfigType = options.configType;
        if (expectedConfigType !== actualConfigType) {
          const errMsg = `You have specified the wrong type of config file. Expected: ${expectedConfigType}`;
          return setImmediate(() => next(new Error(errMsg)));
        }

        SchemaValidator.validate(actualConfigType, options.parsedData, null, next);
      },
      (next) => {
        if (actualConfigType === ConfigType.ENV) {
          this.envProcessor.process(options, next);
        } else if (actualConfigType === ConfigType.SERVICE) {
          this.serviceFileProcessor.process(options, next);
        } else {
          return setImmediate(() => next(getConfigTypeError(actualConfigType)));
        }
      }
    ], (err, results) => {
      if (err) {
        return done(err);
      }

      done(null, results.pop());
    });
  }

  /**
   * Reads a JSON configuration file and returns a JavaScript object. Does all the necessary processing and resolves all referenced files.
   * @param {string} filePath
   */
  static readJSONConfigFile(file, cb) {
    ConfigFileProcessor._readJSONConfigFile(file, 'root', (err, config) => {
      logger.debug('Final configuration: ' + JSON.stringify(config, null, 4));
      cb(err, config);
    });
  }

  static _readJSONConfigFile(file, fieldPath, cb) {
    const dirname = path.dirname(file);
    logger.debug('Reading JSON config from file %s', chalk.cyan(file));
    return async.waterfall([
      next => fs.readFile(file, next),
      (data, next) => {
        let json = null;
        try {
          logger.debug('Parsing JSON config from file: %s', chalk.cyan(file));
          json = JSON.parse(data);
        } catch (error) {
          logger.warn('Invalid JSON in file %s', chalk.cyan(file));
          return next(error);
        }
        return next(null, json);
      },
      (json, next) => {
        logger.debug('Resolving referenced files for %s', chalk.cyan(file));
        ConfigFileProcessor._processConfigFileValue(json, dirname, fieldPath, (err, processedValue) => {
          if (err) {
            logger.warn('Error while resolving referenced files for %s!', chalk.cyan(file));
            return next(err);
          }

          logger.debug('Referenced files resolved for %s', chalk.cyan(file));

          return next(null, processedValue);
        });
      }
    ], cb);
  }

  static _processConfigFileValue(obj, baseFolder, fieldPath, done) {
    if (Array.isArray(obj) || lodashIsObject(obj)) {
      async.forEachOfSeries(
        obj,
        (value, key, callback) => {
          // console.log(key + '    ' + JSON.stringify(value));
          ConfigFileProcessor._processConfigFileValue(value, baseFolder, `${fieldPath}.${key}`, (err, processedValue) => {
            obj[key] = processedValue;
            callback(err, processedValue);
          });
        },
        (err) => {
          done(err, obj);
        }
      );
    } else if (lodashIsString(obj)) {
      if (obj.indexOf(ConfigFiles.FILE_REFERENCE_PREFIX) === 0) {
        let filePath = obj.substring(ConfigFiles.FILE_REFERENCE_PREFIX.length);
        logger.debug('Found referenced file in "%s": %s', fieldPath, chalk.cyan(filePath));
        filePath = path.resolve(baseFolder, filePath);
        logger.debug('Resolving config file: %s', chalk.cyan(filePath));
        this._readJSONConfigFile(filePath, fieldPath, done);
      } else {
        return done(null, obj);
      }
    } else {
      return done(null, obj);
    }
  }
}

module.exports = ConfigFileProcessor;
