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
const async = require('async');
const chalk = require('chalk');

const config = require('config');
const constants = require('./../../lib/constants');
const logger = require('./../../lib/logger');
const util = require('../../lib/utils');

const MockServer = require('./../mock-server');
const fixtureJob = require('./../fixtures/job.json');
const helper = require('../tests-helper');

function assertLoggerForStatus(spy) {
  const expectedStatus = chalk.cyan(constants.JobStatus.COMPLETE);
  expect(spy.withArgs('Job status: %s%s', expectedStatus, '')).to.be.calledOnce;
}

describe('job', () => {
  const mockServer = new MockServer(true);
  const sandbox = sinon.sandbox.create();
  const cmdJobPath = './../../lib/commands/flex/job';

  afterEach('generalCleanup', (cb) => {
    sandbox.restore();
    helper.setup.performGeneralCleanup(cb);
  });

  describe('when user and project are already set', () => {
    beforeEach('setupUserAndProject', (cb) => {
      helper.setup.configureUserAndProject(sandbox, mockServer, cb);
    });

    describe('setup is valid', () => {
      it('without job id should return job status for last job', (cb) => {
        helper.setup.initiateJobDeploy(mockServer, (err) => {
          expect(err).to.not.exist;

          mockServer.jobStatus();
          const spyLogger = sandbox.spy(logger, 'info');

          // TODO: check actualStatus when cb starts receiving it
          require(cmdJobPath).handler({}, (err, actualStatus) => {
            expect(err).to.not.exist;
            expect(mockServer.isDone()).to.be.true;
            assertLoggerForStatus(spyLogger);
            cb();
          });
        });
      });

      it('with job id should return job status for specified job', (cb) => {
        const projectPath = config.paths.project;
        let project;

        async.series([
          function readInitialProjectSetup(next) {
            util.readJSON(projectPath, (err, data) => {
              expect(err).to.not.exist;
              expect(data).to.exist;
              project = data;
              next();
            });
          },
          function setWrongLastJobId(next) {
            project.lastJobId = 'ifYouUseMeTheTestWillFail';
            util.writeJSON(projectPath, project, next);
          },
          function testJobStatus(next) {
            mockServer.jobStatus();
            const spyLogger = sandbox.spy(logger, 'info');

            require(cmdJobPath).handler({ id: fixtureJob.job }, (err) => {
              expect(err).to.not.exist;
              expect(mockServer.isDone()).to.be.true;
              assertLoggerForStatus(spyLogger);
              next();
            });
          }
        ], cb);
      });
    });

    describe('setup is invalid', () => {
      it('should return error if project is not set correctly', (cb) => {
        helper.setup.setInvalidProject((err) => {
          expect(err).to.not.exist;

          require(cmdJobPath).handler({}, (err) => {
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
      mockServer.loginWithSuccess();

      require(cmdJobPath).handler({}, (err) => {
        helper.assertions.assertError(err, constants.Errors.ProjectNotConfigured);
        expect(mockServer.isDone()).to.be.true;

        const expectedUser = helper.assertions.buildExpectedUser();
        helper.assertions.assertUserProjectSetup(expectedUser, null, cb);
      });
    });
  });
});
