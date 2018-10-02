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

const { AppOptionsName, ConfigType, DomainTypes, LogLevel, OrgOptionsName } = require('../Constants');
const { isEmpty, mkdirp } = require('../Utils');

class OrgFileExporter {
  constructor(options) {
    this.cliManager = options.cliManager;
    this.organizationsService = options.organizationsService;
    this.applicationsService = options.applicationsService;
    this.servicesService = options.servicesService;
    this.appExporter = options.appExporter;
    this.serviceExporter = options.serviceExporter;
    this._baseExport = {
      schemaVersion: '1.0.0',
      configType: ConfigType.ORG
    };
  }

  /**
   * Exports an org to a file along with its apps and services.
   * @param {Object} options
   * @param {String} options.org Org identifier - ID or name.
   * @param {String} options.file File path where to export.
   * @param done
   */
  exportOrg(options, done) {
    const orgIdentifier = options[OrgOptionsName.ORG];
    const filepath = path.resolve(options.file);
    let exportData;
    let rawData;

    async.series([
      (next) => {
        this.organizationsService.getByIdOrName(orgIdentifier, (err, data) => {
          if (err) {
            return next(err);
          }

          rawData = data;
          const settings = {
            security: rawData.security
          };
          exportData = Object.assign({}, this._baseExport, { settings });
          next();
        });
      },
      (next) => {
        const dir = `${path.dirname(filepath)}/applications`;
        this._exportApps({ dir, orgId: rawData.id }, (err, exportedApps) => {
          if (err) {
            return next(err);
          }


          exportData.applications = exportedApps;
          next();
        });
      },
      (next) => {
        const dir = `${path.dirname(filepath)}/services`;
        this._exportServices({ dir, orgId: rawData.id }, (err, exportedServices) => {
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
      try {
        fs.writeFileSync(filepath, JSON.stringify(exportData, null, 4));
      } catch (ex) {
        return done(ex);
      }

      done(null, exportData);
    });
  }

  /**
   * Exports the org's apps if any.
   * @param {Object} options
   * @param {String} options.dir Directory where to export the apps.
   * @param {String} options.orgId ID of the org.
   * @param done
   * @private
   */
  _exportApps(options, done) {
    const result = {};
    let apps;

    async.series([
      (next) => {
        this.applicationsService.getByOrg(options.orgId, (err, data) => {
          if (err) {
            return next(err);
          }

          apps = data;
          next();
        });
      },
      (next) => {
        if (isEmpty(apps)) {
          return setImmediate(next);
        }

        mkdirp(`${options.dir}/a`, next); // mkdirp expects filePath to create the directory
      },
      (next) => {
        async.eachSeries(
          apps,
          (currApp, cb) => {
            const appName = currApp.name;
            const fileName = `${appName}.json`;
            const filePath = `${options.dir}/${appName}/${fileName}`;
            this.appExporter.exportApp({ file: filePath, [AppOptionsName.APP]: currApp.id }, (err) => {
              if (err) {
                return cb(err);
              }

              result[appName] = `./${path.basename(options.dir)}/${fileName}`;
              cb();
            });
          },
          next
        );
      }
    ], (err) => {
      done(err, result);
    });
  }

  /**
   * Exports the org's services if any.
   * @param {Object} options
   * @param {String} options.dir Directory where to export the services.
   * @param {String} options.orgId ID of the org.
   * @param done
   * @private
   */
  _exportServices(options, done) {
    const result = {};
    let services;

    async.series([
      (next) => {
        this.servicesService.getAllByDomainType(DomainTypes.ORG, { id: options.orgId }, (err, data) => {
          if (err) {
            return next(err);
          }

          services = data;
          next();
        });
      },
      (next) => {
        if (isEmpty(services)) {
          return setImmediate(next);
        }

        mkdirp(`${options.dir}/a`, next); // mkdirp expects filePath to create the directory
      },
      (next) => {
        async.eachSeries(
          services,
          (currService, cb) => {
            const serviceName = currService.name;
            const fileName = `${serviceName}.json`;
            const filePath = `${options.dir}/${fileName}`;
            this.serviceExporter.exportService({ file: filePath, serviceId: currService.id }, (err) => {
              if (err) {
                return cb(err);
              }

              result[serviceName] = `./${path.basename(options.dir)}/${fileName}`;
              cb();
            });
          },
          next
        );
      }
    ], (err) => {
      done(err, result);
    });
  }
}

module.exports = OrgFileExporter;
