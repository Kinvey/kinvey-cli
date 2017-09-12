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

const async = require('async');
const inquirer = require('inquirer');

const EnvironmentVariables = require('./../lib/constants').EnvironmentVariables;
const config = require('config');
const logger = require('../lib/logger');
const prompt = require('./../lib/prompt');
const util = require('../lib/util');

const command = require('./fixtures/command');
const fixtureUser = require('./fixtures/user.json');
const fixtureApp = require('./fixtures/app.json');
const fixtureInternalDataLink = require('./fixtures/kinvey-dlc.json');
const fixtureJob = require('./fixtures/job.json');
const MockServer = require('./mock-server');

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
            for (const prop in expectedProject) {
              const actualValue = actualProject[prop];
              const expectedValue = expectedProject[prop];
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
  },
  buildExpectedUser(host = config.host, token = fixtureUser.token) {
    const user = {
      host,
      tokens: {
        [host]: token
      }
    };

    return user;
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

    mockServer.loginWithSuccess();
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

  setInvalidProject(cb) {
    // setup for failure - service is null
    const invalidProjectToRestore = helper.assertions.buildExpectedProject(fixtureApp.id, null, null, fixtureInternalDataLink.name, null);
    util.writeJSON(config.paths.project, invalidProjectToRestore, (err) => {
      cb(err, invalidProjectToRestore);
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

  // Deploys a job. User must be already logged in and project must be set.
  initiateJobDeploy(mockServer, cb) {
    mockServer.deployJob();

    require('./../cmd/deploy')(command, (err) => {
      expect(err).to.not.exist;
      expect(mockServer.isDone()).to.be.true;

      const expectedUser = {
        host: config.host,
        tokens: {
          [config.host]: fixtureUser.token
        }
      };
      const expectedProject = helper.assertions.buildExpectedProject(fixtureApp.id, null, fixtureJob.job, fixtureInternalDataLink.name, fixtureInternalDataLink.id);
      helper.assertions.assertUserProjectSetup(expectedUser, expectedProject, cb);
    });
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
  },

  // Ensure modules are reloaded every time and tests are independent (e.g class User -> this.token will be cleared).
  clearRequireCache() {
    const modules = [
      '/cmd/config', '/cmd/deploy', '/cmd/job', '/cmd/list', '/cmd/logout', '/cmd/logs', '/cmd/recycle', '/cmd/status',
      '/lib/project', '/lib/service', '/lib/user', '/lib/util'
    ];

    modules.forEach(module => {
      const pathToResolve = `./..${module}`;
      delete require.cache[require.resolve(pathToResolve)];
    });
  },

  // Clears some cached modules, any unused nock interceptors, user/session info and project setup info.
  performGeneralCleanup(cb) {
    helper.setup.clearRequireCache();
    MockServer.clearAll();
    helper.setup.clearUserProjectSetup(cb);
  }
};

module.exports = helper;
