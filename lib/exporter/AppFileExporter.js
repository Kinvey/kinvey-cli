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
const fs = require('fs');
const path = require('path');

const { AppOptionsName, LogLevel } = require('../Constants');
const { isEmpty, pickBy, mkdirp } = require('../Utils');

class AppFileExporter {
  constructor(options) {
    this.cliManager = options.cliManager;
    this.applicationsService = options.applicationsService;
    this.envExporter = options.envExporter;
    this._baseExport = {
      schemaVersion: '1.0.0',
      configType: 'application'
    };
  }

  exportApp(options, done) {
    const appIdentifier = options[AppOptionsName.APP];
    const filepath = path.resolve(options.file);
    let exportData;
    let rawData;

    async.series([
      (next) => {
        this.applicationsService.getByIdOrName(appIdentifier, (err, data) => {
          if (err) {
            return next(err);
          }

          rawData = data;
          next();
        });
      },
      (next) => {
        const dir = `${path.dirname(filepath)}/environments`;
        this._exportEnvironments({ dir, environments: rawData.environments }, (err, exportedEnvs) => {
          if (err) {
            return next(err);
          }

          const keysToPick = ['realtime', 'sessionTimeoutInSeconds'];
          const settings = pickBy(rawData, (value, currentKey) => {
            return value !== null && keysToPick.includes(currentKey);
          });
          exportData = Object.assign({}, this._baseExport, { settings });
          exportData.environments = exportedEnvs;
          next();
        });
      }
    ], (err) => {
      if (err) {
        return done(err);
      }

      this.cliManager.log(LogLevel.DEBUG, `Writing configuration to file: ${filepath}`);
      try {
        fs.writeFileSync(filepath, JSON.stringify(exportData, null, 4));
      } catch (ex) {
        return done(ex);
      }

      done(null, exportData);
    });
  }

  _exportEnvironments(options, done) {
    const exportedEnvs = {};

    async.series([
      (next) => {
        mkdirp(`${options.dir}/a`, next); // mkdirp expects filePath to create the directory
      },
      (next) => {
        async.eachSeries(
          options.environments,
          (env, cb) => {
            const fileName = `${env.name}.json`;
            const filePath = `${options.dir}/${fileName}`;
            this.envExporter.export({ env, filename: filePath }, (err) => {
              if (err) {
                return cb(err);
              }

              exportedEnvs[env.name] = `./${path.basename(options.dir)}/${fileName}`;
              cb();
            });
          }, next);
      }
    ], (err) => {
      if (err) {
        return done(err);
      }

      done(null, exportedEnvs);
    });
  }
}

module.exports = AppFileExporter;
