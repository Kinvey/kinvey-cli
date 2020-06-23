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
const AppHelper = ConfigManagementHelper.app;
const { execCmdWoMocks, randomStrings } = require('./../../TestsHelper');

module.exports = () => {
  let appName;

  afterEach('remove all apps and services', (done) => {
    ConfigManagementHelper.org.removeAppsAndServices('CliOrg', done);
  });

  it('modifying settings and envs, and creating envs should succeed', (done) => {
    const internalCollList = EnvHelper.buildValidInternalCollectionsList(2, false);
    const internalConfigColls = ConfigManagementHelper.common.buildConfigEntityFromList(internalCollList);
    const basicEnvWithInternalCollsOnly = {
      schemaVersion: '1.0.0',
      settings: EnvHelper.buildSettings(),
      collections: internalConfigColls
    };

    const initialServiceName = randomStrings.plainString();
    const initialService = {
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

    const initialConfig = {
      schemaVersion: '1.0.0',
      configType: 'application',
      environments: {
        Prod: cloneDeep(basicEnvWithInternalCollsOnly),
        Test: cloneDeep(basicEnvWithInternalCollsOnly)
      }
    };

    const modifiedConfig = cloneDeep(initialConfig);
    modifiedConfig.settings = {
      sessionTimeoutInSeconds: 90
    };

    // add a collection to an existing env
    const collListToAdd = EnvHelper.buildValidInternalCollectionsList(1, false);
    const modifiedCollList = [...collListToAdd, ...internalCollList];
    const modifiedColls = ConfigManagementHelper.common.buildConfigEntityFromList(modifiedCollList);
    modifiedConfig.environments.Prod.collections = modifiedColls;
    modifiedConfig.environments.newEnv = {
      schemaVersion: '1.0.0',
      customEndpoints: {
        myEndpoint: {
          type: 'internal',
          code: 'function onRequest(request, response, modules) {\nconsole.log("On request...");\n  response.continue();\n}'
        }
      }
    };

    appName = randomStrings.appName();
    const orgIdentifier = 'CliOrg';
    let appId;

    async.series([
      (next) => {
        AppHelper.createFromConfig(appName, initialConfig, orgIdentifier, (err, id) => {
          if (err) {
            return next(err);
          }

          appId = id;
          next();
        });
      },
      (next) => {
        AppHelper.modifyFromConfig(appName, modifiedConfig, next);
      },
      (next) => {
        const options = {
          config: modifiedConfig,
          id: appId,
          expectedName: appName,
          collListPerEnv: { Prod: modifiedCollList, Test: internalCollList, newEnv: [] },
          expectOrg: true,
          orgIdentifier
        };
        AppHelper.assertApp(options, next);
      }
    ], done);
  });
};
