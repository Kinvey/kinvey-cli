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

const command = require('./../fixtures/command.js');
const fixtureLogs = require('./../fixtures/logs.json');
const fixtureInternalDataLink = require('./../fixtures/kinvey-dlc.json');
const MockServer = require('./../mock-server');
const helper = require('../tests-helper');

// Assumes that the output should be the logs from fixtures/logs.
function assertLogsOutput(spy) {
  // console.log('Query returned %s logs for FSR service %s (%s)', chalk.cyan(logs.length - skippedLogEntries.length), chalk.cyan(project.service), chalk.gray(project.serviceName));
  const expectedSkippedLogsCount = 1;
  const expectedLogsCount = chalk.cyan(fixtureLogs.length - expectedSkippedLogsCount);
  const expectedId = chalk.cyan(fixtureInternalDataLink.id);
  const expectedName = chalk.gray(fixtureInternalDataLink.name);
  expect(spy.withArgs('Query returned %s logs for FSR service %s (%s)', expectedLogsCount, expectedId, expectedName)).to.be.calledOnce;

  // console.log('%s %s - %s', chalk.green(log.containerId.substring(0, 12)), log.timestamp, chalk.cyan(messageString.trim()));
  const expectedLogs = fixtureLogs.filter(x => x.message);
  expectedLogs.forEach((x) => {
    const expectedContainerId = chalk.green(x.containerId.substring(0, 12));
    const expectedMsg = chalk.cyan(JSON.stringify(x.message));
    expect(spy.withArgs('%s %s - %s', expectedContainerId, x.timestamp, expectedMsg)).to.be.calledOnce;
  });
}

function buildCmdMock(start, end, pageNum, pageSize) {
  const commandMock = {
    opts: () => {},
    parent: {
      opts: () => {
        const userOptions = {};
        if (start) {
          userOptions.start = start;
        }

        if (end) {
          userOptions.end = end;
        }

        if (pageNum) {
          userOptions.page = pageNum;
        }

        if (pageSize) {
          userOptions.number = pageSize;
        }

        return userOptions;
      }
    }
  };

  return commandMock;
}

describe('logs', () => {
  const mockServer = new MockServer(true);
  const sandbox = sinon.sandbox.create();

  const cmdLogsPath = './../../cmd/logs';

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
      it('without timestamps and paging should output logs', (cb) => {
        mockServer.logs({});

        const spyConsole = sandbox.spy(console, 'log');

        require(cmdLogsPath)(command, (err) => {
          expect(err).to.not.exist;
          expect(mockServer.isDone()).to.be.true;
          assertLogsOutput(spyConsole);
          cb();
        });
      });

      it('with valid timestamps and valid paging should output logs', (cb) => {
        const start = '2017-08-30T08:06:49.594Z';
        const end = '2017-09-02T08:06:49';
        const pageSize = 5;
        const page = 3;

        mockServer.logs({
          page,
          from: start,
          to: end,
          limit: pageSize
        });

        const spyConsole = sandbox.spy(console, 'log');
        const commandMock = buildCmdMock(start, end, page, pageSize);

        require(cmdLogsPath)(commandMock, (err) => {
          expect(err).to.not.exist;
          expect(mockServer.isDone()).to.be.true;
          assertLogsOutput(spyConsole);
          cb();
        });
      });

      it('with valid timestamps and without paging should output logs', (cb) => {
        const start = '2017-08-30T08:06:49.594Z';
        const end = '2017-09-02T08:06:49.000Z';

        mockServer.logs({
          from: start,
          to: end
        });

        const spyConsole = sandbox.spy(console, 'log');
        const commandMock = buildCmdMock(start, end);

        require(cmdLogsPath)(commandMock, (err) => {
          expect(err).to.not.exist;
          expect(mockServer.isDone()).to.be.true;
          assertLogsOutput(spyConsole);
          cb();
        });
      });

      it('with valid timestamps and invalid paging should return error', (cb) => {
        const start = '2017-08-30T08:06:49.594Z';
        const end = '2017-09-02T08:06:49.000Z';
        const invalidPage = -1;

        const commandMock = buildCmdMock(start, end, invalidPage);

        require(cmdLogsPath)(commandMock, (err) => {
          helper.assertions.assertError(err, { name: 'Error', message: `Logs \'page\' ${constants.LogErrorMessages.INVALID_NONZEROINT}` });
          cb();
        });
      });

      it('with valid start timestamp and nothing else should output logs', (cb) => {
        const start = '2017-08-30T08:06:49.594Z';
        mockServer.logs({ from: start });
        const commandMock = buildCmdMock(start);

        const spyConsole = sandbox.spy(console, 'log');

        require(cmdLogsPath)(commandMock, (err) => {
          expect(err).to.not.exist;
          expect(mockServer.isDone()).to.be.true;
          assertLogsOutput(spyConsole);
          cb();
        });
      });
    });

    describe('setup is invalid', () => {
      it('should return error if project is not set correctly', (cb) => {
        helper.setup.setInvalidProject((err) => {
          expect(err).to.not.exist;

          require(cmdLogsPath)(command, (err) => {
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

      require(cmdLogsPath)(command, (err) => {
        helper.assertions.assertError(err, constants.Errors.ProjectNotConfigured);
        expect(mockServer.isDone()).to.be.true;

        const expectedUser = helper.assertions.buildExpectedUser();
        helper.assertions.assertUserProjectSetup(expectedUser, null, cb);
      });
    });
  });
});
