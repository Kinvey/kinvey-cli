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
const cloneDeep = require('lodash.clonedeep');

const ConfigManagementHelper = require('./../../ConfigManagementHelper');

const EnvHelper = ConfigManagementHelper.env;

module.exports = () => {
  // tests should be OK when user is Org admin
  const orgNameToUse = 'CliOrgPushTest';

  const removeAppsAndServices = (done) => {
    ConfigManagementHelper.org.removeAppsAndServices(orgNameToUse, done);
  };

  before('remove apps and services', removeAppsAndServices);

  after('remove apps and services', removeAppsAndServices);

  const orgConfigOneAppFewServices = {
    schemaVersion: '1.0.0',
    configType: 'organization',
    settings: {
      security: {
        requireApprovals: false,
        requireEmailVerification: false,
        requireTwoFactorAuth: false
      }
    },
    applications: {
      app0: {
        configType: 'application',
        schemaVersion: '1.0.0',
        environments: {
          prod: {
            schemaVersion: '1.0.0',
            settings: EnvHelper.buildSettings()
          }
        },
        services: {},
        settings: {}
      }
    },
    services: {
      svc0: {
        configType: 'service',
        schemaVersion: '1.0.0',
        type: 'flex-internal',
        description: 'Test service 0',
        environments: {}
      },
      svc1: {
        configType: 'service',
        schemaVersion: '1.0.0',
        type: 'flex-internal',
        description: 'Test service 1',
        environments: {}
      }
    }
  };

  describe('when org is empty', () => {
    it('should create apps and services', (done) => {
      const orgConfig = cloneDeep(orgConfigOneAppFewServices);
      let exportedOrg;

      async.series([
        (next) => {
          ConfigManagementHelper.org.modifyFromConfig(orgNameToUse, orgConfig, next);
        },
        (next) => {
          ConfigManagementHelper.org.exportOrg(orgNameToUse, (err, actual) => {
            if (err) {
              return next(err);
            }

            exportedOrg = actual;
            next();
          });
        },
        (next) => {
          ConfigManagementHelper.common.resolveFileRefs(exportedOrg, (err, result) => {
            if (err) {
              return next(err);
            }

            ConfigManagementHelper.org.addSystemCollsToAppEnvs(orgConfig);
            expect(result).to.deep.equal(orgConfig);
            next();
          });
        }
      ], done);
    });
  });

  describe('when org is not empty', () => {
    before('remove apps and services', removeAppsAndServices);

    it('should modify successfully', (done) => {
      const initialOrgConfig = cloneDeep(orgConfigOneAppFewServices);
      let modifiedOrgConfig;
      let exportedOrg;

      async.series([
        (next) => {
          ConfigManagementHelper.org.modifyFromConfig(orgNameToUse, initialOrgConfig, next);
        },
        (next) => {
          modifiedOrgConfig = cloneDeep(initialOrgConfig);
          modifiedOrgConfig.services.oneMoreSvc = {
            configType: 'service',
            schemaVersion: '1.0.0',
            type: 'flex-internal',
            environments: {}
          };
          modifiedOrgConfig.applications.app0.settings = {
            realtime: {
              enabled: true
            }
          };
          ConfigManagementHelper.org.modifyFromConfig(orgNameToUse, modifiedOrgConfig, next);
        },
        (next) => {
          ConfigManagementHelper.org.exportOrg(orgNameToUse, (err, actual) => {
            if (err) {
              return next(err);
            }

            exportedOrg = actual;
            next();
          });
        },
        (next) => {
          ConfigManagementHelper.common.resolveFileRefs(exportedOrg, (err, result) => {
            if (err) {
              return next(err);
            }

            ConfigManagementHelper.org.addSystemCollsToAppEnvs(modifiedOrgConfig);
            expect(result).to.deep.equal(modifiedOrgConfig);
            next();
          });
        }
      ], done);
    });
  });
};
