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

const MockServer = require('./../mock-server');
const helper = require('../tests-helper');
const fixtureInternalDataLink = require('./../fixtures/kinvey-dlc.json');

describe('status', () => {
  const mockServer = new MockServer(true);
  const sandbox = sinon.sandbox.create();

  const cmdStatusPath = './../../lib/commands/status';

  afterEach('generalCleanup', (cb) => {
    sandbox.restore();
    helper.setup.performGeneralCleanup(cb);
  });

  describe('when user and project are already set', () => {
    beforeEach('setupUserAndProject', (cb) => {
      helper.setup.configureUserAndProject(sandbox, mockServer, cb);
    });

    describe('setup is valid', () => {
      it('should return status', (cb) => {
        const serviceStatus = constants.ServiceStatus.ONLINE;
        mockServer.serviceStatus(serviceStatus);

        const spyConsole = sandbox.spy(console, 'log');

        // TODO: assert status when cb starts receiving it
        require(cmdStatusPath).handler({}, (err, actualStatus) => {
          expect(err).to.not.exist;
          expect(mockServer.isDone()).to.be.true;

          const paintedServiceId = chalk.cyan(fixtureInternalDataLink.id);
          const paintedServiceName = chalk.gray(fixtureInternalDataLink.name);
          expect(spyConsole.withArgs('Status of FSR service %s (%s)', paintedServiceId, paintedServiceName)).to.be.calledOnce;

          const paintedStatus = chalk.greenBright(serviceStatus);
          expect(spyConsole.withArgs('  Status:   %s', paintedStatus)).to.be.calledOnce;
          cb();
        });
      });
    });

    describe('setup is invalid', () => {
      it('should return error if project is not set correctly', (cb) => {
        helper.setup.setInvalidProject((err) => {
          expect(err).to.not.exist;

          require(cmdStatusPath).handler({}, (err) => {
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

      require(cmdStatusPath).handler({}, (err) => {
        helper.assertions.assertError(err, constants.Errors.ProjectNotConfigured);
        expect(mockServer.isDone()).to.be.true;

        const expectedUser = helper.assertions.buildExpectedUser();
        helper.assertions.assertUserProjectSetup(expectedUser, null, cb);
      });
    });
  });
});
