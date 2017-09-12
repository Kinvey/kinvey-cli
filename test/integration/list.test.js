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
const fixtureInternalDataLink = require('./../fixtures/kinvey-dlc.json');
const MockServer = require('./../mock-server');
const helper = require('../tests-helper');

function assertLoggerInfoOutput(spy, serviceName, expectedServicesCount) {
  const baseMsg = 'Expected to output';
  expect(spy.calledWith('You have %s Kinvey service connectors:', chalk.cyan(expectedServicesCount)), `${baseMsg} services count`).to.be.true;

  if (serviceName) {
    const expectedServiceMarker = chalk.green('* ');
    const expectedServiceName = chalk.cyan(serviceName);
    expect(spy.calledWith('%s%s', expectedServiceMarker, expectedServiceName), 'Expected to output current service name').to.be.true;
  }

  expect(spy.calledWith('The service used in this project is marked with *'), `${baseMsg} explanation`).to.be.true;
}

describe('list', () => {
  const mockServer = new MockServer(true);
  const sandbox = sinon.sandbox.create();

  const cmdListPath = './../../cmd/list';
  const defaultExpectedServiceName = fixtureInternalDataLink.name;

  afterEach('generalCleanup', (cb) => {
    sandbox.restore();
    helper.setup.performGeneralCleanup(cb);
  });

  describe('when user and project are already set', () => {
    beforeEach('setupUserAndProject', (cb) => {
      helper.setup.configureUserAndProject(sandbox, mockServer, cb);
    });

    describe('setup is valid', () => {
      it('should output services count and current service when present', (cb) => {
        mockServer.dataLinks();

        const spyLogger = sandbox.spy(logger, 'info');

        require(cmdListPath)(command, (err) => {
          expect(err).to.not.exist;
          expect(mockServer.isDone()).to.be.true;
          assertLoggerInfoOutput(spyLogger, defaultExpectedServiceName, '1');
          cb();
        });
      });

      it('should output only services count when no services', (cb) => {
        mockServer.dataLinks([]);

        const spyLogger = sandbox.spy(logger, 'info');

        require(cmdListPath)(command, (err) => {
          expect(err).to.not.exist;
          expect(mockServer.isDone()).to.be.true;
          assertLoggerInfoOutput(spyLogger, null, '0');
          cb();
        });
      });
    });

    describe('setup is invalid', () => {
      it('should return error if project is not set correctly', (cb) => {
        helper.setup.setInvalidProject((err) => {
          expect(err).to.not.exist;

          require(cmdListPath)(command, (err) => {
            helper.assertions.assertError(err, constants.Errors.ProjectNotConfigured);
            cb();
          });
        });
      });
    });
  });
});
