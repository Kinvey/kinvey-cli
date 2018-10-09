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
const { EOL } = require('os');
const path = require('path');

const { ConfigFilesDir } = require('./../../TestsHelper');

const appConfigCreateTests = require('./app-config-create');
const appConfigPushTests = require('./app-config-push');
const envConfigCreateTests = require('./env-config-create');
const envConfigPushTests = require('./env-config-push');
const envConfigExportTests = require('./env-config-export');
const orgConfigExportTests = require('./org-config-export');
const serviceConfigCreateTests = require('./service-config-create');
const serviceConfigPushTests = require('./service-config-push');
const serviceConfigExportTests = require('./service-config-export');

describe('Config management', () => {
  before(() => {
    const envEmail = process.env.KINVEY_CLI_EMAIL;
    const envPassword = process.env.KINVEY_CLI_PASSWORD;
    const credentialsAreSet = envEmail && envPassword;
    if (!credentialsAreSet) {
      throw new Error(`Env variables KINVEY_CLI_EMAIL(${envEmail}) and KINVEY_CLI_PASSWORD must be set to execute the tests.`);
    }

    const currentInstance = process.env.KINVEY_CLI_INSTANCE_ID || 'default instance (kvy-us1)';
    console.log(`Starting config management tests...${EOL}E-mail: '${envEmail}'${EOL}Instance: '${currentInstance}'`);
  });

  before((done) => {
    // create directory to hold config files created dynamically by the tests
    fs.mkdir(ConfigFilesDir, (err) => {
      if (err) {
        if (err.code === 'EEXIST') {
          return done();
        }

        return done(err);
      }

      done();
    });
  });

  after(() => {
    const removeDir = function removeDir(relativePath) {
      const dirPath = path.join(ConfigFilesDir, relativePath);
      if (!fs.existsSync(dirPath)) {
        return;
      }

      const dirContents = fs.readdirSync(dirPath);
      dirContents.forEach((x) => {
        const xPath = path.join(dirPath, x);
        if (fs.lstatSync(xPath).isDirectory()) {
          removeDir(path.join(relativePath, x));
        } else {
          fs.unlinkSync(xPath);
        }
      });

      fs.rmdirSync(dirPath);
    };

    removeDir('/');
  });

  describe('App config create', appConfigCreateTests);

  describe('App config push', appConfigPushTests);

  describe('Env config create', envConfigCreateTests);

  describe('Env config push', envConfigPushTests);

  describe('Env config export', envConfigExportTests);

  describe('Service config create', serviceConfigCreateTests);

  describe('Service config push', serviceConfigPushTests);

  describe('Service config export', serviceConfigExportTests);

  describe('Org config export', orgConfigExportTests);
});
