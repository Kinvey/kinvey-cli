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

function createEnvFromConfig(envName, env, appName, done) {
  let filePath;

  async.series([
    (next) => {
      const fileName = `${randomStrings.plainString(10)}.json`;
      filePath = path.join(ConfigFilesDir, fileName);
      writeJSON(filePath, env, next);
    },
    (next) => {
      execCmdWoMocks(`env create ${envName} ${filePath} --app ${appName} --output json`, null, (err, data) => {
        if (err) {
          return next(err);
        }

        const parsedData = JSON.parse(data);
        const envId = parsedData.result.id;
        next(null, envId);
      });
    }
  ], (err, results) => {
    if (err) {
      return done(err);
    }

    done(null, results.pop());
  });
}

function assertEnvOnly(envFromConfig, envId, envName, done) {
  ApiService.envs.get(envId, (err, actualEnv) => {
    if (err) {
      return done(err);
    }

    expect(actualEnv.name).to.equal(envName);

    const envSettings = envFromConfig.settings;
    if (envSettings && envSettings.emailVerification) {
      expect(actualEnv.emailVerification).to.deep.equal(envSettings.emailVerification);
    } else {
      expect(actualEnv).to.not.have.property('emailVerification');
    }

    let expectedApiVersion = 3;
    if (envSettings && envSettings.apiVersion) {
      expectedApiVersion = envSettings.apiVersion;
    }

    expect(actualEnv.apiVersion).to.equal(expectedApiVersion);

    done();
  });
}

function buildExpectedPermissionsPerColl(collList, rolesNameIdPairs) {
  const expectedPermissionsPerColl = {};

  collList.forEach((coll) => {
    let expectedPermissions;
    const collPermissionsInConfig = coll.permissions;
    if (typeof collPermissionsInConfig === 'string') {
      expectedPermissions = BackendCollectionPermission[collPermissionsInConfig];
    } else {
      expectedPermissions = {};
      const rolesNames = Object.keys(collPermissionsInConfig);
      rolesNames.forEach((roleName) => {
        const permissionsPerRole = Object.keys(collPermissionsInConfig[roleName]);
        permissionsPerRole.forEach((permission) => { // e.g. create, update
          if (!expectedPermissions[permission]) {
            expectedPermissions[permission] = [];
          }

          expectedPermissions[permission].push({
            roleId: rolesNameIdPairs[roleName] || 'all-users',
            type: collPermissionsInConfig[roleName][permission]
          });
        });
      });
    }

    expectedPermissionsPerColl[coll.name] = expectedPermissions;
  });

  return expectedPermissionsPerColl;
}

function assertCollections(envId, collList, expCollCount, rolesNameIdPairs, done) {
  ApiService.colls.get(envId, null, (err, actualColls) => {
    if (err) {
      return done(err);
    }

    expect(expCollCount).to.equal(actualColls.length);

    const expectedPermissionsPerColl = buildExpectedPermissionsPerColl(collList, rolesNameIdPairs);
    const collsFromConfigCount = collList.length;

    for (let i = 0; i < collsFromConfigCount; i += 1) {
      const expColl = collList[i];
      const actualColl = actualColls.find(x => x.name === expColl.name);
      if (!actualColl) {
        return done(new Error(`Failed to find coll with name '${expColl.name}'.`));
      }

      const expPermissions = expectedPermissionsPerColl[actualColl.name];
      expect(actualColl.permissions).to.deep.equal(expPermissions);
    }

    done();
  });
}

function assertCollHooksPerColl(envId, collName, collHooks, done) {
  const collHooksNames = Object.keys(collHooks);

  async.eachSeries(
    collHooksNames,
    (currentHook, next) => {
      const backendHookName = CollectionHook[currentHook];
      ApiService.businessLogic.collHooks.get(envId, collName, backendHookName, (err, actualHook) => {
        if (err) {
          return next(err);
        }

        const expectedHook = collHooks[currentHook];
        if (expectedHook.type === 'internal') {
          expect(actualHook.host).to.be.null;
        } else {
          expect(actualHook.host).to.not.be.null;
        }

        const defaultCode = `function ${currentHook}(request, response, modules) {\n  response.continue();\n}`;
        const expectedCode = expectedHook.code || defaultCode;
        expect(expectedCode).to.equal(actualHook.code);

        // TODO: cli-65 Add assertions for external hook

        done();
      });
    },
    done
  );
}

function assertAllCollHooks(envId, configHooks, done) {
  const collNames = Object.keys(configHooks);

  async.eachSeries(
    collNames,
    (currentCollName, next) => {
      assertCollHooksPerColl(envId, currentCollName, configHooks[currentCollName], next);
    },
    done
  );
}

function assertEndpoints(envId, configEndpoints, done) {
  const endpointNames = Object.keys(configEndpoints);

  async.eachSeries(
    endpointNames,
    (currentEndpointName, next) => {
      ApiService.businessLogic.endpoints.get(envId, currentEndpointName, (err, actual) => {
        if (err) {
          return done(err);
        }

        const expected = configEndpoints[currentEndpointName];
        if (expected.type === 'internal') {
          expect(actual.host).to.be.null;
        } else {
          expect(actual.host).to.not.be.null;
        }

        const defaultCode = 'function onRequest(request, response, modules) {\n  response.continue();\n}';
        const expectedCode = expected.code || defaultCode;
        expect(expectedCode).to.equal(actual.code);

        if (expected.schedule) { // due to api peculiarities
          if (!expected.schedule.interval) {
            expect(expected.schedule.start).to.equal(actual.schedule);
          } else {
            expect(expected.schedule.start).to.equal(actual.schedule.start);
            expect(expected.schedule.interval).to.equal(actual.schedule.interval);
          }
        } else {
          expect(actual.schedule).to.be.null;
        }

        // TODO: cli-65 Add assertions for external

        next();
      });
    },
    done
  );
}

function assertGroups(envId, configGroups, done) {
  const groupNames = Object.keys(configGroups);

  async.eachSeries(
    groupNames,
    (currentGroupName, next) => {
      ApiService.groups.get(envId, currentGroupName, (err, actual) => {
        if (err) {
          return next(err);
        }

        expect(actual).to.have.property('_acl');
        expect(actual).to.have.property('_kmd');

        const expected = configGroups[currentGroupName];
        if (isEmpty(expected)) {
          return setImmediate(next);
        }

        expect(expected.name).to.equal(actual.name);
        expect(expected.description).to.equal(actual.description);

        if (!isEmpty(expected.groups)) {
          expect(expected.groups.length).to.equal(actual.groups.length);

          for (const expGroup of expected.groups) {
            const foundGroup = actual.groups.find(x => x._id === expGroup);
            if (!foundGroup) {
              return next(new Error(`Could not find group with identifier '${expGroup}'.`));
            }
          }
        }

        next();
      });
    },
    done
  );
}

function assertPushSettings(envId, configPushSettings, done) {
  ApiService.push.get(envId, (err, actual) => {
    if (err) {
      return done(err);
    }

    if (!isEmpty(configPushSettings.android)) {
      expect(configPushSettings.android.senderId).to.equal(actual.android.projectId);
      expect(configPushSettings.android.apiKey).to.equal(actual.android.apiKey);
    } else {
      expect(actual.android).to.be.false;
    }

    if (isEmpty(configPushSettings.ios)) {
      expect(actual.ios).to.be.false;
    }

    done();
  });
}

module.exports = () => {
  const appName = randomStrings.appName();

  before('setup app', (done) => {
    AppHelper.createInTestsOrg({ name: appName }, done);
  });

  after('remove app', (done) => {
    execCmdWoMocks(`app delete ${appName} --no-prompt`, null, done);
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
        createEnvFromConfig(envName, env, appName, (err, id) => {
          if (err) {
            return next(err);
          }

          envId = id;
          next();
        });
      },
      (next) => {
        assertEnvOnly(env, envId, envName, next);
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
        createEnvFromConfig(envName, env, appName, (err, id) => {
          if (err) {
            return next(err);
          }

          envId = id;
          next();
        });
      },
      (next) => {
        assertEnvOnly(env, envId, envName, next);
      },
      (next) => {
        assertCollections(envId, collList, collList.length + 2, null, next);
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
        createEnvFromConfig(envName, env, appName, (err, id) => {
          if (err) {
            return next(err);
          }

          envId = id;
          next();
        });
      },
      (next) => {
        assertEnvOnly(env, envId, envName, next);
      },
      (next) => {
        assertCollections(envId, collList, collList.length, null, next);
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
        createEnvFromConfig(envName, env, appName, (err, id) => {
          if (err) {
            return next(err);
          }

          envId = id;
          next();
        });
      },
      (next) => {
        assertEnvOnly(env, envId, envName, next);
      },
      (next) => {
        ApiService.roles.get(envId, null, (err, data) => {
          if (err) {
            return next(err);
          }

          actualRoles = data;

          const expectedRolesCount = rolesList.length;
          expect(expectedRolesCount).to.equal(actualRoles.length);

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
        assertCollections(envId, collList, collList.length, rolesNameIdPairs, next);
      },
      (next) => {
        assertAllCollHooks(envId, collHooks, next);
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
        createEnvFromConfig(envName, env, appName, (err, id) => {
          if (err) {
            return next(err);
          }

          envId = id;
          next();
        });
      },
      (next) => {
        assertEnvOnly(env, envId, envName, next);
      },
      (next) => {
        assertEndpoints(envId, endpoints, next);
      },
      (next) => {
        assertGroups(envId, groups, next);
      },
      (next) => {
        assertPushSettings(envId, pushSettings, next);
      }
    ], done);
  });

  // TODO: cli-65 Add tests for external stuff
};
