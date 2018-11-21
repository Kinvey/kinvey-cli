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

const ConfigManagementHelper = require('./../../ConfigManagementHelper');
const { execCmdWoMocks, randomStrings } = require('./../../TestsHelper');

module.exports = () => {
  const appName = randomStrings.appName();

  before('setup app', (done) => {
    ConfigManagementHelper.app.createInTestsOrg({ name: appName }, done);
  });

  after('remove app', (done) => {
    execCmdWoMocks(`app delete --app ${appName} --no-prompt`, null, done);
  });

  it('with collections, hooks, endpoints, push settings, groups, roles should succeed', (done) => {
    const collList = ConfigManagementHelper.env.buildValidInternalCollectionsList(2, true);
    const rolesList = ConfigManagementHelper.roles.buildValidRolesList(2);
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

    const pushSettings = {
      android: {
        senderId: 'id123',
        apiKey: 'key123'
      }
    };

    const groups = {
      oneGroup: {
        description: 'One group',
        groups: ['anotherGroup']
      },
      otherGroup: {}
    };

    const endpoints = {
      myEndpoint: {
        type: 'internal',
        code: 'function onRequest(request, response, modules) {\nconsole.log("On request...");\n  response.continue();\n}'
      }
    };

    const envConfig = {
      schemaVersion: '1.0.0',
      configType: 'environment',
      collections: ConfigManagementHelper.common.buildConfigEntityFromList(collList),
      collectionHooks: collHooks,
      roles: ConfigManagementHelper.common.buildConfigEntityFromList(rolesList),
      push: pushSettings,
      customEndpoints: endpoints,
      groups
    };

    const envName = randomStrings.envName();
    let envId;
    let exportedConfig;

    async.series([
      (next) => {
        ConfigManagementHelper.env.createFromConfig(envName, envConfig, appName, (err, id) => {
          if (err) {
            return next(err);
          }

          envId = id;
          next();
        });
      },
      (next) => {
        ConfigManagementHelper.env.exportEnv(envName, appName, (err, result) => {
          if (err) {
            return next(err);
          }

          exportedConfig = result;
          next();
        });
      },
      (next) => {
        ConfigManagementHelper.env.assertExportedConfig(envConfig, exportedConfig, next);
      }
    ], done);
  });
};
