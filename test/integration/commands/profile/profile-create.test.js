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

const { AuthOptionsNames, CommonOptionsNames, EnvironmentVariables, OutputFormat } = require('./../../../../lib/Constants');
const testsConfig = require('../../../TestsConfig');
const { assertions, execCmdWithAssertion, setup, testTooManyArgs } = require('../../../TestsHelper');

const fixtureUser = require('./../../../fixtures/user.json');

const existentUser = fixtureUser.existent;
const nonExistentUser = fixtureUser.nonexistent;

const baseCmd = 'profile create';

describe('profile create', () => {
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
    PATH: process.env.PATH,
    NODE_CONFIG: JSON.stringify(testsConfig)
  };

  before((done) => {
    setup.clearGlobalSetup(null, done);
  });

  afterEach((done) => {
    setup.clearGlobalSetup(null, done);
  });

  describe('with valid credentials', () => {
    it('set as options should create', (done) => {
      const cmd = `${baseCmd} ${defaultProfileName} --verbose --${AuthOptionsNames.EMAIL} ${existentUser.email} --${AuthOptionsNames.PASSWORD} ${existentUser.password}`;

      execCmdWithAssertion(cmd, { env: defaultEnv }, null, true, true, false, null, (err) => {
        expect(err).to.not.exist;

        assertions.assertGlobalSetup(defaultExpectedSetup, testsConfig.paths.session, (err) => {
          expect(err).to.not.exist;
          done();
        });
      });
    });

    it('set as options and existent profile name should override', (done) => {
      setup.createProfiles(defaultProfileName, (err) => {
        expect(err).to.not.exist;

        const cmd = `${baseCmd} ${defaultProfileName} --verbose --${AuthOptionsNames.EMAIL} ${existentUser.email} --${AuthOptionsNames.PASSWORD} ${existentUser.password}`;

        execCmdWithAssertion(cmd, { env: defaultEnv }, null, true, true, false, null, (err) => {
          expect(err).to.not.exist;

          assertions.assertGlobalSetup(defaultExpectedSetup, testsConfig.paths.session, (err) => {
            expect(err).to.not.exist;
            done();
          });
        });
      });
    });

    it('set as environment variables should create', (done) => {
      const cmd = `${baseCmd} ${defaultProfileName} --${CommonOptionsNames.VERBOSE} --${CommonOptionsNames.OUTPUT} ${OutputFormat.JSON}`;
      const env = cloneDeep(defaultEnv);
      env[EnvironmentVariables.USER] = existentUser.email;
      env[EnvironmentVariables.PASSWORD] = existentUser.password;

      execCmdWithAssertion(cmd, { env }, null, true, true, false, null, (err) => {
        expect(err).to.not.exist;

        assertions.assertGlobalSetup(defaultExpectedSetup, testsConfig.paths.session, (err) => {
          expect(err).to.not.exist;
          done();
        });
      });
    });

    it('set as options and as environment variables should create', (done) => {
      const cmd = `${baseCmd} ${defaultProfileName} --verbose --${AuthOptionsNames.EMAIL} ${existentUser.email}`;
      const env = cloneDeep(defaultEnv);
      // should take user set as option and ignore one from env; should take password from env
      env[EnvironmentVariables.USER] = fixtureUser.nonexistent.email;
      env[EnvironmentVariables.PASSWORD] = existentUser.password;

      execCmdWithAssertion(cmd, { env }, null, true, true, false, null, (err) => {
        expect(err).to.not.exist;

        assertions.assertGlobalSetup(defaultExpectedSetup, testsConfig.paths.session, (err) => {
          expect(err).to.not.exist;
          done();
        });
      });
    });

    it('set as options + host should create', (done) => {
      const customPort = 6080;
      const customHost = `http://localhost:${customPort}/`;
      const cmd = `${baseCmd} ${defaultProfileName} --verbose --${AuthOptionsNames.EMAIL} ${existentUser.email} --${AuthOptionsNames.PASSWORD} ${existentUser.password} --${AuthOptionsNames.HOST} ${customHost}`;

      const apiOptions = { port: customPort };
      execCmdWithAssertion(cmd, { env: defaultEnv }, apiOptions, true, true, false, null, (err) => {
        expect(err).to.not.exist;

        const expectedProfile = assertions.buildExpectedProfile(defaultProfileName, customHost, expectedValidUser.email, expectedValidUser.token);
        const expectedProfiles = assertions.buildExpectedProfiles(expectedProfile);
        const expectedSetup = assertions.buildExpectedGlobalSetup({}, expectedProfiles);

        assertions.assertGlobalSetup(expectedSetup, testsConfig.paths.session, (err) => {
          expect(err).to.not.exist;
          done();
        });
      });
    });
  });

  describe('with invalid credentials', () => {
    it('set as options should fail', (done) => {
      const cmd = `${baseCmd} ${defaultProfileName} --verbose --${AuthOptionsNames.EMAIL} ${nonExistentUser.email} --${AuthOptionsNames.PASSWORD} ${nonExistentUser.password}`;

      execCmdWithAssertion(cmd, { env: defaultEnv }, null, true, true, false, null, (err) => {
        expect(err).to.not.exist;

        assertions.assertGlobalSetup(null, testsConfig.paths.session, (err) => {
          expect(err).to.not.exist;
          done();
        });
      });
    });

    it('set as options when trying to override should fail', (done) => {
      setup.createProfiles(defaultProfileName, (err) => {
        expect(err).to.not.exist;

        const cmd = `${baseCmd} ${defaultProfileName} --verbose --${AuthOptionsNames.EMAIL} ${nonExistentUser.email} --${AuthOptionsNames.PASSWORD} ${nonExistentUser.password}`;

        execCmdWithAssertion(cmd, { env: defaultEnv }, null, true, true, false, null, (err) => {
          expect(err).to.not.exist;

          assertions.assertGlobalSetup(defaultExpectedSetup, testsConfig.paths.session, (err) => {
            expect(err).to.not.exist;
            done();
          });
        });
      });
    });
  });

  describe('with insufficient info', () => {
    it('without password should fail', (done) => {
      const cmd = `${baseCmd} ${defaultProfileName} --verbose --${AuthOptionsNames.EMAIL} ${nonExistentUser.email}`;

      execCmdWithAssertion(cmd, { env: defaultEnv }, null, true, true, false, null, (err) => {
        expect(err).to.not.exist;

        assertions.assertGlobalSetup(null, testsConfig.paths.session, (err) => {
          expect(err).to.not.exist;
          done();
        });
      });
    });

    it('without profile name should fail', (done) => {
      const cmd = `${baseCmd} --verbose --${AuthOptionsNames.EMAIL} ${existentUser.email} --${AuthOptionsNames.PASSWORD} ${existentUser.password}`;

      execCmdWithAssertion(cmd, { env: defaultEnv }, null, true, false, true, null, (err) => {
        expect(err).to.not.exist;

        assertions.assertGlobalSetup(null, testsConfig.paths.session, (err) => {
          expect(err).to.not.exist;
          done();
        });
      });
    });

    it('with too many args should fail', (done) => {
      testTooManyArgs(baseCmd, 2, done);
    });
  });
});
