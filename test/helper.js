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

const path = require('path');
const async = require('async');
const nock = require('nock');
const inquirer = require('inquirer');

const EnvironmentVariables = require('./../lib/constants').EnvironmentVariables;
const config = require('config');
const logger = require('../lib/logger');
const prompt = require('./../lib/prompt');
const util = require('../lib/util');

const command = require('./fixtures/command');
const fixtureUser = require('./fixtures/user.json');
const fixtureApps = require('./fixtures/apps.json');
const fixtureApp = require('./fixtures/app.json');
const fixtureInternalDataLink = require('./fixtures/kinvey-dlc.json');

const helper = {};

helper.assertions = {
  assertCmdCommandWithoutCallbackForError(expectedErr) {
    expect(process.exit).to.be.calledOnce;
    expect(process.exit).to.be.calledWith(-1);
    expect(logger.error).to.be.calledOnce;
    expect(logger.error).to.be.calledWith('%s', expectedErr);
  },
  assertCmdCommandWithCallbackForError(actualErr, expectedErr) {
    expect(actualErr).to.exist;
    expect(logger.error).to.be.calledOnce;
    expect(logger.error).to.be.calledWith('%s', expectedErr);
    expect(actualErr).to.equal(expectedErr);
  },
  // Asserts that the saved session(user) and the saved project are as expected.
  assertUserProjectSetup(expectedUser, expectedProject, cb) {
    async.series(
      [
        function verifyUser(next) {
          util.readJSON(config.paths.session, (err, actualUser) => {
            if (err) {
              return next(err);
            }

            if (!expectedUser) {
              expect(actualUser).to.equal('');
              return next();
            }

            const host = expectedUser.host;
            expect(actualUser.host).to.equal(host);

            if (expectedUser.tokens) {
              expect(actualUser.tokens).to.exist;
              expect(actualUser.tokens[host]).to.exist.and.to.equal(expectedUser.tokens[host]);
            }

            next();
          });
        },
        function verifyProject(next) {
          util.readJSON(config.paths.project, (err, actualProject) => {
            if (err) {
              return next(err);
            }

            if (!expectedProject) {
              expect(actualProject).to.equal('');
              return next();
            }

            let discrepancy;
            for (let prop in expectedProject) {
              let actualValue = actualProject[prop];
              let expectedValue = expectedProject[prop];
              if (actualValue !== expectedValue) {
                discrepancy = `Expected: ${expectedValue}. Actual: ${actualValue}.`;
                break;
              }
            }

            expect(discrepancy).to.not.exist;

            next();
          });
        }
      ],
      cb
    );
  },
  assertError(actualErr, { name, message }) {
    expect(actualErr).to.exist;
    expect(actualErr.name).to.equal(name);
    expect(actualErr.message).to.equal(message);
  },
  buildExpectedProject(appId, org, lastJobId, serviceName, service, schemaVersion = config.defaultSchemaVersion) {
    return {
      org,
      lastJobId,
      serviceName,
      service,
      schemaVersion,
      app: appId
    };
  }
};

helper.mocks = {
  getInquirerPrompt(sandbox, answers) {
    return sandbox.stub(inquirer, 'prompt', (questions, cb) => {
      setTimeout(() => {
        cb(answers);
      }, 0);
    });
  },
  getStubCallArg(allCalls, callPosition, argPosition) {
    return allCalls[callPosition].args[argPosition];
  }
};

helper.env = {
  setCredentials(user, password) {
    process.env[EnvironmentVariables.USER] = user;
    process.env[EnvironmentVariables.PASSWORD] = password;
  },
  unsetCredentials() {
    delete process.env[EnvironmentVariables.USER];
    delete process.env[EnvironmentVariables.PASSWORD];
  }
};

helper.setup = {
  configureUserAndProject(sandbox, mockServer, cb) {
    this.userProjectPromptStubsForSuccess(sandbox);

    mockServer.loginForSuccess();
    mockServer.apps();
    mockServer.dataLinks();

    require('./../cmd/config')(null, command, (err) => {
      expect(err).to.not.exist;
      expect(mockServer.isDone()).to.be.true;

      const expectedUser = {
        host: config.host,
        tokens: {
          [config.host]: fixtureUser.token
        }
      };

      const expectedProject = helper.assertions.buildExpectedProject(fixtureApp.id, null, null, fixtureInternalDataLink.name, fixtureInternalDataLink.id);

      helper.assertions.assertUserProjectSetup(expectedUser, expectedProject, cb);
    });
  },

  userProjectPromptStubsForSuccess(sandbox) {
    this.userPromptStubsForSuccess(sandbox);
    this.projectPromptStubsForSuccess(sandbox);
  },

  userPromptStubsForSuccess(sandbox) {
    sandbox.stub(prompt, 'getEmailPassword').callsArgWith(2, null, fixtureUser.existent.email, fixtureUser.existent.password);
  },

  projectPromptStubsForSuccess(sandbox) {
    sandbox.stub(prompt, 'getAppOrOrg').callsArgWith(1, null, { name: 'App' });
    sandbox.stub(prompt, 'getApp').callsArgWith(1, null, fixtureApp);
    sandbox.stub(prompt, 'getService').callsArgWith(1, null, fixtureInternalDataLink);
  },

  // Clears content in session and project files.
  clearUserProjectSetup(cb) {
    async.series(
      [
        function clearUser(next) {
          util.writeJSON(config.paths.session, '', next);
        },
        function clearProject(next) {
          util.writeJSON(config.paths.project, '', next);
        }
      ],
      cb
    );
  }
};

module.exports = helper;
