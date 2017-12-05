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

const { AuthOptionsNames, FlexOptionsNames } = require('./../../../../lib/Constants');
const { isEmpty } = require('./../../../../lib/Utils');
const { execCmdWithAssertion, setup } = require('./../../../tests-helper');

const fixtureApp = require('./../../../fixtures/app.json');
const fixtureUser = require('./../../../fixtures/user.json');
const fixtureInternalDataLink = require('./../../../fixtures/kinvey-dlc.json');

const existentUserOne = fixtureUser.existentOne;
const tokenOne = fixtureUser.tokenOne;
const nonExistentUser = fixtureUser.nonexistent;

const baseCmd = 'flex list';

function testFlexList(profileName, optionsForCredentials, domain, domainEntityId, isVerbose, validUser, done) {
  const verbosePart = isVerbose ? '--verbose' : '';
  let cmd = `${baseCmd} ${verbosePart}`;
  if (profileName) {
    cmd = `${cmd} --${AuthOptionsNames.PROFILE} ${profileName}`;
  }

  if (!isEmpty(optionsForCredentials)) {
    cmd = `${cmd} --${AuthOptionsNames.EMAIL} ${optionsForCredentials.email} --${AuthOptionsNames.PASSWORD} ${optionsForCredentials.password}`;
  }

  const apiOptions = {};

  if (domain) {
    cmd = `${cmd} --${FlexOptionsNames.DOMAIN_TYPE} ${domain}`;
    if (domain === 'org') {
      apiOptions.domainType = 'organizations';
    }
  }

  if (domainEntityId) {
    cmd = `${cmd} --${FlexOptionsNames.DOMAIN_ID} ${domainEntityId}`;
  }

  if (!isEmpty(validUser)) {
    apiOptions.token = validUser.token;
    apiOptions.existentUser = { email: validUser.email };
  }

  const clearSetupPaths = isVerbose;
  const escapeSlashes = !isVerbose;
  execCmdWithAssertion(cmd, null, apiOptions, true, clearSetupPaths, escapeSlashes, done);
}

describe(baseCmd, () => {
  const nonExistentEntityId = '123I_DONT_EXIST';
  const validDomain = 'app';
  const validDomainEntityId = fixtureApp.id;

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
    setup.clearGlobalSetup(null, done);
  });

  describe('by specifying a profile', () => {
    const profileToUse = 'profileToGetServices';

    before((done) => {
      setup.createProfile(profileToUse, existentUserOne.email, existentUserOne.password, done);
    });

    after((done) => {
      setup.deleteProfileFromSetup(profileToUse, null, done);
    });

    it('and valid options (app and id) should succeed', (done) => {
      testFlexList(profileToUse, null, validDomain, validDomainEntityId, true, validUserForListing, done);
    });

    it('and valid options (org and id) should succeed', (done) => {
      testFlexList(profileToUse, null, 'org', validDomainEntityId, true, validUserForListing, done);
    });

    it('and invalid domain with valid id should fail', (done) => {
      testFlexList(profileToUse, null, 'invalidDomain', validDomainEntityId, false, validUserForListing, done);
    });

    describe('when valid project is set', () => {
      before((done) => {
        setup.createProjectSetup(null, done);
      });

      it('without options should succeed', (done) => {
        testFlexList(profileToUse, null, null, null, true, validUserForListing, done);
      });

      after((done) => {
        setup.clearProjectSetup(null, done);
      });
    });

    describe('when invalid project is set', () => {
      before((done) => {
        setup.createProjectSetup({ domain: 'app', domainEntityId: nonExistentEntityId }, done);
      });

      it('with valid options should succeed', (done) => {
        // project contains non-existent domainEntityId; an existent one is provided as an option and it must be used
        testFlexList(profileToUse, null, validDomain, validDomainEntityId, true, validUserForListing, done);
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
      execCmdWithAssertion(baseCmd, null, null, true, false, true, (err) => {
        expect(err).to.not.exist;
        done();
      });
    });
  });

  describe('by specifying credentials as options', () => {
    it('when valid and valid options should succeed', (done) => {
      testFlexList(null, existentUserOne, validDomain, validDomainEntityId, true, validUserForListing, done);
    });

    it('when valid and non-existent id as option should fail', (done) => {
      testFlexList(null, existentUserOne, validDomain, nonExistentEntityId, true, validUserForListing, done);
    });

    it('when invalid and valid options should fail', (done) => {
      testFlexList(null, nonExistentUser, validDomain, validDomainEntityId, true, validUserForListing, done);
    });
  });
});
