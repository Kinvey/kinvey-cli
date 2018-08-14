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
const moment = require('moment');
const path = require('path');

const ApiService = require('./../../ApiService');
const ConfigManagementHelper = require('./../../ConfigManagementHelper');
const { execCmdWoMocks, randomStrings } = require('./../../TestsHelper');

module.exports = () => {
  const appName = randomStrings.appName();

  before('setup app', (done) => {
    ConfigManagementHelper.app.createInTestsOrg({ name: appName }, done);
  });

  after('remove app', (done) => {
    execCmdWoMocks(`app delete ${appName} --no-prompt`, null, done);
  });

  it('modifying collections, groups, endpoints and push settings; creating hooks; omitting roles should succeed', (done) => {
    // initial env
    const collList = ConfigManagementHelper.env.buildValidInternalCollectionsList(2, true);
    const rolesList = ConfigManagementHelper.roles.buildValidRolesList(2);
    const pushSettings = {
      android: {
        senderId: 'id123',
        apiKey: 'key123'
      }
    };

    const groups = {
      oneGroup: {
        description: 'One group',
        groups: ['otherGroup']
      },
      otherGroup: {}
    };

    const endpoints = {
      myEndpoint: {
        type: 'internal',
        code: 'function onRequest(request, response, modules) {\nconsole.log("On request...");\n  response.continue();\n}'
      }
    };

    const initialEnv = {
      schemaVersion: '1.0.0',
      configType: 'environment',
      collections: ConfigManagementHelper.common.buildConfigEntityFromList(collList),
      roles: ConfigManagementHelper.common.buildConfigEntityFromList(rolesList),
      push: pushSettings,
      customEndpoints: endpoints,
      groups
    };

    // modified env
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

    const modifiedEnv = cloneDeep(initialEnv);
    modifiedEnv.collections = ConfigManagementHelper.common.buildConfigEntityFromList(collList);
    modifiedEnv.collectionHooks = collHooks;
    modifiedEnv.push.android.apiKey = '456';
    modifiedEnv.groups.otherGroup = { name: 'Other group', description: 'Description for other group' };
    modifiedEnv.customEndpoints.myEndpoint.schedule = {
      start: moment().add(1, 'month').toISOString()
    };

    const modifiedConfig = cloneDeep(modifiedEnv);
    delete modifiedConfig.roles;

    const envName = randomStrings.envName();
    const rolesNameIdPairs = {};
    let envId;

    async.series([
      (next) => {
        ConfigManagementHelper.env.createFromConfig(envName, initialEnv, appName, (err, id) => {
          if (err) {
            return next(err);
          }

          envId = id;
          next();
        });
      },
      (next) => {
        ConfigManagementHelper.env.modifyFromConfig(modifiedConfig, envName, appName, next);
      },
      (next) => {
        ConfigManagementHelper.env.assertEnvOnly(modifiedEnv, envId, envName, next);
      },
      (next) => {
        ApiService.roles.get(envId, null, (err, actualRoles) => {
          if (err) {
            return next(err);
          }

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
        ConfigManagementHelper.env.assertCollections(envId, collList, collList.length, rolesNameIdPairs, next);
      },
      (next) => {
        ConfigManagementHelper.env.assertGroups(envId, modifiedConfig.groups, next);
      },
      (next) => {
        ConfigManagementHelper.env.assertAllCollHooks(envId, modifiedConfig.collectionHooks, next);
      },
      (next) => {
        ConfigManagementHelper.env.assertPushSettings(envId, modifiedConfig.push, next);
      },
      (next) => {
        ConfigManagementHelper.env.assertEndpoints(envId, modifiedConfig.customEndpoints, next);
      }
    ], done);
  });
};
