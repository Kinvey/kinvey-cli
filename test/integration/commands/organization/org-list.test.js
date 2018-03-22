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

const { AuthOptionsNames, CommonOptionsNames, OutputFormat } = require('./../../../../lib/Constants');
const { isEmpty } = require('./../../../../lib/Utils');
const { buildCmd, execCmdWithAssertion, setup } = require('../../../TestsHelper');

const fixtureUser = require('./../../../fixtures/user.json');

const existentUserOne = fixtureUser.existentOne;
const tokenOne = fixtureUser.tokenOne;

const baseCmd = 'org list';

function testOrgList(options, flags, validUser, hasOrgs, done) {
  const apiOptions = {};
  if (!isEmpty(validUser)) {
    apiOptions.token = validUser.token;
    apiOptions.existentUser = { email: validUser.email };
  }

  if (!hasOrgs) {
    apiOptions.orgs = [];
  }

  const cmd = buildCmd(baseCmd, null, options, flags);
  execCmdWithAssertion(cmd, null, apiOptions, true, true, false, null, done);
}

describe(baseCmd, () => {
  const validUser = {
    email: existentUserOne.email,
    token: tokenOne
  };
  const jsonOptions = { [CommonOptionsNames.OUTPUT]: OutputFormat.JSON };
  const defaultFlags = [CommonOptionsNames.VERBOSE];
  const hasOrgs = true;

  before((done) => {
    async.series([
      (next) => {
        setup.clearGlobalSetup(null, next);
      },
      (next) => {
        setup.createProfiles('orgProfile0', next);
      }
    ], done);
  });

  after((done) => {
    setup.clearGlobalSetup(null, done);
  });

  describe('by not specifying a profile when one should use it', () => {
    it('when there are orgs should succeed and output default', (done) => {
      testOrgList(null, defaultFlags, null, hasOrgs, done);
    });

    it('when there are orgs should succeed and output JSON', (done) => {
      testOrgList(jsonOptions, defaultFlags, null, hasOrgs, done);
    });

    it('when no orgs should succeed and output default', (done) => {
      testOrgList(null, defaultFlags, null, false, done);
    });

    it('when no orgs should succeed and output JSON', (done) => {
      testOrgList(jsonOptions, defaultFlags, null, false, done);
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

    it('should use it and output default', (done) => {
      testOrgList(options, defaultFlags, validUser, hasOrgs, done);
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
        testOrgList(null, defaultFlags, null, hasOrgs, done);
      });

      it('and profile specified should use specified and succeed', (done) => {
        testOrgList(options, defaultFlags, validUser, hasOrgs, done);
      });
    });
  });

  describe('by specifying credentials as options', () => {
    it('when valid should succeed', (done) => {
      const options = {
        [AuthOptionsNames.EMAIL]: existentUserOne.email,
        [AuthOptionsNames.PASSWORD]: existentUserOne.password
      };
      testOrgList(options, defaultFlags, validUser, hasOrgs, done);
    });
  });
});
