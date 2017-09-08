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

const sinon = require('sinon');
const chalk = require('chalk');

const constants = require('./../../lib/constants');
const logger = require('./../../lib/logger');

const command = require('./../fixtures/command.js');
const MockServer = require('./../mock-server');
const fixtureApp = require('./../fixtures/app.json');
const fixtureJob = require('./../fixtures/job.json');
const fixtureInternalDataLink = require('./../fixtures/kinvey-dlc.json');
const helper = require('./../helper');

function assertLoggerForRecycleJob(spy, jobId) {
  const expectedJobId = chalk.cyan(jobId);
  expect(spy.withArgs('Recycle initiated, received job %s', expectedJobId)).to.be.calledOnce;
}

describe('recycle', () => {
  const mockServer = new MockServer(true);
  const sandbox = sinon.sandbox.create();

  const cmdRecyclePath = './../../cmd/recycle';

  const defaultExpectedJobId = fixtureJob.job;
  const defaultExpectedUser = helper.assertions.buildExpectedUser();
  const defaultExpectedProject = helper.assertions.buildExpectedProject(fixtureApp.id, null, defaultExpectedJobId, fixtureInternalDataLink.name, fixtureInternalDataLink.id);

  afterEach((cb) => {
    sandbox.restore();
    MockServer.clearAll();
    helper.setup.clearRequireCache();
    helper.setup.clearUserProjectSetup(cb);
  });

  describe('when user and project are already set', () => {
    beforeEach('setupUserAndProject', (cb) => {
      helper.setup.configureUserAndProject(sandbox, mockServer, cb);
    });

    describe('setup is valid', () => {
      it('should recycle job', (cb) => {
        mockServer.recycleJob(defaultExpectedJobId);
        const spyLogger = sandbox.spy(logger, 'info');

        require(cmdRecyclePath)(command, (err) => {
          expect(err).to.not.exist;
          expect(mockServer.isDone()).to.be.true;
          assertLoggerForRecycleJob(spyLogger, defaultExpectedJobId);
          helper.assertions.assertUserProjectSetup(defaultExpectedUser, defaultExpectedProject, cb);
        });
      });
    });

    describe('setup is invalid', () => {
      it('should return error if project is not set correctly', (cb) => {
        helper.setup.setInvalidProject((err) => {
          expect(err).to.not.exist;

          require(cmdRecyclePath)(command, (err) => {
            helper.assertions.assertError(err, constants.Errors.ProjectNotConfigured);
            cb();
          });
        });
      });
    });
  });

  describe('when user and project are not set', () => {
    beforeEach('setupPromptStubs', () => {
      helper.setup.userPromptStubsForSuccess(sandbox);
    });

    it('should set user and return error', (cb) => {
      mockServer.loginForSuccess();

      require(cmdRecyclePath)(command, (err) => {
        helper.assertions.assertError(err, constants.Errors.ProjectNotConfigured);
        expect(mockServer.isDone()).to.be.true;

        const expectedUser = helper.assertions.buildExpectedUser();
        helper.assertions.assertUserProjectSetup(expectedUser, null, cb);
      });
    });
  });
});
