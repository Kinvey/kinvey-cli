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
const moment = require('moment');
const path = require('path');

const ApiService = require('./../../ApiService');
const ConfigManagementHelper = require('./../../ConfigManagementHelper');

const { randomStrings } = require('./../../TestsHelper');
const { writeJSON } = require('../../../lib/Utils');

module.exports = () => {
  const projectPath = path.join(process.cwd(), 'test/integration-no-mock/flex-project');
  let serviceId;

  afterEach('remove service', (done) => {
    ApiService.services.remove(serviceId, (err) => {
      serviceId = null;
      done(err);
    });
  });

  afterEach('remove package.json', (done) => {
    fs.unlink(path.join(projectPath, 'package.json'), (err) => {
      if (err && err.code && err.code.includes('ENOENT')) {
        return done();
      }

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
          ConfigManagementHelper.service.createFromConfig(serviceName, serviceConfig, 'org', 'CliOrg', null, (err, id) => {
            if (err) {
              return next(err);
            }

            serviceId = id;
            next();
          });
        },
        (next) => {
          ConfigManagementHelper.service.assertFlexService(serviceId, serviceConfig, serviceName, next);
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
          ConfigManagementHelper.service.createFromConfig(serviceName, serviceConfig, 'org', 'CliOrg', null, (err, id) => {
            if (err) {
              return next(err);
            }

            serviceId = id;
            next();
          });
        },
        (next) => {
          ConfigManagementHelper.service.assertFlexService(serviceId, serviceConfig, serviceName, next);
        }
      ], done);
    });

    it('internal with project to deploy should succeed', function (done) {
      this.timeout(85000);

      const serviceConfig = {
        configType: 'service',
        schemaVersion: '1.0.0',
        type: 'flex-internal',
        secret: '123',
        description: 'Test service',
        sourcePath: projectPath
      };

      const serviceName = randomStrings.plainString();
      const pkgJson = {
        version: '1.0.0',
        dependencies: {
          'kinvey-flex-sdk': '3.0.0'
        }
      };

      async.series([
        (next) => {
          ConfigManagementHelper.service.createFromConfig(serviceName, serviceConfig, 'org', 'CliOrg', pkgJson, (err, id) => {
            if (err) {
              return next(err);
            }

            serviceId = id;
            next();
          });
        },
        (next) => {
          ConfigManagementHelper.service.assertFlexService(serviceId, serviceConfig, serviceName, next);
        },
        (next) => {
          ConfigManagementHelper.service.assertFlexServiceStatusRetryable(serviceId, pkgJson.version, 'ONLINE', next);
        }
      ], done);
    });
  });
};
