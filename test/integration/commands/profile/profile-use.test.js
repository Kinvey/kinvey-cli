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

const { assertions, execCmdWithAssertion, setup } = require('../../../TestsHelper');

const baseCmd = 'profile use';

function testProfileUse(profilesCount, chooseExistent, done) {
  const profileNames = [];
  for (let i = 0; i < profilesCount; i += 1) {
    profileNames.push(`testProfileUse${i}`);
  }

  const activeProfileName = chooseExistent ? profileNames[0] : 'nonExistentProfile';

  async.series([
    function createSeveral(next) {
      setup.createProfiles(profileNames, next);
    },
    function setActiveProfile(next) {
      const cmd = `${baseCmd} ${activeProfileName} --verbose`;
      execCmdWithAssertion(cmd, null, null, true, true, false, next);
    },
    function verifyGlobalSetupContainsActive(next) {
      const profiles = [];
      profileNames.forEach((x) => {
        profiles.push(assertions.buildExpectedProfile(x));
      });
      const expectedProfiles = assertions.buildExpectedProfiles(profiles);
      const expectedActiveItems = chooseExistent ? assertions.buildExpectedActiveItems(activeProfileName) : {};
      const expectedGlobalSetup = assertions.buildExpectedGlobalSetup(expectedActiveItems, expectedProfiles);

      assertions.assertGlobalSetup(expectedGlobalSetup, null, next);
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

  it('with existent name when several should succeed', (done) => {
    testProfileUse(3, true, done);
  });

  it('with existent name when one should succeed', (done) => {
    testProfileUse(1, true, done);
  });

  it('with non-existent name when several should not set as active', (done) => {
    testProfileUse(2, false, done);
  });

  it('with non-existent name when none should not throw', (done) => {
    testProfileUse(0, false, done);
  });
});
