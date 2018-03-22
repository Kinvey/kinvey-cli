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

const { ActiveItemType, AuthOptionsNames } = require('./../../../../lib/Constants');
const { assertions, buildCmd, execCmdWithAssertion, setup, testers } = require('../../../TestsHelper');

const fixtureOrg = require('./../../../fixtures/org.json');
const fixtureUser = require('./../../../fixtures/user.json');

const existentUserOne = fixtureUser.existentOne;
const tokenOne = fixtureUser.tokenOne;

const baseCmd = 'org use';
const baseProfile = 'orgProfile0';

function testOrgUse(options, flags, orgIdentifier, expectedActiveItems, validUser, done) {
  const profileToCheck = (options && options[AuthOptionsNames.PROFILE]) || baseProfile;
  testers.execCmdWithIdentifierAndActiveCheck(baseCmd, options, flags, orgIdentifier, expectedActiveItems, profileToCheck, validUser, done);
}

describe(baseCmd, () => {
  const validUser = {
    email: existentUserOne.email,
    token: tokenOne
  };
  const expectedActive = { [ActiveItemType.ORG]: { id: fixtureOrg.id } };
  const jsonOptions = testers.getJsonOptions();
  const defaultFlags = testers.getDefaultFlags();

  before((done) => {
    async.series([
      (next) => {
        setup.clearGlobalSetup(null, next);
      },
      (next) => {
        setup.createProfiles(baseProfile, next);
      }
    ], done);
  });

  after((done) => {
    setup.clearGlobalSetup(null, done);
  });

  describe('by not specifying a profile when one should use it', () => {
    afterEach((done) => {
      setup.clearActiveItemsOnProfile(baseProfile, null, done);
    });

    it('with existent org id should succeed and output default format', (done) => {
      testOrgUse(null, defaultFlags, fixtureOrg.id, expectedActive, null, done);
    });

    it('with existent org id should succeed and output JSON', (done) => {
      testOrgUse(jsonOptions, defaultFlags, fixtureOrg.id, expectedActive, null, done);
    });

    it('with existent org name should succeed', (done) => {
      testOrgUse(null, defaultFlags, `"${fixtureOrg.name}"`, expectedActive, null, done);
    });

    it('with non-existent org name should return error', (done) => {
      testOrgUse(null, defaultFlags, 'noSuchName', null, null, done);
    });
  });

  describe('by specifying a profile', () => {
    const profileToUse = 'profileToBeUsed';
    const options = { [AuthOptionsNames.PROFILE]: profileToUse };

    before((done) => {
      setup.createProfile(profileToUse, existentUserOne.email, existentUserOne.password, done);
    });

    after((done) => {
      setup.deleteProfileFromSetup(profileToUse, null, done);
    });

    it('should use it and succeed', (done) => {
      testOrgUse(options, defaultFlags, fixtureOrg.id, expectedActive, validUser, done);
    });

    describe('when active is set', () => {
      const activeProfile = 'activeProfile';

      before((done) => {
        setup.setActiveProfile(activeProfile, true, done);
      });

      after((done) => {
        setup.deleteProfileFromSetup(activeProfile, null, done);
      });

      it('and no profile option should use active and succeed', (done) => {
        const cmd = buildCmd(baseCmd, [fixtureOrg.id], null, defaultFlags);
        execCmdWithAssertion(cmd, null, null, true, true, false, null, (err) => {
          expect(err).to.not.exist;
          assertions.assertActiveItemsOnProfile(expectedActive, activeProfile, null, done);
        });
      });

      it('and profile specified should use specified and succeed', (done) => {
        testOrgUse(options, defaultFlags, fixtureOrg.id, expectedActive, validUser, done);
      });

      it('with credentials as options should fail and output default format', (done) => {
        const credentials = {
          [AuthOptionsNames.EMAIL]: existentUserOne.email,
          [AuthOptionsNames.PASSWORD]: existentUserOne.password
        };
        const cmd = buildCmd(baseCmd, [fixtureOrg.id], credentials, defaultFlags);
        execCmdWithAssertion(cmd, null, null, true, true, false, null, (err) => {
          expect(err).to.not.exist;
          done();
        });
      });
    });
  });
});
