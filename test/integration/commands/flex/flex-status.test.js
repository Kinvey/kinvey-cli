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

const { AuthOptionsNames, FlexOptionsNames } = require('./../../../../lib/constants');
const { isEmpty } = require('./../../../../lib/utils');
const { execCmdWithAssertion, setup } = require('./../../../tests-helper');

const fixtureUser = require('./../../../fixtures/user.json');
const fixtureInternalDataLink = require('./../../../fixtures/kinvey-dlc.json');

const existentUserOne = fixtureUser.existentOne;
const tokenOne = fixtureUser.tokenOne;
const nonExistentUser = fixtureUser.nonexistent;
const defaultServiceId = fixtureInternalDataLink.id;

const baseCmd = 'flex status';

function testFlexStatus(profileName, optionsForCredentials, useServiceId, serviceId, validUser, done) {
  let cmd = `${baseCmd} --verbose`;
  if (profileName) {
    cmd = `${cmd} --${AuthOptionsNames.PROFILE} ${profileName}`;
  }

  if (!isEmpty(optionsForCredentials)) {
    cmd = `${cmd} --${AuthOptionsNames.EMAIL} ${optionsForCredentials.email} --${AuthOptionsNames.PASSWORD} ${optionsForCredentials.password}`;
  }

  if (useServiceId) {
    const id = serviceId || defaultServiceId;
    cmd = `${cmd} --${FlexOptionsNames.SERVICE_ID} ${id}`;
  }

  const apiOptions = {};
  if (!isEmpty(validUser)) {
    apiOptions.token = validUser.token;
    apiOptions.existentUser = { email: validUser.email };
  }

  execCmdWithAssertion(cmd, null, apiOptions, true, true, false, done);
}

describe(baseCmd, () => {
  const nonExistentServiceId = 'z793f26c8I_DONT_EXIST';

  const validUserForGettingStatus = {
    email: existentUserOne.email,
    token: tokenOne
  };

  before((done) => {
    async.series([
      (next) => {
        setup.clearGlobalSetup(null, next);
      },
      (next) => {
        setup.createProfiles('flexStatusProfile', next);
      }
    ], done);
  });

  after((done) => {
    setup.clearGlobalSetup(null, done);
  });

  describe('by specifying a profile', () => {
    const profileToUse = 'profileToGetServiceStatus';

    before((done) => {
      setup.createProfile(profileToUse, existentUserOne.email, existentUserOne.password, done);
    });

    after((done) => {
      setup.deleteProfileFromSetup(profileToUse, null, done);
    });

    it('and existent serviceId should succeed', (done) => {
      testFlexStatus(profileToUse, null, true, null, validUserForGettingStatus, done);
    });

    it('and non-existent serviceId should fail', (done) => {
      testFlexStatus(profileToUse, null, true, nonExistentServiceId, validUserForGettingStatus, done);
    });

    describe('when valid project is set', () => {
      before((done) => {
        setup.createProjectSetup(null, done);
      });

      it('without serviceId as an option should succeed', (done) => {
        testFlexStatus(profileToUse, null, false, null, validUserForGettingStatus, done);
      });

      after((done) => {
        setup.clearProjectSetup(null, done);
      });
    });

    describe('when invalid project is set', () => {
      before((done) => {
        setup.createProjectSetup({ serviceId: nonExistentServiceId }, done);
      });

      it('with existent serviceId as an option should succeed', (done) => {
        // project contains non-existent serviceId; an existent one is provided as an option and it must be used
        testFlexStatus(profileToUse, null, true, null, validUserForGettingStatus, done);
      });

      after((done) => {
        setup.clearProjectSetup(null, done);
      });
    });
  });

  describe('by not specifying profile nor credentials', () => {
    it('when one profile and existent serviceId should succeed', (done) => {
      testFlexStatus(null, null, true, null, null, done);
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

    it('and existent serviceId should fail', (done) => {
      let cmd = `${baseCmd} --${FlexOptionsNames.SERVICE_ID} ${defaultServiceId}`;
      execCmdWithAssertion(cmd, null, null, true, false, true, (err) => {
        expect(err).to.not.exist;
        done();
      });
    });
  });

  describe('by specifying credentials as options', () => {
    it('when valid and existent serviceId should succeed', (done) => {
      testFlexStatus(null, existentUserOne, true, null, validUserForGettingStatus, done);
    });

    it('when valid and non-existent serviceId should fail', (done) => {
      testFlexStatus(null, existentUserOne, true, nonExistentServiceId, validUserForGettingStatus, done);
    });

    it('when invalid and existent serviceId should fail', (done) => {
      testFlexStatus(null, nonExistentUser, true, null, validUserForGettingStatus, done);
    });
  });
});
