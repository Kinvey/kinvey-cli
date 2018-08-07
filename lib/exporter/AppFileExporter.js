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
const { isEmpty, pickBy } = require('../Utils');

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

    this.applicationsService.getByIdOrName(appIdentifier, (err, data) => {
      if (err) {
        return done(err);
      }

      const settings = pickBy(data, ['name', 'realtime', 'icon'], (x) => { return x !== null; });
      const exportData = Object.assign({}, this._baseExport, { settings });
      const exportedEnvs = {};

      async.eachSeries(
        data.environments,
        (env, next) => {
          this.envExporter.export({ env, storeCodeAsFile: false, writeToFile: false }, (err, exportedEnv) => {
            if (err) {
              return next(err);
            }

            delete exportedEnv.configType;
            delete exportedEnv.schemaVersion;

            exportedEnvs[env.name] = exportedEnv;
            next();
          });
        }, (err) => {
          if (err) {
            return done(err);
          }

          exportData.environments = exportedEnvs;
          this.cliManager.log(LogLevel.DEBUG, `Writing configuration to file: ${filepath}`);
          try {
            fs.writeFileSync(filepath, JSON.stringify(exportData, null, 4));
          } catch (ex) {
            return done(ex);
          }

          done(null, exportData);
        });
    });
  }
}

module.exports = AppFileExporter;
