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

const { AppOptionsName, ConfigType, ConfigFiles, DomainTypes, LogLevel } = require('../Constants');
const { isEmpty, pickBy, mkdirp, writeConfigFile } = require('../Utils');

class AppFileExporter {
  constructor(options) {
    this.cliManager = options.cliManager;
    this.applicationsService = options.applicationsService;
    this.servicesService = options.servicesService;
    this.envExporter = options.envExporter;
    this.serviceExporter = options.serviceExporter;
    this._baseExport = {
      schemaVersion: '1.0.0',
      configType: ConfigType.APP
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
        const dir = path.dirname(filepath);
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
      },
      (next) => {
        const dir = `${path.dirname(filepath)}/services`;
        this._exportServices({ dir, app: rawData }, (err, exportedServices) => {
          if (err) {
            return next(err);
          }

          exportData.services = exportedServices;
          next();
        });
      }
    ], (err) => {
      if (err) {
        return done(err);
      }

      this.cliManager.log(LogLevel.DEBUG, `Writing configuration to file: ${filepath}`);
      writeConfigFile(filepath, exportData, done);
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
            const envDir = `environments/${env.name}`;
            const filePath = `${options.dir}/${envDir}/${fileName}`;
            this.envExporter.export({ env, filename: filePath }, (err) => {
              if (err) {
                return cb(err);
              }

              exportedEnvs[env.name] = `${ConfigFiles.FILE_REFERENCE_PREFIX}./${envDir}/${fileName}`;
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

  _exportServices(options, done) {
    const exportedServices = {};

    async.waterfall([
      (next) => {
        this.servicesService.getAllOwnedByApp(options.app.id, false, next);
      },
      (services, next) => {
        async.eachSeries(
          services,
          (currService, cb) => {
            const fileName = `${currService.name}.json`;
            this.serviceExporter.exportService({ service: currService, file: `${options.dir}/${fileName}` }, (err) => {
              if (err) {
                return cb(err);
              }

              exportedServices[currService.name] = `${ConfigFiles.FILE_REFERENCE_PREFIX}./${path.basename(options.dir)}/${fileName}`;
              cb();
            });
          },
          next
        );
      }
    ], (err) => {
      if (err) {
        return done(err);
      }

      done(null, exportedServices);
    });
  }
}

module.exports = AppFileExporter;
