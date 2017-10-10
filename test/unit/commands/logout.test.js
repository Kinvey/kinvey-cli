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
const logout = require('../../../lib/commands/flex/logout.js').handler;
const pkg = require('./../../../package.json');
const project = require('./../../../lib/project.js');
const user = require('./../../../lib/user.js');
const helper = require('../../tests-helper');

describe(`./${pkg.name} logout`, () => {
  const sandbox = sinon.sandbox.create();

  before('setupStubs', () => {
    sandbox.stub(user, 'logout').callsArg(0);
    sandbox.stub(project, 'logout').callsArg(0);
  });

  afterEach('resetStubs', () => {
    sandbox.reset();
  });

  after('user', () => {
    sandbox.restore();
  });

  after('generalCleanup', (cb) => {
    helper.setup.performGeneralCleanup(cb);
  });

  it('should logout the user.', (cb) => {
    logout({}, (err) => {
      expect(user.logout).to.be.calledOnce;
      cb(err);
    });
  });

  it('should logout the project.', (cb) => {
    logout({}, (err) => {
      expect(project.logout).to.be.calledOnce;
      cb(err);
    });
  });
});
