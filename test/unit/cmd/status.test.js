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
const logger = require('./../../../lib/logger.js');
const pkg = require('./../../../package.json');
const project = require('./../../../lib/project.js');
const status = require('./../../../cmd/status.js');
const user = require('./../../../lib/user.js');
const helper = require('./../../helper');

describe(`./${pkg.name} status`, () => {
  const sandbox = sinon.sandbox.create();

  before('configure', () => {
    project.app = project.service = '123';
    project.schemaVersion = 1;
  });

  after('generalCleanup', (cb) => {
    helper.setup.performGeneralCleanup(cb);
  });

  before('setupStubs', () => {
    sandbox.stub(user, 'setup').callsArg(1);
    sandbox.stub(project, 'restore').callsArg(0);
    sandbox.stub(service, 'serviceStatus').callsArg(0);
  });

  afterEach('resetStubs', () => {
    sandbox.reset();
  });

  after('cleanupStubs', () => {
    sandbox.restore();
  });

  it('should setup the user.', (cb) => {
    status.call(command, command, (err) => {
      expect(user.setup).to.be.calledOnce;
      cb(err);
    });
  });

  it('should restore the project.', (cb) => {
    status.call(command, command, (err) => {
      expect(project.restore).to.be.calledOnce;
      cb(err);
    });
  });

  it('should print the current KMR service status.', (cb) => {
    status.call(command, command, (err) => {
      expect(service.serviceStatus).to.be.calledOnce;
      cb(err);
    });
  });
});
