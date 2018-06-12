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

const envConfigCreateTests = require('./env-config-create');

describe('Config management', () => {
  before(() => {
    const envEmail = process.env.KINVEY_CLI_EMAIL;
    const envPassword = process.env.KINVEY_CLI_PASSWORD;
    const credentialsAreSet = envEmail && envPassword;
    if (!credentialsAreSet) {
      throw new Error(`Env variables KINVEY_CLI_EMAIL(${envEmail}) and KINVEY_CLI_PASSWORD must be set to execute the tests.`);
    }

    console.log(`Starting config management tests...${EOL}E-mail: '${envEmail}'${EOL}Instance: '${process.env.KINVEY_CLI_INSTANCE_ID}'`);
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
    })
  });

  after(() => {
    const dirPath = ConfigFilesDir;
    const files = fs.readdirSync(dirPath);
    files.forEach((file) => {
      const filePath = path.join(dirPath, file);
      fs.unlinkSync(filePath);
    });

    fs.rmdirSync(dirPath);
  });

  describe('Env config create', envConfigCreateTests);
});