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

const yargs = require('yargs');
const sinon = require('sinon');
const service = require('./../../../lib/service.js');
const logs = require('../../../lib/commands/flex/logs.js').handler;
const pkg = require('./../../../package.json');
const project = require('./../../../lib/project.js');
const user = require('./../../../lib/user.js');
const helper = require('../../tests-helper');
const LogErrorMessages = require('../../../lib/Constants').LogErrorMessages;

describe(`./${pkg.name} logs`, () => {
  const sandbox = sinon.sandbox.create();
  const argsWithoutOptions = yargs.parse('logs');

  before('setupStubs', () => {
    sandbox.stub(user, 'setup').callsArg(1);
    sandbox.stub(project, 'restore').callsArg(0);
    sandbox.stub(service, 'logs').callsArg(4);
  });

  afterEach('resetStubs', () => {
    sandbox.reset();
  });

  after('cleanupStubs', () => {
    sandbox.restore();
  });

  after('generalCleanup', (cb) => {
    helper.setup.performGeneralCleanup(cb);
  });

  it('should setup the user.', (cb) => {
    logs(argsWithoutOptions, (err) => {
      expect(user.setup).to.be.calledOnce;
      cb(err);
    });
  });

  it('should restore the project.', (cb) => {
    logs(argsWithoutOptions, (err) => {
      expect(project.restore).to.be.calledOnce;
      cb(err);
    });
  });

  it('should retrieve log entries based on query', (cb) => {
    logs(argsWithoutOptions, (err) => {
      expect(service.logs).to.be.calledOnce;
      cb(err);
    });
  });

  it('should fail with an invalid \'from\' timestamp', (done) => {
    const args = yargs.parse('--from abc');
    logs(args, (err) => {
      expect(err).to.exist;
      expect(err.message).to.contain(LogErrorMessages.INVALID_TIMESTAMP);
      done();
    });
  });

  it('should fail with an invalid \'to\' timestamp', (done) => {
    const args = yargs.parse('--to abc');
    logs(args, (err) => {
      expect(err).to.exist;
      expect(err.message).to.contain(LogErrorMessages.INVALID_TIMESTAMP);
      done();
    });
  });

  it('should fail with an invalid \'page\' flag', (done) => {
    const args = yargs.parse('--page abc');
    logs(args, (err) => {
      expect(err).to.exist;
      expect(err.message).to.contain(LogErrorMessages.INVALID_NONZEROINT);
      done();
    });
  });

  it('should fail with an invalid \'number\' flag', (done) => {
    const args = yargs.parse('--number abc');
    logs(args, (err) => {
      expect(err).to.exist;
      expect(err.message).to.contain(LogErrorMessages.INVALID_NONZEROINT);
      done();
    });
  });

  it('should fail with deprecated params included', (done) => {
    const args = yargs.parse('logs from 2016 to 2017');
    logs(args, (err) => {
      expect(err).to.exist;
      expect(err.message).to.contain('params have been converted to options');
      done();
    });
  });
});
