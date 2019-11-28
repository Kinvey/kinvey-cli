/**
 * Copyright (c) 2018, Kinvey, Inc. All rights reserved.
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

const { CommonOptionsNames, OutputFormat } = require('./../../../../lib/Constants');
const { writeJSON } = require('./../../../../lib/Utils');
const testsConfig = require('../../../TestsConfig');
const { assertions, execCmdWithAssertion, setup } = require('../../../TestsHelper');

const baseCmd = 'profile delete';

describe('profile delete', () => {
  const defaultProfileName = 'testProfileDelete';

  before((done) => {
    setup.clearGlobalSetup(null, done);
  });

  beforeEach((done) => {
    setup.createProfiles(defaultProfileName, done);
  });

  afterEach((done) => {
    setup.clearGlobalSetup(null, done);
  });

  it('by existent name when there is only one should succeed', (done) => {
    const cmd = `${baseCmd} ${defaultProfileName} --${CommonOptionsNames.VERBOSE} --${CommonOptionsNames.OUTPUT} ${OutputFormat.JSON}`;

    execCmdWithAssertion(cmd, null, null, true, true, false, null, (err) => {
      expect(err).to.not.exist;

      assertions.assertGlobalSetup(null, null, (err) => {
        expect(err).to.not.exist;
        done();
      });
    });
  });

  it('by existent name when it is the active profile should succeed and clear active', (done) => {
    const profileToBeDeleted = 'activeAndMustBeDeleted';

    async.series([
      function setAsActive(next) {
        setup.setActiveProfile(profileToBeDeleted, true, next);
      },
      function deleteProfile(next) {
        const cmd = `${baseCmd} ${profileToBeDeleted} --verbose`;

        execCmdWithAssertion(cmd, null, null, true, true, false, null, (err) => {
          expect(err).to.not.exist;

          const expectedProfile = assertions.buildExpectedProfile(defaultProfileName);
          const expectedGlobalSetup = assertions.buildExpectedGlobalSetup({}, assertions.buildExpectedProfiles(expectedProfile));

          assertions.assertGlobalSetup(expectedGlobalSetup, null, (err) => {
            expect(err).to.not.exist;
            next();
          });
        });
      }
    ], done);
  });

  it('by existent name when there are several should delete only one', (done) => {
    const otherProfileNames = ['November', 'December', 'January'];

    async.series([
      function createSeveralProfiles(next) {
        setup.createProfiles(otherProfileNames, next);
      },
      function deleteOneProfile(next) {
        const cmd = `${baseCmd} ${defaultProfileName} --verbose`;

        execCmdWithAssertion(cmd, null, null, true, true, false, null, (err) => {
          expect(err).to.not.exist;

          const profiles = [];
          otherProfileNames.forEach((x) => {
            profiles.push(assertions.buildExpectedProfile(x));
          });

          const expectedProfiles = assertions.buildExpectedProfiles(profiles);
          const expectedGlobalSetup = assertions.buildExpectedGlobalSetup({}, expectedProfiles);

          assertions.assertGlobalSetup(expectedGlobalSetup, null, (err) => {
            expect(err).to.not.exist;
            next();
          });
        });
      }
    ], done);
  });

  it('by non-existent name when there is one should not alter it', (done) => {
    const cmd = `${baseCmd} nonExistentProfileName --verbose`;

    execCmdWithAssertion(cmd, null, null, true, true, false, null, (err) => {
      expect(err).to.not.exist;

      const expectedProfile = assertions.buildExpectedProfile(defaultProfileName);
      const expectedGlobalSetup = assertions.buildExpectedGlobalSetup({}, assertions.buildExpectedProfiles(expectedProfile));

      assertions.assertGlobalSetup(expectedGlobalSetup, null, (err) => {
        expect(err).to.not.exist;
        done();
      });
    });
  });

  it('by non-existent name when none should return error', (done) => {
    async.series([
      function clearProfiles(next) {
        const globalSetup = {
          active: {},
          profiles: {}
        };

        writeJSON({ file: testsConfig.paths.session, data: globalSetup }, next);
      },
      function deleteProfile(next) {
        const cmd = `${baseCmd} nonExistentProfileName --verbose`;
        execCmdWithAssertion(cmd, null, null, true, true, false, null, (err) => {
          expect(err).to.not.exist;

          assertions.assertGlobalSetup(null, null, (err) => {
            expect(err).to.not.exist;
            next();
          });
        });
      }
    ], done);
  });

  it('without a name when no active should fail', (done) => {
    const cmd = `${baseCmd} --verbose`;

    execCmdWithAssertion(cmd, null, null, true, false, true, null, (err) => {
      expect(err).to.not.exist;

      const expectedProfile = assertions.buildExpectedProfile(defaultProfileName);
      const expectedGlobalSetup = assertions.buildExpectedGlobalSetup({}, assertions.buildExpectedProfiles(expectedProfile));

      assertions.assertGlobalSetup(expectedGlobalSetup, null, (err) => {
        expect(err).to.not.exist;
        done();
      });
    });
  });

  it('without a name when active is set should succeed and clear active', (done) => {
    const profileToBeDeleted = 'activeAndMustBeDeleted';

    async.series([
      function setAsActive(next) {
        setup.setActiveProfile(profileToBeDeleted, true, next);
      },
      function deleteProfile(next) {
        const cmd = `${baseCmd} --verbose`;

        execCmdWithAssertion(cmd, null, null, true, true, false, null, (err) => {
          expect(err).to.not.exist;

          const expectedProfile = assertions.buildExpectedProfile(defaultProfileName);
          const expectedGlobalSetup = assertions.buildExpectedGlobalSetup({}, assertions.buildExpectedProfiles(expectedProfile));

          assertions.assertGlobalSetup(expectedGlobalSetup, null, (err) => {
            expect(err).to.not.exist;
            next();
          });
        });
      }
    ], done);
  });
});
