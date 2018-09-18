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
const cloneDeep = require('lodash.clonedeep');
const path = require('path');

const ApiService = require('./../../ApiService');
const ConfigManagementHelper = require('./../../ConfigManagementHelper');

const { randomStrings } = require('./../../TestsHelper');

module.exports = () => {
  let serviceId;

  afterEach('remove service', (done) => {
    ConfigManagementHelper.testHooks.removeService(serviceId, (err) => {
      serviceId = null;
      done(err);
    });
  });

  describe('flex', () => {
    const projectPath = path.join(process.cwd(), 'test/integration-no-mock/flex-project');

    afterEach('remove package.json', (done) => {
      fs.unlink(path.join(projectPath, 'package.json'), (err) => {
        if (err && err.code && err.code.includes('ENOENT')) {
          return done();
        }

        done(err);
      });
    });

    it('modifying host and secret on external flex service should succeed', (done) => {
      const initialServiceConfig = {
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

      const modifiedServiceConfig = cloneDeep(initialServiceConfig);
      modifiedServiceConfig.environments.dev.secret = '456';
      modifiedServiceConfig.environments.dev.host = 'https://apis.is/cyclecounter';

      const serviceName = randomStrings.plainString();

      async.series([
        (next) => {
          ConfigManagementHelper.service.createFromConfig(serviceName, initialServiceConfig, 'org', 'CliOrg', null, (err, id) => {
            if (err) {
              return next(err);
            }

            serviceId = id;
            next();
          });
        },
        (next) => {
          ConfigManagementHelper.service.modifyFromConfig(serviceId, modifiedServiceConfig, null, next);
        },
        (next) => {
          ConfigManagementHelper.service.assertService(serviceId, modifiedServiceConfig, serviceName, next);
        }
      ], done);
    });

    it('modifying only description on internal flex service with sourcePath should succeed', (done) => {
      const initialServiceConfig = {
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

      const modifiedServiceConfig = cloneDeep(initialServiceConfig);
      modifiedServiceConfig.description = 'Updated service without re-deploying';

      const serviceName = randomStrings.plainString();
      const pkgJson = {
        version: '1.0.0',
        dependencies: {
          'kinvey-flex-sdk': '3.0.0'
        }
      };

      async.series([
        (next) => {
          ConfigManagementHelper.service.createFromConfig(serviceName, initialServiceConfig, 'org', 'CliOrg', pkgJson, (err, id) => {
            if (err) {
              return next(err);
            }

            serviceId = id;
            next();
          });
        },
        (next) => {
          ConfigManagementHelper.service.modifyFromConfig(serviceId, modifiedServiceConfig, null, next);
        },
        (next) => {
          ConfigManagementHelper.service.assertService(serviceId, modifiedServiceConfig, serviceName, next);
        }
      ], done);
    });

    it('modifying secret and bumping local version on internal flex service should succeed', function (done) {
      this.timeout(250000);

      const initialServiceConfig = {
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

      const modifiedServiceConfig = cloneDeep(initialServiceConfig);
      modifiedServiceConfig.environments.dev.secret = '456';

      const serviceName = randomStrings.plainString();
      const initialPkgJson = {
        version: '1.0.0',
        dependencies: {
          'kinvey-flex-sdk': '3.0.0'
        }
      };
      const modifiedPkgJson = cloneDeep(initialPkgJson);
      modifiedPkgJson.version = '1.0.1';

      async.series([
        (next) => {
          ConfigManagementHelper.service.createFromConfig(serviceName, initialServiceConfig, 'org', 'CliOrg', initialPkgJson, (err, id) => {
            if (err) {
              return next(err);
            }

            serviceId = id;
            next();
          });
        },
        (next) => {
          // ensure initial flex project is deployed, otherwise the second deploy can fail
          ConfigManagementHelper.service.assertFlexServiceStatusRetryable(serviceId, null, initialPkgJson.version, 'ONLINE', next);
        },
        (next) => {
          ConfigManagementHelper.service.modifyFromConfig(serviceId, modifiedServiceConfig, modifiedPkgJson, next);
        },
        (next) => {
          ConfigManagementHelper.service.assertService(serviceId, modifiedServiceConfig, serviceName, next);
        },
        (next) => {
          ConfigManagementHelper.service.assertFlexServiceStatusRetryable(serviceId, null, modifiedPkgJson.version, null, next);
        }
      ], done);
    });
  });

  describe('rapid data', () => {
    it('adding mapping to a mssql service should succeed', (done) => {
      const serviceName = randomStrings.plainString();
      const initialServiceConfig = {
        configType: 'service',
        schemaVersion: '1.0.0',
        type: 'mssql',
        environments: {
          dev: {
            version: '2008-r2',
            connectionOptions: {
              database: 'testdb',
              encrypt: true
            },
            authentication: {
              type: 'ServiceAccount',
              credentials: {
                username: 'testUser',
                password: 'pass0'
              }
            },
            host: 'mssql://sql-2008.z82ddddd214f.us-east-1.rds.amazonaws.com'
          }
        }
      };
      const modifiedServiceConfig = cloneDeep(initialServiceConfig);
      modifiedServiceConfig.environments.dev.mapping = {
        EmployeesServiceObject: {
          sourceObject: {
            schemaName: 'dbo',
            objectName: 'Employees',
            objectType: 'BASE TABLE',
            primaryKey: {
              name: 'id'
            }
          },
          fields: [
            {
              kinveyFieldMapping: '_id',
              sourceFieldMapping: 'id'
            }
          ],
          methods: {
            getById: {
              isEnabled: false
            }
          }
        }
      };

      async.series([
        (next) => {
          ConfigManagementHelper.service.createFromConfig(serviceName, initialServiceConfig, 'org', 'CliOrg', null, (err, id) => {
            if (err) {
              return next(err);
            }

            serviceId = id;
            next();
          });
        },
        (next) => {
          ConfigManagementHelper.service.modifyFromConfig(serviceId, modifiedServiceConfig, null, next);
        },
        (next) => {
          ConfigManagementHelper.service.assertService(serviceId, modifiedServiceConfig, serviceName, next);
        }
      ], done);
    });

    it('modifying rest service should succeed', (done) => {
      const serviceName = randomStrings.plainString();
      const initialServiceConfig = {
        configType: 'service',
        schemaVersion: '1.0.0',
        type: 'rest',
        environments: {
          dev: {
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
            host: 'https://api.co/api'
          }
        }
      };
      const modifiedServiceConfig = cloneDeep(initialServiceConfig);
      modifiedServiceConfig.environments.dev.authentication = {
        type: 'None',
        loginOptions: {
          type: 'noLogin'
        }
      };

      modifiedServiceConfig.environments.dev.host = 'https://swapi.co/api';
      modifiedServiceConfig.environments.dev.mapping = {
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
      };

      async.series([
        (next) => {
          ConfigManagementHelper.service.createFromConfig(serviceName, initialServiceConfig, 'org', 'CliOrg', null, (err, id) => {
            if (err) {
              return next(err);
            }

            serviceId = id;
            next();
          });
        },
        (next) => {
          ConfigManagementHelper.service.modifyFromConfig(serviceId, modifiedServiceConfig, null, next);
        },
        (next) => {
          ConfigManagementHelper.service.assertService(serviceId, modifiedServiceConfig, serviceName, next);
        }
      ], done);
    });
  });
};
