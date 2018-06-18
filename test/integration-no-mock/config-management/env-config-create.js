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
const path = require('path');

const ApiService = require('./../../ApiService');
const ConfigManagementHelper = require('./../../ConfigManagementHelper');
const EnvHelper = ConfigManagementHelper.env;
const AppHelper = ConfigManagementHelper.app;
const { BackendCollectionPermission } = require('./../../../lib/Constants');
const { ConfigFilesDir, execCmdWoMocks, randomStrings } = require('./../../TestsHelper');
const { writeJSON } = require('../../../lib/Utils');

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

function assertCollections(envId, collList, expCollCount, rolesNameIdPairs, done) {
  ApiService.colls.get(envId, null, (err, actualColls) => {
    if (err) {
      return done(err);
    }

    expect(expCollCount).to.equal(actualColls.length);

    const expectedPermissionsPerColl = buildExpectedPermissionsPerColl(collList, rolesNameIdPairs);
    const collsFromConfigCount = collList.length;

    for (let i = 0; i < collsFromConfigCount; i++) {
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

  // TODO: cli-65 Add hooks
  it('internal collections plus system collections, hooks and roles should succeed', (done) => {
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
        'delete': 'grant'
      },
      [roleName]: {
        create: 'grant',
        update: 'entity'
      }
    };

    const env = {
      schemaVersion: '1.0.0',
      configType: 'environment',
      collections: ConfigManagementHelper.common.buildConfigEntityFromList(collList),
      roles: ConfigManagementHelper.common.buildConfigEntityFromList(rolesList)
    };

    const envName = randomStrings.envName();
    let envId;
    let actualRoles;
    let rolesNameIdPairs = {};

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

          for (let i = 0; i < expectedRolesCount; i++) {
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
      }
    ], done);
  });
};
