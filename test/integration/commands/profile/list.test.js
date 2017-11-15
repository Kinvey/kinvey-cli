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

const async = require('async');

const { execCmdWithAssertion, setup } = require('./../../../tests-helper');

const baseCmd = 'profile list';

function testProfileList(profilesCount, done) {
  const profileNames = [];
  for (let i = 0; i < profilesCount; i+=1) {
    profileNames.push(`testProfileList${i}`);
  }

  async.series([
    function createSeveral(next) {
      setup.createProfiles(profileNames, next);
    },
    function listProfiles(next) {
      const cmd = `${baseCmd} --verbose`;
      execCmdWithAssertion(cmd, null, null, true, true, false, next);
    }
  ], done);
}

describe(baseCmd, () => {
  before((done) => {
    setup.clearGlobalSetup(null, done);
  });

  afterEach((done) => {
    setup.clearGlobalSetup(null, done);
  });

  it('when several should succeed', (done) => {
    testProfileList(3, done);
  });

  it('when one should succeed', (done) => {
    testProfileList(1, done);
  });

  it('when none should succeed', (done) => {
    const cmd = `${baseCmd} --verbose`;
    execCmdWithAssertion(cmd, null, null, true, true, false, done);
  });
});
