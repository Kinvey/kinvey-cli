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

const ConfigFileProcessor = require('./../../../lib/ConfigFileProcessor');
const ConfigManagementHelper = require('./../../ConfigManagementHelper');
const { ConfigFilesDir, execCmdWoMocks, randomStrings } = require('./../../TestsHelper');

const orgToUse = 'CliOrg';

function exportAppWithResolvedFileRefs(appIdentifier, done) {
  ConfigManagementHelper.app.exportApp(appIdentifier, (err, result) => {
    if (err) {
      return done(err);
    }

    ConfigFileProcessor._processConfigFileValue(result, ConfigFilesDir, '', done);
  });
}

module.exports = () => {
  let appName;

  describe('basic app', () => {
    afterEach('remove app', (done) => {
      execCmdWoMocks(`app delete --app ${appName} --no-prompt`, null, (err) => {
        appName = null;
        done(err);
      });
    });

    const testForBasicAppWithDefaultEnv = (orgIdentifier, done) => {
      let exportedApp;
      let appId;
      appName = randomStrings.appName();

      const config = {
        schemaVersion: '1.0.0',
        configType: 'application',
        settings: {
          realtime: {
            enabled: false
          },
          sessionTimeoutInSeconds: 200
        }
      };

      async.series([
        (next) => {
          ConfigManagementHelper.app.createFromConfig(appName, config, orgIdentifier, (err, id) => {
            if (err) {
              return next(err);
            }

            appId = id;
            next();
          });
        },
        (next) => {
          exportAppWithResolvedFileRefs(appName, (err, data) => {
            if (err) {
              return next(err);
            }

            exportedApp = data;
            next();
          });
        },
        (next) => {
          const expectedConfig = Object.assign({}, config);
          expectedConfig.environments = {
            Development: {
              configType: 'environment',
              schemaVersion: '1.0.0',
              settings: {
                apiVersion: 3
              },
              collections: {
                _blob: {
                  type: 'internal',
                  permissions: 'shared'
                },
                user: {
                  type: 'internal',
                  permissions: 'shared'
                }
              }
            }
          };
          expectedConfig.services = {};

          expect(exportedApp).to.deep.equal(expectedConfig);
          next();
        }
      ], done);
    };

    it('inside an org with default env should succeed', (done) => {
      testForBasicAppWithDefaultEnv('CliOrg', done);
    });
  });

  describe('complex app', () => {
    const orgServicesToRemove = [];

    after('remove services', (done) => {
      async.each(
        orgServicesToRemove,
        (currSvcId, next) => {
          ConfigManagementHelper.testHooks.removeService(currSvcId, next);
        },
        done
      );
    });

    it('inside an org with org services and external collections should succeed', (done) => {
      let exportedApp;
      let appId;
      let appConfig;

      async.series([
        (next) => {
          // create an app with external collections and a service
          const appServiceName = `app${randomStrings.plainString(6)}`;
          const appSvcEnvName = `appEnv${randomStrings.plainString(4)}`;
          const appServiceConfig = {
            configType: 'service',
            schemaVersion: '1.0.0',
            type: 'flex-internal',
            description: 'Test service',
            environments: {
              [appSvcEnvName]: {
                secret: '45678'
              },
              devEnv: {
                secret: 'secret0'
              }
            }
          };
          const collList = [ConfigManagementHelper.env.buildExternalCollection(appServiceName, appSvcEnvName, 'MyCollection', randomStrings.collName())];
          const prodColls = ConfigManagementHelper.common.buildConfigEntityFromList(collList);
          const prodEnv = {
            schemaVersion: '1.0.0',
            settings: ConfigManagementHelper.env.buildSettings(),
            collections: prodColls
          };

          appConfig = {
            schemaVersion: '1.0.0',
            configType: 'application',
            settings: { sessionTimeoutInSeconds: 60 },
            environments: {
              dev: {
                schemaVersion: '1.0.0',
                settings: ConfigManagementHelper.env.buildSettings()
              },
              prod: prodEnv
            },
            services: {
              [appServiceName]: appServiceConfig
            }
          };

          appName = randomStrings.appName();
          ConfigManagementHelper.app.createFromConfig(appName, appConfig, orgToUse, (err, id) => {
            if (err) {
              return next(err);
            }

            appId = id;
            next();
          });
        },
        (next) => {
          exportAppWithResolvedFileRefs(appName, (err, data) => {
            if (err) {
              return next(err);
            }

            exportedApp = data;
            next();
          });
        },
        (next) => {
          const expectedConfig = Object.assign({}, appConfig);
          // due to API changes services will be created on org level
          expectedConfig.services = {};
          ConfigManagementHelper.app.addSystemCollsToEnvs(expectedConfig);

          expect(exportedApp).to.deep.equal(expectedConfig);
          next();
        }
      ], done);
    });
  });
};
