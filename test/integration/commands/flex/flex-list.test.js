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

const { CommonOptionsNames, OrgOptionsName, OutputFormat } = require('./../../../../lib/Constants');
const { isEmpty } = require('./../../../../lib/Utils');
const { buildCmd, buildOptions, execCmdWithAssertion, setup } = require('../../../TestsHelper');

const fixtureApp = require('./../../../fixtures/app.json');
const fixtureOrg = require('./../../../fixtures/org.json');
const fixtureUser = require('./../../../fixtures/user.json');

const existentUserOne = fixtureUser.existentOne;
const tokenOne = fixtureUser.tokenOne;
const nonExistentUser = fixtureUser.nonexistent;

const baseCmd = 'flex list';

function testFlexList(profileName, optionsForCredentials, domain, domainEntityId, isVerbose, validUser, otherOptions, done) {
  const options = buildOptions(profileName, optionsForCredentials, otherOptions);

  const apiOptions = {};

  if (domain) {
    if (domain === 'org') {
      apiOptions.domainType = 'organizationId';
    }

    if (domain === 'app') {
      apiOptions.domainType = 'appId';
    }
  }

  if (domainEntityId) {
    apiOptions.domainEntityId = domainEntityId;
    options[OrgOptionsName.ORG] = domainEntityId;
  }

  if (!isEmpty(validUser)) {
    apiOptions.token = validUser.token;
    apiOptions.existentUser = { email: validUser.email };
  }

  const clearSetupPaths = isVerbose;
  const escapeSlashes = !isVerbose;
  const flags = isVerbose ? [CommonOptionsNames.VERBOSE] : null;
  const positionalArgs = null;
  const cmd = buildCmd(baseCmd, positionalArgs, options, flags);
  execCmdWithAssertion(cmd, null, apiOptions, true, clearSetupPaths, escapeSlashes, null, done);
}

describe(baseCmd, () => {
  const nonExistentEntityId = '123I_DONT_EXIST';
  const validOrgId = fixtureOrg.id;

  const validUserForListing = {
    email: existentUserOne.email,
    token: tokenOne
  };

  before((done) => {
    async.series([
      (next) => {
        setup.clearGlobalSetup(null, next);
      },
      (next) => {
        setup.createProfiles('flexListProfile', next);
      }
    ], done);
  });

  after((done) => {
    setup.clearAllSetup(done);
  });

  describe('by specifying a profile', () => {
    const profileToUse = 'profileToGetServices';

    before((done) => {
      setup.createProfile(profileToUse, existentUserOne.email, existentUserOne.password, done);
    });

    after((done) => {
      setup.deleteProfileFromSetup(profileToUse, null, done);
    });

    it('and valid options (org and id) should succeed  and output default format', (done) => {
      testFlexList(profileToUse, null, 'org', validOrgId, true, validUserForListing, null, done);
    });

    it('and valid options (org and id) should succeed and output JSON', (done) => {
      testFlexList(profileToUse, null, 'org', validOrgId, true, validUserForListing, { [CommonOptionsNames.OUTPUT]: OutputFormat.JSON }, done);
    });

    describe('when valid project is set', () => {
      before((done) => {
        setup.createProjectSetup(profileToUse, null, done);
      });

      it('without options should succeed', (done) => {
        const options = buildOptions(profileToUse);
        const cmd = buildCmd(baseCmd, null, options, [[CommonOptionsNames.VERBOSE]]);
        const apiOptions = {
          token: validUserForListing.token,
          existentUser: { email: validUserForListing.email },
          domainType: 'organizationId',
          domainEntityId: fixtureOrg.id
        };
        execCmdWithAssertion(cmd, null, apiOptions, true, true, true, null, (err) => {
          expect(err).to.not.exist;
          done();
        });
      });

      after((done) => {
        setup.clearProjectSetup(null, done);
      });
    });

    describe('when invalid project is set', () => {
      before((done) => {
        setup.createProjectSetup(profileToUse, { domain: 'org', domainEntityId: nonExistentEntityId }, done);
      });

      it('with valid options should succeed', (done) => {
        // project contains non-existent domainEntityId; an existent one is provided as an option and it must be used
        testFlexList(profileToUse, null, 'org', validOrgId, true, validUserForListing, null, done);
      });

      after((done) => {
        setup.clearProjectSetup(null, done);
      });
    });
  });

  describe('by not specifying profile nor credentials when several profiles', () => {
    const oneMoreProfile = 'oneMoreProfile';
    before((done) => {
      setup.createProfile(oneMoreProfile, existentUserOne.email, existentUserOne.password, done);
    });

    after((done) => {
      setup.deleteProfileFromSetup(oneMoreProfile, null, done);
    });

    it('should fail', (done) => {
      execCmdWithAssertion(baseCmd, null, null, true, false, true, null, (err) => {
        expect(err).to.not.exist;
        done();
      });
    });
  });

  describe('by specifying credentials as options', () => {
    it('when valid and valid options should succeed', (done) => {
      testFlexList(null, existentUserOne, 'org', validOrgId, true, validUserForListing, null, done);
    });

    it('when valid and non-existent id as option should fail', (done) => {
      testFlexList(null, existentUserOne, 'org', nonExistentEntityId, true, validUserForListing, null, done);
    });

    it('when invalid and valid options should fail', (done) => {
      testFlexList(null, nonExistentUser, 'org', validOrgId, true, validUserForListing, null, done);
    });
  });
});
