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
const { ConfigFilesDir, execCmdWoMocks, randomStrings } = require('./../../TestsHelper');
const { writeJSON } = require('../../../lib/Utils');

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
      configType: 'environment',
      settings: envSettings
    };

    const envName = randomStrings.envName();
    let filePath;
    let envId;

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
          envId = parsedData.result.id;
          next();
        });
      },
      (next) => {
        ApiService.envs.get(envId, (err, actualEnv) => {
          if (err) {
            return next(err);
          }

          expect(actualEnv.name).to.equal(envName);
          expect(actualEnv.emailVerification).to.deep.equal(envSettings.emailVerification);
          expect(actualEnv.apiVersion).to.equal(envSettings.apiVersion);
          next();
        });
      }
    ], done);
  });

  it('settings and internal collections wo system collections should succeed', (done) => {
    const collList = EnvHelper.buildValidInternalCollectionsList(3, false);

    const envSettings = EnvHelper.buildSettings();
    const env = {
      configType: 'environment',
      settings: envSettings
    };

    const envName = randomStrings.envName();
    let filePath;
    let envId;

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
          envId = parsedData.result.id;
          next();
        });
      },
      (next) => {
        ApiService.envs.get(envId, (err, actualEnv) => {
          if (err) {
            return next(err);
          }

          expect(actualEnv.name).to.equal(envName);
          expect(actualEnv.emailVerification).to.deep.equal(envSettings.emailVerification);
          expect(actualEnv.apiVersion).to.equal(envSettings.apiVersion);
          next();
        });
      },
      (next) => {
        ApiService.colls.get(envId, null, (err, actualColls) => {
          if (err) {
            return next(err);
          }

          const expectedCollCountWoSystemColls = collList.length;
          const expectedCollCount = expectedCollCountWoSystemColls + 2;
          expect(expectedCollCount).to.equal(actualColls.length);

          for (let i = 0; i < expectedCollCountWoSystemColls; i++) {
            const expColl = collList[i];
            const actualColl = actualColls.find(x => x.name === expColl.name);
            if (!actualColl) {
              return next(new Error(`Failed to find coll with name '${expColl.name}'.`));
            }

            expect(actualColl.permissions).to.equal('append-read');
          }

          next();
        });
      }
    ], done);
  });
};