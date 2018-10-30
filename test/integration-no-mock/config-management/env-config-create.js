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
const { execCmdWoMocks, randomStrings } = require('./../../TestsHelper');

module.exports = () => {
  const appName = randomStrings.appName();
  const serviceIds = [];

  before('setup app', (done) => {
    AppHelper.createInTestsOrg({ name: appName }, done);
  });

  after('remove app and services', (done) => {
    async.series([
      (next) => {
        execCmdWoMocks(`app delete ${appName} --no-prompt`, null, next);
      },
      (next) => {
        async.each(
          serviceIds,
          (serviceId, next) => {
            ApiService.services.remove(serviceId, next);
          },
          next
        );
      }
    ], done);
  });

  it('settings only should succeed', (done) => {
    const envSettings = EnvHelper.buildSettings();
    const env = {
      schemaVersion: '1.0.0',
      configType: 'environment',
      settings: envSettings
    };

    const envName = randomStrings.envName();
    let envId;

    async.series([
      (next) => {
        EnvHelper.createFromConfig(envName, env, appName, (err, id) => {
          if (err) {
            return next(err);
          }

          envId = id;
          next();
        });
      },
      (next) => {
        EnvHelper.assertEnvOnly(env, envId, envName, next);
      }
    ], done);
  });

  it('settings and internal collections wo system collections should succeed', (done) => {
    const collList = EnvHelper.buildValidInternalCollectionsList(3, false);
    const envSettings = EnvHelper.buildSettings();
    const env = {
      schemaVersion: '1.0.0',
      configType: 'environment',
      settings: envSettings,
      collections: ConfigManagementHelper.common.buildConfigEntityFromList(collList)
    };

    const envName = randomStrings.envName();
    let envId;

    async.series([
      (next) => {
        EnvHelper.createFromConfig(envName, env, appName, (err, id) => {
          if (err) {
            return next(err);
          }

          envId = id;
          next();
        });
      },
      (next) => {
        EnvHelper.assertEnvOnly(env, envId, envName, next);
      },
      (next) => {
        EnvHelper.assertCollections(envId, collList, collList.length + 2, null, next);
      }
    ], done);
  });

  it('internal collections only plus system collections should succeed', (done) => {
    const collList = EnvHelper.buildValidInternalCollectionsList(2, true);
    const env = {
      schemaVersion: '1.0.0',
      configType: 'environment',
      collections: ConfigManagementHelper.common.buildConfigEntityFromList(collList)
    };

    const envName = randomStrings.envName();
    let envId;

    async.series([
      (next) => {
        EnvHelper.createFromConfig(envName, env, appName, (err, id) => {
          if (err) {
            return next(err);
          }

          envId = id;
          next();
        });
      },
      (next) => {
        EnvHelper.assertEnvOnly(env, envId, envName, next);
      },
      (next) => {
        EnvHelper.assertCollections(envId, collList, collList.length, null, next);
      }
    ], done);
  });

  it('internal collections plus system collections, internal hooks and roles should succeed', (done) => {
    const collList = EnvHelper.buildValidInternalCollectionsList(2, true);
    const rolesList = ConfigManagementHelper.roles.buildValidRolesList(2);

    // set complex permissions for a collection
    const roleName = rolesList[0].name;
    const collWithComplexPermissions = collList[0];
    collWithComplexPermissions.permissions = {
      'all-users': {
        create: 'always',
        read: 'grant',
        update: 'always',
        delete: 'grant'
      },
      [roleName]: {
        create: 'grant',
        update: 'entity'
      }
    };

    const collHooks = {
      [collList[0].name]: {
        onPreSave: {
          type: 'internal'
        }
      },
      [collList[1].name]: {
        onPostFetch: {
          type: 'internal',
          code: 'function onPostFetch(request, response, modules) {\nconsole.log("Here");\n  response.continue();\n}'
        }
      }
    };

    const env = {
      schemaVersion: '1.0.0',
      configType: 'environment',
      collections: ConfigManagementHelper.common.buildConfigEntityFromList(collList),
      collectionHooks: collHooks,
      roles: ConfigManagementHelper.common.buildConfigEntityFromList(rolesList)
    };

    const envName = randomStrings.envName();
    const rolesNameIdPairs = {};
    let envId;
    let actualRoles;

    async.series([
      (next) => {
        EnvHelper.createFromConfig(envName, env, appName, (err, id) => {
          if (err) {
            return next(err);
          }

          envId = id;
          next();
        });
      },
      (next) => {
        EnvHelper.assertEnvOnly(env, envId, envName, next);
      },
      (next) => {
        ApiService.roles.get(envId, null, (err, data) => {
          if (err) {
            return next(err);
          }

          actualRoles = data;

          const expectedRolesCount = rolesList.length;
          expect(actualRoles.length).to.equal(expectedRolesCount);

          for (let i = 0; i < expectedRolesCount; i += 1) {
            const expected = rolesList[i];
            const actual = actualRoles.find(x => x.name === expected.name);
            if (!actual) {
              return next(new Error(`Failed to find role with name '${expected.name}'.`));
            }

            rolesNameIdPairs[actual.name] = actual._id;
            expect(actual.description).to.equal(expected.description);
          }

          next();
        });
      },
      (next) => {
        EnvHelper.assertCollections(envId, collList, collList.length, rolesNameIdPairs, next);
      },
      (next) => {
        EnvHelper.assertAllCollHooks(envId, collHooks, next);
      }
    ], done);
  });

  it('common code, internal endpoints, groups and push settings should succeed', (done) => {
    const commonCode = {
      someCommonModule: {
        code: 'const commonLogic = {};\ncommonLogic.print = function print(msg) {\n  console.log(msg);\n};'
      }
    };

    const endpoints = {
      myEndpoint: {
        type: 'internal',
        code: 'function onRequest(request, response, modules) {\nconsole.log("On request...");\n  response.continue();\n}',
        schedule: {
          start: moment().add(1, 'month').toISOString(),
          interval: '5-minutes'
        }
      },
      anotherEndpoint: {
        type: 'internal',
        code: 'function onRequest(request, response, modules) {\nconsole.log("On request...");\n  response.continue();\n}'
      }
    };

    const groups = {
      oneGroup: {
        description: 'One group',
        groups: ['anotherGroup']
      },
      anotherGroup: {}
    };

    const pushSettings = {
      android: {
        senderId: 'id123',
        apiKey: 'key123'
      }
    };

    const env = {
      schemaVersion: '1.0.0',
      configType: 'environment',
      commonCode,
      groups,
      customEndpoints: endpoints,
      push: pushSettings
    };

    const envName = randomStrings.envName();
    let envId;

    async.series([
      (next) => {
        EnvHelper.createFromConfig(envName, env, appName, (err, id) => {
          if (err) {
            return next(err);
          }

          envId = id;
          next();
        });
      },
      (next) => {
        EnvHelper.assertEnvOnly(env, envId, envName, next);
      },
      (next) => {
        EnvHelper.assertAllCommonCodeModules(envId, commonCode, next);
      },
      (next) => {
        EnvHelper.assertEndpoints(envId, endpoints, next);
      },
      (next) => {
        EnvHelper.assertGroups(envId, groups, next);
      },
      (next) => {
        EnvHelper.assertPushSettings(envId, pushSettings, next);
      }
    ], done);
  });

  it('external collections, external hooks, external endpoints should succeed', (done) => {
    const serviceName = randomStrings.plainString();
    const svcEnvName = 'dev';
    const collList = [
      ConfigManagementHelper.env.buildExternalCollection(serviceName, svcEnvName, 'MyCollection', randomStrings.collName()),
      ConfigManagementHelper.env.buildExternalCollection(serviceName, svcEnvName, 'MyCollection', randomStrings.collName())
    ];

    const collHooks = {
      [collList[0].name]: {
        onPreSave: {
          type: 'external',
          service: serviceName,
          serviceEnvironment: svcEnvName,
          handlerName: 'someHandler'
        }
      }
    };

    const endpoints = {
      myEndpoint: {
        type: 'external',
        service: serviceName,
        serviceEnvironment: svcEnvName,
        handlerName: 'someHandler',
        schedule: {
          start: moment().add(1, 'month').toISOString(),
          interval: '5-minutes'
        }
      }
    };

    const env = {
      schemaVersion: '1.0.0',
      configType: 'environment',
      collections: ConfigManagementHelper.common.buildConfigEntityFromList(collList),
      collectionHooks: collHooks,
      customEndpoints: endpoints
    };

    const envName = randomStrings.envName();
    let envId;

    async.series([
      (next) => {
        const serviceConfig = {
          configType: 'service',
          schemaVersion: '1.0.0',
          type: 'flex-internal',
          description: 'Test service',
          environments: {
            [svcEnvName]: {
              secret: '123',
              sourcePath: path.join(process.cwd(), 'test/integration-no-mock/flex-project')
            }
          }
        };

        const pkgJson = {
          version: '1.0.0',
          dependencies: {
            'kinvey-flex-sdk': '3.0.0'
          }
        };
        ConfigManagementHelper.service.createFromConfig(serviceName, serviceConfig, 'org', 'CliOrg', pkgJson, (err, id) => {
          if (err) {
            return next(err);
          }

          serviceIds.push(id);
          next();
        });
      },
      (next) => {
        EnvHelper.createFromConfig(envName, env, appName, (err, id) => {
          if (err) {
            return next(err);
          }

          envId = id;
          next();
        });
      },
      (next) => {
        EnvHelper.assertEnvOnly(env, envId, envName, next);
      },
      (next) => {
        EnvHelper.assertCollections(envId, collList, 4, null, next);
      },
      (next) => {
        EnvHelper.assertAllCollHooks(envId, collHooks, next);
      },
      (next) => {
        EnvHelper.assertEndpoints(envId, endpoints, next);
      }
    ], done);
  });
};
