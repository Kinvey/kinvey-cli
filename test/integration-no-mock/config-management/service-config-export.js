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
const path = require('path');

const cloneDeep = require('lodash.clonedeep');

const ApiService = require('./../../ApiService');
const ConfigManagementHelper = require('./../../ConfigManagementHelper');

const { randomStrings } = require('./../../TestsHelper');
const { getObjectByOmitting } = require('./../../../lib/Utils');

module.exports = () => {
  let serviceId;

  describe('external flex service', () => {
    const externalFlexSrvConfig = {
      configType: 'service',
      schemaVersion: '1.0.0',
      type: 'flex-external',
      description: 'Test service',
      environments: {
        dev: {
          secret: '123',
          host: 'https://swapi.co/api'
        }
      }
    };
    const serviceName = randomStrings.plainString();

    before('create external flex service', (done) => {
      ConfigManagementHelper.service.createFromConfig(serviceName, externalFlexSrvConfig, 'org', 'CliOrg', null, (err, id) => {
        if (err) {
          return done(err);
        }

        serviceId = id;
        done();
      });
    });

    after('remove service', (done) => {
      ApiService.services.remove(serviceId, (err) => {
        serviceId = null;
        done(err);
      });
    });

    it('should succeed', (done) => {
      ConfigManagementHelper.service.exportConfig(serviceId, (err, exported) => {
        if (err) {
          return done(err);
        }

        const expected = getObjectByOmitting(externalFlexSrvConfig, ['host']);
        expected.name = serviceName;
        expect(exported).to.deep.equal(expected);
        done();
      });
    });
  });

  describe('internal flex service', () => {
    const projectPath = path.join(process.cwd(), 'test/integration-no-mock/flex-project');
    const internalFlexSrvConfig = {
      configType: 'service',
      schemaVersion: '1.0.0',
      type: 'flex-internal',
      description: 'Test service',
      environments: {
        dev: {
          secret: '123',
          sourcePath: projectPath
        }
      }
    };
    const serviceName = randomStrings.plainString();

    before('create internal flex service', (done) => {
      const pkgJson = {
        version: '1.0.0',
        dependencies: {
          'kinvey-flex-sdk': '3.0.0'
        }
      };

      ConfigManagementHelper.service.createFromConfig(serviceName, internalFlexSrvConfig, 'org', 'CliOrg', pkgJson, (err, id) => {
        if (err) {
          return done(err);
        }

        serviceId = id;
        done();
      });
    });

    after('remove service', (done) => {
      ApiService.services.remove(serviceId, (err) => {
        serviceId = null;
        done(err);
      });
    });

    after('remove package.json', (done) => {
      fs.unlink(path.join(projectPath, 'package.json'), (err) => {
        if (err && err.code && err.code.includes('ENOENT')) {
          return done();
        }

        done(err);
      });
    });

    it('should succeed', (done) => {
      ConfigManagementHelper.service.exportConfig(serviceId, (err, exported) => {
        if (err) {
          return done(err);
        }

        const expected = cloneDeep(internalFlexSrvConfig);
        delete expected.environments[Object.keys(expected.environments)[0]].sourcePath;
        expected.name = serviceName;
        expect(exported).to.deep.equal(expected);
        done();
      });
    });
  });

  describe('rapid data services', () => {
    const serviceName = randomStrings.plainString();
    const serviceConfig = {
      configType: 'service',
      schemaVersion: '1.0.0',
      type: 'rest',
      environments: {
        default: {
          connectionOptions: {
            strictSSL: true
          },
          authentication: {
            type: 'oauthClientCredentials',
            credentials: {
              username: 'testUser',
              password: '123',
              tokenEndpoint: 'https://swapi.co/TOKEN'
            },
            loginOptions: {
              type: 'maintainSession',
              httpMethod: 'POST',
              headers: {
                'x-custom-header': '1'
              }
            }
          },
          host: 'https://api.co/api',
          mapping: {
            planets: {
              sourceObject: {
                endpoint: 'planets',
                contextRoot: 'someRoot',
                httpMethod: 'PUT',
                queryMapping: {
                  query: 'dynamicEndpointToken'
                }
              }
            },
            vehicles: {
              sourceObject: {
                endpoint: 'vehicles',
                contextRoot: 'someRoot'
              }
            }
          }
        }
      }
    };

    before('create rapid data service - rest', (done) => {
      ConfigManagementHelper.service.createFromConfig(serviceName, serviceConfig, 'org', 'CliOrg', null, (err, id) => {
        if (err) {
          return done(err);
        }

        serviceId = id;
        done();
      });
    });

    after('remove service', (done) => {
      ApiService.services.remove(serviceId, (err) => {
        serviceId = null;
        done(err);
      });
    });

    it('should succeed', (done) => {
      ConfigManagementHelper.service.exportConfig(serviceId, (err, exported) => {
        if (err) {
          return done(err);
        }

        expect(exported.name).to.equal(serviceName);
        const actual = getObjectByOmitting(exported, ['name']);
        expect(actual).to.deep.equal(serviceConfig);
        done();
      });
    });
  });
};
