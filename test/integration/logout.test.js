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

const command = require('./../fixtures/command.js');
const MockServer = require('./../mock-server');
const helper = require('../tests-helper');


describe('logout', () => {
  const mockServer = new MockServer(true);
  const sandbox = sinon.sandbox.create();
  const cmdLogoutPath = './../../cmd/logout';

  afterEach('generalCleanup', (cb) => {
    sandbox.reset();
    helper.setup.performGeneralCleanup(cb);
  });

  after(() => {
    sandbox.restore();
  });

  it('when a user is logged in should clear user and project', (cb) => {
    helper.setup.configureUserAndProject(sandbox, mockServer, (err) => {
      expect(err).to.not.exist;

      require(cmdLogoutPath)(command, (err) => {
        expect(err).to.not.exist;
        helper.assertions.assertUserProjectSetup(null, null, cb);
      });
    });
  });

  it('when a user is not logged in should not return error', (cb) => {
    require(cmdLogoutPath)(command, (err) => {
      expect(err).to.not.exist;
      cb();
    });
  });
});