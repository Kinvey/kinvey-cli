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
const path = require('path');

const cloneDeep = require('lodash.clonedeep');
const suppose = require('suppose');

const { PromptMessages, Errors, AuthOptionsNames, SubCommand, Namespace } = require('../../../../lib/Constants');
const testsConfig = require('../../../TestsConfig');
const { assertions, setup, getCreatedProfileMessage, runSupposeSequence } = require('../../../TestsHelper');
const fixtureUser = require('./../../../fixtures/user.json');
const mockServer = require('../../../mockServer');

const outputFile = testsConfig.paths.supposeDebug;
const existentUser = fixtureUser.existent;
const nonExistentUser = fixtureUser.nonexistent;

const initCommand = SubCommand[Namespace.FLEX].INIT;
const invalidConfigUrlMessage = Errors.InvalidConfigUrl.MESSAGE;
const invalidCredentialsMessage = 'Invalid credentials, please authenticate.';
const requiredTwoFactorAuthMessage = 'Two-factor authentication is required, but a token was missing from your request.';

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
  const valid2FAToken = `${fixtureUser.existentWith2FA.twoFactorToken}`;
  const invalid2FAToken = '666';

  const defaultEnv = {
    NODE_CONFIG: JSON.stringify(testsConfig),
    PATH: process.env.PATH
  };

  const defaultEnvWithDebug = {
    env: defaultEnv,
    debug: fs.createWriteStream(outputFile)
  };

  const invalidURLConfig = cloneDeep(testsConfig);
  invalidURLConfig.host = 'http://somehost:1234/';

  const invalidEnv = {
    NODE_CONFIG: JSON.stringify(invalidURLConfig),
    PATH: process.env.PATH
  };
  const invalidEnvWithDebug = {
    env: invalidEnv,
    debug: fs.createWriteStream(outputFile)
  };

  const escapeParentheses = stringValue => stringValue.replace(')', '\\)').replace('(', '\\(');

  const buildPromptString = stringValue => `\\? ${stringValue}`;

  const Prompt = {
    email: new RegExp(buildPromptString(`${PromptMessages.INPUT_EMAIL} \\(${AuthOptionsNames.EMAIL}\\)`)),
    password: new RegExp(buildPromptString(PromptMessages.INPUT_PASSWORD)),
    instanceId: new RegExp(buildPromptString(escapeParentheses(PromptMessages.INPUT_HOST))),
    profileName: new RegExp(buildPromptString(escapeParentheses(PromptMessages.INPUT_PROFILE))),
    twoFactorAuthToken: new RegExp(buildPromptString(PromptMessages.INPUT_MFA_TOKEN)),
  };

  const invalidEmailMessageRegex = new RegExp(PromptMessages.INVALID_EMAIL_ADDRESS);
  const provideNotEmptyStringRegex = new RegExp(PromptMessages.INVALID_STRING);
  const invalid2FATokenRegex = new RegExp(escapeParentheses(PromptMessages.INVALID_MFA_TOKEN));

  let ms = {};
  const nodeCommand = 'node';
  const cliPath = path.join('bin', 'kinvey');

  beforeEach((done) => {
    setup.clearAllSetup(done);
  });

  afterEach((done) => {
    setup.clearAllSetup(done);
  });

  describe('regular login', () => {
    before((done) => {
      mockServer(null, (err, server) => {
        if (err) {
          return done(err);
        }

        ms = server;
        return done();
      });
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
          assertions.assertSupposeError(error, exitCode, invalidCredentialsMessage, 0);
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
          assertions.assertSupposeError(error, exitCode, invalidConfigUrlMessage, 1);
          done();
        });
      });
    });
  });

  describe('login with 2FA', () => {
    before((done) => {
      mockServer({ require2FAToken: true, twoFactorToken: valid2FAToken }, (err, server) => {
        if (err) {
          return done(err);
        }

        ms = server;
        return done();
      });
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

    it('should prompt for a two factor authentication token if 2FA is enabled for the user and complete the initialization', (done) => {
      const sequence = suppose(nodeCommand, [cliPath, initCommand], defaultEnvWithDebug)
        .when(Prompt.email)
        .respond(`${existentUser.email}\n`)
        .when(Prompt.password)
        .respond(`${existentUser.password}\n`)
        .when(Prompt.instanceId)
        .respond('\n')
        .when(Prompt.profileName)
        .respond(`${defaultProfileName}\n`)
        .when(Prompt.twoFactorAuthToken)
        .respond(`${valid2FAToken}\n`);

      runSupposeSequence(sequence, (error, exitCode) => {
        assertions.assertSupposeError(error, exitCode, requiredTwoFactorAuthMessage, 0);
        assertions.assertGlobalSetup(defaultExpectedSetup, testsConfig.paths.session, (err) => {
          expect(err).to.not.exist;
          assertions.assertFileContainsString(outputFile, getCreatedProfileMessage(defaultProfileName), done);
        });
      });
    });

    it('should return an error for an invalid 2FA token and complete the initialization if a valid one is submitted', (done) => {
      const sequence = suppose(nodeCommand, [cliPath, initCommand], defaultEnvWithDebug)
        .when(Prompt.email)
        .respond(`${existentUser.email}\n`)
        .when(Prompt.password)
        .respond(`${existentUser.password}\n`)
        .when(Prompt.instanceId)
        .respond('\n')
        .when(Prompt.profileName)
        .respond(`${defaultProfileName}\n`)
        .when(Prompt.twoFactorAuthToken)
        .respond(`${invalid2FAToken}\n`)
        .when(invalid2FATokenRegex)
        .respond(`${valid2FAToken}\n`);

      runSupposeSequence(sequence, (error, exitCode) => {
        assertions.assertSupposeError(error, exitCode, requiredTwoFactorAuthMessage, 0);
        assertions.assertGlobalSetup(defaultExpectedSetup, testsConfig.paths.session, (err) => {
          expect(err).to.not.exist;
          assertions.assertFileContainsString(outputFile, getCreatedProfileMessage(defaultProfileName), done);
        });
      });
    });
  });
});
