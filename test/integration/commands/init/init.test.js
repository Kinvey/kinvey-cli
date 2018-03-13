/**
 * Copyright (c) 2017, Kinvey, Inc. All rights reserved.
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

const cloneDeep = require('lodash.clonedeep');

const testsConfig = require('../../../TestsConfig');
const { assertions, setup, getCreatedProfileMessage, runSupposeSequence } = require('../../../TestsHelper');

const fixtureUser = require('./../../../fixtures/user.json');
const mockServer = require('../../../mockServer');
const path = require('path');

const suppose = require('suppose');
const fs = require('fs');

const outputFile = testsConfig.paths.supposeDebug;
const existentUser = fixtureUser.existent;
const nonExistentUser = fixtureUser.nonexistent;

const initCommand = 'init';
const invalidCredentialsMessage = 'Invalid credentials, please authenticate.';
const invalidConfigUrlMessage = 'InvalidConfigUrl: The configuration URL is invalid. Please use a valid Kinvey instance name or URL.';

describe(initCommand, () => {
  const expectedValidUser = {
    host: testsConfig.host,
    email: existentUser.email,
    token: fixtureUser.token
  };

  const defaultProfileName = 'testProfile';
  const expectedProfile = assertions.buildExpectedProfile(defaultProfileName, expectedValidUser.host, expectedValidUser.email, expectedValidUser.token);
  const expectedProfiles = assertions.buildExpectedProfiles(expectedProfile);
  const defaultExpectedSetup = assertions.buildExpectedGlobalSetup({}, expectedProfiles);

  const defaultEnv = {
    NODE_CONFIG: JSON.stringify(testsConfig)
  };

  const defaultEnvWithDebug = {
    env: defaultEnv,
    debug: fs.createWriteStream(outputFile)
  };

  const invalidURLConfig = cloneDeep(testsConfig);
  invalidURLConfig.host = 'http://somehost:1234/';

  const invalidEnv = {
    NODE_CONFIG: JSON.stringify(invalidURLConfig)
  };
  const invalidEnvWithDebug = {
    env: invalidEnv,
    debug: fs.createWriteStream(outputFile)
  };

  const Prompt = {
    email: /\? E-mail \(email\) /,
    password: /\? Password /,
    instanceId: /\? Instance ID \(optional\) /,
    profileName: /\? Profile name /
  };

  const invalidEmailMessageRegex = /Please enter a valid e-mail address/;
  const provideNotEmptyStringRegex = /Please provide a non-empty string./;

  let ms = {};
  const nodeCommand = 'node';
  const cliPath = path.join('bin', 'kinvey');

  before((done) => {
    mockServer(null, (err, server) => {
      if (err) {
        return done(err);
      }

      ms = server;
      return done();
    });
  });

  beforeEach((done) => {
    setup.clearAllSetup(done);
  });

  afterEach((done) => {
    setup.clearAllSetup(done);
  });

  after((done) => {
    if (ms.listening) {
      ms.close(() => {
        done();
      });
    } else {
      done();
    }
  });

  describe('with valid credentials', () => {
    it('without Instance ID should create a valid profile, using the default Instance', (done) => {
      const sequence = suppose(nodeCommand, [cliPath, initCommand], defaultEnvWithDebug)
        .when(Prompt.email)
        .respond(`${existentUser.email}\n`)
        .when(Prompt.password)
        .respond(`${existentUser.password}\n`)
        .when(Prompt.instanceId)
        .respond('\n')
        .when(Prompt.profileName)
        .respond(`${defaultProfileName}\n`);

      runSupposeSequence(sequence, (error, exitCode) => {
        assertions.assertSuccessfulInitSequence(error, exitCode, defaultExpectedSetup, outputFile, getCreatedProfileMessage(defaultProfileName), done);
      });
    });

    it('with supplied Instance ID should create a valid profile, using the supplied Url', (done) => {
      const sequence = suppose(nodeCommand, [cliPath, initCommand], invalidEnvWithDebug)
        .when(Prompt.email)
        .respond(`${existentUser.email}\n`)
        .when(Prompt.password)
        .respond(`${existentUser.password}\n`)
        .when(Prompt.instanceId)
        .respond(`${testsConfig.host}\n`)
        .when(Prompt.profileName)
        .respond(`${defaultProfileName}\n`);

      runSupposeSequence(sequence, (error, exitCode) => {
        assertions.assertSuccessfulInitSequence(error, exitCode, defaultExpectedSetup, outputFile, getCreatedProfileMessage(defaultProfileName), done);
      });
    });
  });

  describe('with insufficient info', () => {
    it('without an email should prompt again for a valid one and complete the init with a valid input', (done) => {
      const sequence = suppose(nodeCommand, [cliPath, initCommand], defaultEnvWithDebug)
        .when(Prompt.email)
        .respond('\n')
        .when(invalidEmailMessageRegex)
        .respond(`${existentUser.email}\n`)
        .when(Prompt.password)
        .respond(`${existentUser.password}\n`)
        .when(Prompt.instanceId)
        .respond('\n')
        .when(Prompt.profileName)
        .respond(`${defaultProfileName}\n`);

      runSupposeSequence(sequence, (error, exitCode) => {
        assertions.assertSuccessfulInitSequence(error, exitCode, defaultExpectedSetup, outputFile, getCreatedProfileMessage(defaultProfileName), done);
      });
    });

    it('without a password should prompt again for a valid one and complete the init with a valid input', (done) => {
      const sequence = suppose(nodeCommand, [cliPath, initCommand], defaultEnvWithDebug)
        .when(Prompt.email)
        .respond(`${existentUser.email}\n`)
        .when(Prompt.password)
        .respond('\n')
        .when(provideNotEmptyStringRegex)
        .respond(`${existentUser.password}\n`)
        .when(Prompt.instanceId)
        .respond('\n')
        .when(Prompt.profileName)
        .respond(`${defaultProfileName}\n`);

      runSupposeSequence(sequence, (error, exitCode) => {
        assertions.assertSuccessfulInitSequence(error, exitCode, defaultExpectedSetup, outputFile, getCreatedProfileMessage(defaultProfileName), done);
      });
    });

    it('without a profile name should prompt again for a valid one and complete the init with a valid input', (done) => {
      const sequence = suppose(nodeCommand, [cliPath, initCommand], defaultEnvWithDebug)
        .when(Prompt.email)
        .respond(`${existentUser.email}\n`)
        .when(Prompt.password)
        .respond(`${existentUser.password}\n`)
        .when(Prompt.instanceId)
        .respond('\n')
        .when(Prompt.profileName)
        .respond('\n')
        .when(provideNotEmptyStringRegex)
        .respond(`${defaultProfileName}\n`);

      runSupposeSequence(sequence, (error, exitCode) => {
        assertions.assertSuccessfulInitSequence(error, exitCode, defaultExpectedSetup, outputFile, getCreatedProfileMessage(defaultProfileName), done);
      });
    });
  });

  describe('with invalid data', () => {
    it('with a not existing user should return an invalid credentials message warning, prompt again and complete the init with a valid input', (done) => {
      const sequence = suppose(nodeCommand, [cliPath, initCommand], defaultEnvWithDebug)
        .when(Prompt.email)
        .respond(`${nonExistentUser.email}\n`)
        .when(Prompt.password)
        .respond(`${nonExistentUser.password}\n`)
        .when(Prompt.instanceId)
        .respond('\n')
        .when(Prompt.profileName)
        .respond(`${defaultProfileName}\n`)
        .when(Prompt.email)
        .respond(`${existentUser.email}\n`)
        .when(Prompt.password)
        .respond(`${existentUser.password}\n`);

      runSupposeSequence(sequence, (error, exitCode) => {
        expect(error.message).to.contain(invalidCredentialsMessage);
        expect(exitCode).to.equal(0);
        assertions.assertGlobalSetup(defaultExpectedSetup, testsConfig.paths.session, (err) => {
          expect(err).to.not.exist;
          assertions.assertFileContainsString(outputFile, getCreatedProfileMessage(defaultProfileName), done);
        });
      });
    });

    it('with an invalid email format should prompt again for a valid one and complete the init with a valid input', (done) => {
      const sequence = suppose(nodeCommand, [cliPath, initCommand], defaultEnvWithDebug)
        .when(Prompt.email)
        .respond('@test\n')
        .when(invalidEmailMessageRegex)
        .respond(`${existentUser.email}\n`)
        .when(Prompt.password)
        .respond(`${existentUser.password}\n`)
        .when(Prompt.instanceId)
        .respond('\n')
        .when(Prompt.profileName)
        .respond(`${defaultProfileName}\n`);

      runSupposeSequence(sequence, (error, exitCode) => {
        assertions.assertSuccessfulInitSequence(error, exitCode, defaultExpectedSetup, outputFile, getCreatedProfileMessage(defaultProfileName), done);
      });
    });

    it('with an invalid Instance Id should exit with an invalid configuration Url error message', (done) => {
      const invalidInstanceName = 'invalid_instance';
      const sequence = suppose(nodeCommand, [cliPath, initCommand], defaultEnvWithDebug)
        .when(Prompt.email)
        .respond(`${existentUser.email}\n`)
        .when(Prompt.password)
        .respond(`${existentUser.password}\n`)
        .when(Prompt.instanceId)
        .respond(`${invalidInstanceName}\n`)
        .when(Prompt.profileName)
        .respond(`${defaultProfileName}\n`);

      runSupposeSequence(sequence, (error, exitCode) => {
        expect(error.message).to.contain(invalidConfigUrlMessage);
        expect(exitCode).to.equal(1);
        done();
      });
    });
  });
});
