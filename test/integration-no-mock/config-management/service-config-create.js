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
const moment = require('moment');
const path = require('path');

const ApiService = require('./../../ApiService');
const ConfigManagementHelper = require('./../../ConfigManagementHelper');

const EnvHelper = ConfigManagementHelper.env;
const AppHelper = ConfigManagementHelper.app;
const { BackendCollectionPermission, CollectionHook } = require('./../../../lib/Constants');
const { ConfigFilesDir, execCmdWoMocks, randomStrings } = require('./../../TestsHelper');
const { isEmpty, writeJSON } = require('../../../lib/Utils');

function createServiceFromConfig(serviceName, serviceConfig, serviceDomain, appOrOrgIdentifier, done) {
  let filePath;

  async.series([
    (next) => {
      const fileName = `${randomStrings.plainString(10)}.json`;
      filePath = path.join(ConfigFilesDir, fileName);
      writeJSON(filePath, serviceConfig, next);
    },
    (next) => {
      execCmdWoMocks(`service create ${serviceName} ${filePath} --${serviceDomain} ${appOrOrgIdentifier} --output json`, null, (err, data) => {
        if (err) {
          return next(err);
        }

        const parsedData = JSON.parse(data);
        const serviceId = parsedData.result.id;
        next(null, serviceId);
      });
    }
  ], (err, results) => {
    if (err) {
      return done(err);
    }

    done(null, results.pop());
  });
}

function assertFlexService(id, serviceConfig, serviceName, done) {
  ApiService.services.get(id, (err, actual) => {
    if (err) {
      return done(err);
    }

    expect(serviceName).to.equal(actual.name);
    expect(serviceConfig.description).to.equal(actual.description);

    const isFlexInternal = serviceConfig.type === 'flex-internal';
    const expectedType = isFlexInternal  ? 'internal' : 'external';
    expect(expectedType).to.equal(actual.type);

    expect(actual.backingServers).to.be.an.array;
    expect(actual.backingServers[0]).to.exist;
    expect(serviceConfig.secret).to.equal(actual.backingServers[0].secret);

    if (isFlexInternal) {
      expect(actual.backingServers[0].host).to.exist;
    } else {
      expect(serviceConfig.host).to.equal(actual.backingServers[0].host);
    }

    done();
  });
}

module.exports = () => {
  let serviceId;

  afterEach('remove service', (done) => {
    ApiService.services.remove(serviceId, (err) => {
      serviceId = null;
      done(err);
    });
  });

  describe('flex', () => {
    it('external with valid options should succeed', (done) => {
      const serviceConfig = {
        configType: 'service',
        schemaVersion: '1.0.0',
        type: 'flex-external',
        secret: '123',
        description: 'Test service',
        host: 'https://swapi.co/api'
      };

      const serviceName = randomStrings.plainString();

      async.series([
        (next) => {
          createServiceFromConfig(serviceName, serviceConfig, 'org', 'CliOrg', (err, id) => {
            if (err) {
              return next(err);
            }

            serviceId = id;
            next();
          });
        },
        (next) => {
          assertFlexService(serviceId, serviceConfig, serviceName, next);
        }
      ], done);
    });

    it('internal without project to deploy should succeed', (done) => {
      const serviceConfig = {
        configType: 'service',
        schemaVersion: '1.0.0',
        type: 'flex-internal',
        secret: '123',
        description: 'Test service'
      };

      const serviceName = randomStrings.plainString();

      async.series([
        (next) => {
          createServiceFromConfig(serviceName, serviceConfig, 'org', 'CliOrg', (err, id) => {
            if (err) {
              return next(err);
            }

            serviceId = id;
            next();
          });
        },
        (next) => {
          assertFlexService(serviceId, serviceConfig, serviceName, next);
        }
      ], done);
    });

    it('internal with project to deploy should succeed', (done) => {
      const projectPath = path.join(process.cwd(), 'test/integration-no-mock/flex-project');
      const serviceConfig = {
        configType: 'service',
        schemaVersion: '1.0.0',
        type: 'flex-internal',
        secret: '123',
        description: 'Test service',
        sourcePath: projectPath
      };

      const serviceName = randomStrings.plainString();

      async.series([
        (next) => {
          const pkgJson = {
            version: '1.0.0',
            dependencies: {
              'kinvey-flex-sdk': '3.0.0'
            }
          };

          writeJSON(path.join(projectPath, 'package.json'), pkgJson, next);
        },
        (next) => {
          createServiceFromConfig(serviceName, serviceConfig, 'org', 'CliOrg', (err, id) => {
            if (err) {
              return next(err);
            }

            serviceId = id;
            next();
          });
        },
        (next) => {
          assertFlexService(serviceId, serviceConfig, serviceName, next);
          // TODO: cli-65 Verify deployed; ignore package.json or remove
        }
      ], done);
    });
  });
};