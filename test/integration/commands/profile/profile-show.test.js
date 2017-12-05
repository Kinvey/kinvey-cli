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

const baseCmd = 'profile show';

function testProfileShow(profilesCount, chooseExistent, useName, done) {
  const profileNames = [];
  for (let i = 0; i < profilesCount; i += 1) {
    profileNames.push(`testProfileShow${i}`);
  }

  const chosenProfile = chooseExistent ? profileNames[0] : 'nonExistentProfile';

  async.series([
    function createSeveral(next) {
      setup.createProfiles(profileNames, next);
    },
    function showProfile(next) {
      const nameParam = useName ? chosenProfile : '';
      const cmd = `${baseCmd} ${nameParam} --verbose`;
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

  describe('with name parameter', () => {
    it('with existent name when several should succeed', (done) => {
      testProfileShow(3, true, true, done);
    });

    it('with existent name when one should succeed', (done) => {
      testProfileShow(1, true, true, done);
    });

    it('with non-existent name when several should not throw', (done) => {
      testProfileShow(2, false, true, done);
    });

    it('with non-existent name when none should not throw', (done) => {
      testProfileShow(0, false, true, done);
    });

    it('with existent name when active profile is set should succeed', (done) => {
      const activeProfile = 20;
      const profileToShow = '1%!@_';
      const profiles = ['testProfileShow', activeProfile, profileToShow];

      async.series([
        function createSeveral(next) {
          setup.createProfiles(profiles, next);
        },
        function setOneAsActive(next) {
          setup.setActiveProfile(activeProfile, false, next);
        },
        function showProfileDifferentThanActive(next) {
          const cmd = `${baseCmd} ${profileToShow} --verbose`;
          execCmdWithAssertion(cmd, null, null, true, true, false, next);
        }
      ], done);
    });
  });

  describe('without name parameter', () => {
    it('when active profile is set should succeed', (done) => {
      const activeProfile = 20;
      const profiles = ['testProfileShow', activeProfile, '1%!@_'];

      async.series([
        function createSeveral(next) {
          setup.createProfiles(profiles, next);
        },
        function setOneAsActive(next) {
          setup.setActiveProfile(activeProfile, false, next);
        },
        function showActive(next) {
          const cmd = `${baseCmd} --verbose`;
          execCmdWithAssertion(cmd, null, null, true, true, false, next);
        }
      ], done);
    });

    it('when active profile is not set should not throw', (done) => {
      testProfileShow(2, false, false, done);
    });

    it('when active profile is not set and only one profile should not succeed', (done) => {
      testProfileShow(1, false, false, done);
    });
  });
});
