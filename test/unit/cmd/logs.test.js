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
const command = require('./../../fixtures/command.js');
const service = require('./../../../lib/service.js');
const logs = require('./../../../cmd/logs.js');
const pkg = require('./../../../package.json');
const project = require('./../../../lib/project.js');
const user = require('./../../../lib/user.js');
const helper = require('./../../helper');
const LogErrorMessages = require('./../../../lib/constants').LogErrorMessages;

describe(`./${pkg.name} logs`, () => {
  const sandbox = sinon.sandbox.create();

  before('setupStubs', () => {
    sandbox.stub(user, 'setup').callsArg(1);
    sandbox.stub(project, 'restore').callsArg(0);
    sandbox.stub(service, 'logs').callsArg(4);
  });

  afterEach('resetStubs', () => {
    sandbox.reset();
  });

  afterEach('clearOptions', () => {
    command.clearOptions();
  });

  after('cleanupStubs', () => {
    sandbox.restore();
  });

  after('generalCleanup', (cb) => {
    helper.setup.performGeneralCleanup(cb);
  });

  it('should setup the user.', (cb) => {
    logs(command, (err) => {
      expect(user.setup).to.be.calledOnce;
      cb(err);
    });
  });

  it('should restore the project.', (cb) => {
    logs(command, (err) => {
      expect(project.restore).to.be.calledOnce;
      cb(err);
    });
  });

  it('should retrieve log entries based on query', (cb) => {
    logs(command, (err) => {
      expect(service.logs).to.be.calledOnce;
      cb(err);
    });
  });

  it('should fail with an invalid \'start\' timestamp', (done) => {
    command.addOption('start', 'abc');
    logs(command, (err) => {
      expect(err).to.exist;
      expect(err.message).to.contain(LogErrorMessages.INVALID_TIMESTAMP);
      done();
    });
  });

  it('should fail with an invalid \'end\' timestamp', (done) => {
    command.addOption('end', 'abc');
    logs(command, (err) => {
      expect(err).to.exist;
      expect(err.message).to.contain(LogErrorMessages.INVALID_TIMESTAMP);
      done();
    });
  });

  it('should fail with an invalid \'page\' param', (done) => {
    command.addOption('page', 'abc');
    logs(command, (err) => {
      expect(err).to.exist;
      expect(err.message).to.contain(LogErrorMessages.INVALID_NONZEROINT);
      done();
    });
  });

  it('should fail with an invalid \'number\' param', (done) => {
    command.addOption('number', 'abc');
    logs(command, (err) => {
      expect(err).to.exist;
      expect(err.message).to.contain(LogErrorMessages.INVALID_NONZEROINT);
      done();
    });
  });
});
