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

const path = require('path');

const async = require('async');

const ApiService = require('./../../ApiService');
const ConfigManagementHelper = require('./../../ConfigManagementHelper');
const { ConfigFilesDir, randomStrings } = require('./../../TestsHelper');

const { readJSON } = require('./../../../lib/Utils');

module.exports = () => {
  const wantedOrg = 'CliOrg';

  const removeAppsAndServices = (done) => {
    let orgId;

    async.waterfall([
      (next) => {
        ApiService.orgs.get(null, (err, orgs) => {
          if (err) {
            return next(err);
          }

          const testOrg = orgs.find(x => x.name === wantedOrg);
          if (!testOrg) {
            return next(new Error(`${wantedOrg} not found.`));
          }

          orgId = testOrg.id;

          next(null, testOrg.id);
        });
      },
      (id, next) => {
        ApiService.apps.getByOrg(id, next);
      },
      (allApps, next) => {
        async.each(
          allApps,
          (currApp, cb) => {
            ApiService.apps.remove(currApp.id, (err) => {
              if (err) {
                return cb(err);
              }

              cb();
            });
          },
          next
        );
      },
      (next) => {
        ApiService.services.getAllByOrg(orgId, next);
      },
      (services, next) => {
        async.each(
          services,
          (currService, cb) => {
            ApiService.services.remove(currService.id, cb);
          },
          next
        );
      }
    ], done);
  };

  after('remove apps and services', removeAppsAndServices);

  describe('an empty org', () => {
    before('remove apps and services', removeAppsAndServices);

    it('should succeed', (done) => {
      ConfigManagementHelper.org.exportOrg(wantedOrg, (err, exportedOrg) => {
        if (err) {
          return done(err);
        }

        ConfigManagementHelper.org.assertSettings(exportedOrg);

        expect(exportedOrg.applications).to.be.an('object').and.to.be.empty;
        expect(exportedOrg.services).to.be.an('object').and.to.be.empty;

        done();
      });
    });
  });

  describe('non-empty org', () => {
    const filePrefix = 'file::';
    const appName = randomStrings.appName();
    const serviceName = randomStrings.plainString();
    const serviceConfig = {
      configType: 'service',
      schemaVersion: '1.0.0',
      type: 'flex-internal',
      description: 'Test service',
      environments: {
        dev: {
          secret: '123',
          runtime: 'node10'
        }
      }
    };

    before('remove apps and services', removeAppsAndServices);

    before('create apps and services', (done) => {
      async.series([
        (next) => {
          ConfigManagementHelper.app.createInTestsOrg({ name: appName }, next);
        },
        (next) => {
          ConfigManagementHelper.service.createFromConfig(serviceName, serviceConfig, 'org', wantedOrg, null, next);
        }
      ], done);
    });

    it('with apps and services should succeed', (done) => {
      let exportedOrg;

      async.series([
        (next) => {
          ConfigManagementHelper.org.exportOrg(wantedOrg, (err, result) => {
            if (err) {
              return next(err);
            }

            exportedOrg = result;
            ConfigManagementHelper.org.assertSettings(exportedOrg);

            expect(exportedOrg.applications).to.be.an('object').and.to.not.be.empty;
            expect(exportedOrg.services).to.be.an('object').and.to.not.be.empty;

            next();
          });
        },
        (next) => {
          const fileFromConfig = exportedOrg.applications[appName].substring(filePrefix.length);
          const filePath = path.join(ConfigFilesDir, fileFromConfig);
          readJSON(filePath, (err, actual) => {
            if (err) {
              return next(err);
            }

            expect(actual.schemaVersion).to.exist;
            expect(actual.configType).to.equal('application');

            expect(actual.environments).to.be.an('object').and.not.empty;
            expect(actual.environments.Development).to.be.a('string').and.not.empty;

            next();
          });
        },
        (next) => {
          const fileFromConfig = exportedOrg.services[serviceName].substring(filePrefix.length);
          const filePath = path.join(ConfigFilesDir, fileFromConfig);
          readJSON(filePath, (err, actual) => {
            if (err) {
              return next(err);
            }

            expect(actual).to.deep.equal(serviceConfig);

            next();
          });
        }
      ], done);
    });
  });
};
