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

const { CommonOptionsNames, FlexOptionsNames, OutputFormat } = require('./../../../../lib/Constants');
const { isEmpty } = require('./../../../../lib/Utils');
const { buildCmd, buildOptions, execCmdWithAssertion, setup } = require('../../../TestsHelper');

const fixtureUser = require('./../../../fixtures/user.json');
const fixtureInternalDataLink = require('./../../../fixtures/kinvey-dlc.json');

const existentUserOne = fixtureUser.existentOne;
const tokenOne = fixtureUser.tokenOne;
const nonExistentUser = fixtureUser.nonexistent;
const defaultServiceId = fixtureInternalDataLink.id;

const baseCmd = 'flex status';
// this value depends on the requestedAt date in mockServer.js and is different for different timezones, so it is checked and removed from the output
const requestedAtDateRegex = /(Monday|Sunday),\sNovember\s\dth\s2017, \d{1,2}:\d2:31 [P|A]M/;
const replacementObject = {
  oldValue: requestedAtDateRegex,
  newValue: 'replaced_value'
};

function testFlexStatus(profileName, options, useServiceId, serviceId, validUser, replacementObject, done) {
  const allOptions = buildOptions(profileName, options);
  if (useServiceId) {
    const id = serviceId || defaultServiceId;
    allOptions[FlexOptionsNames.SERVICE_ID] = id;
  }

  const apiOptions = {};
  if (!isEmpty(validUser)) {
    apiOptions.token = validUser.token;
    apiOptions.existentUser = { email: validUser.email };
  }

  const cmd = buildCmd(baseCmd, null, allOptions, [CommonOptionsNames.VERBOSE]);
  execCmdWithAssertion(cmd, null, apiOptions, true, true, false, replacementObject, done);
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
    setup.clearAllSetup(done);
  });

  describe('by specifying a profile', () => {
    const profileToUse = 'profileToGetServiceStatus';

    before((done) => {
      setup.createProfile(profileToUse, existentUserOne.email, existentUserOne.password, done);
    });

    after((done) => {
      setup.deleteProfileFromSetup(profileToUse, null, done);
    });

    it('and existent serviceId should succeed and output default format', (done) => {
      testFlexStatus(profileToUse, null, true, null, validUserForGettingStatus, replacementObject, done);
    });

    it('and existent serviceId should succeed and output JSON', (done) => {
      testFlexStatus(profileToUse, { [CommonOptionsNames.OUTPUT]: OutputFormat.JSON }, true, null, validUserForGettingStatus, null, done);
    });

    it('and non-existent serviceId should fail', (done) => {
      testFlexStatus(profileToUse, null, true, nonExistentServiceId, validUserForGettingStatus, null, done);
    });

    describe('when valid project is set', () => {
      before((done) => {
        setup.createProjectSetup(profileToUse, null, done);
      });

      it('without serviceId as an option should succeed', (done) => {
        testFlexStatus(profileToUse, null, false, null, validUserForGettingStatus, replacementObject, done);
      });

      after((done) => {
        setup.clearProjectSetup(null, done);
      });
    });

    describe('when invalid project is set', () => {
      before((done) => {
        setup.createProjectSetup(profileToUse, { serviceId: nonExistentServiceId }, done);
      });

      it('with existent serviceId as an option should succeed', (done) => {
        // project contains non-existent serviceId; an existent one is provided as an option and it must be used
        testFlexStatus(profileToUse, null, true, null, validUserForGettingStatus, replacementObject, done);
      });

      after((done) => {
        setup.clearProjectSetup(null, done);
      });
    });
  });

  describe('by not specifying profile nor credentials', () => {
    it('when one profile and existent serviceId should succeed', (done) => {
      testFlexStatus(null, null, true, null, null, replacementObject, done);
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
      const cmd = `${baseCmd} --${FlexOptionsNames.SERVICE_ID} ${defaultServiceId}`;
      execCmdWithAssertion(cmd, null, null, true, false, true, null, (err) => {
        expect(err).to.not.exist;
        done();
      });
    });
  });

  describe('by specifying credentials as options', () => {
    it('when valid and existent serviceId should succeed', (done) => {
      testFlexStatus(null, existentUserOne, true, null, validUserForGettingStatus, replacementObject, done);
    });

    it('when valid and non-existent serviceId should fail', (done) => {
      testFlexStatus(null, existentUserOne, true, nonExistentServiceId, validUserForGettingStatus, null, done);
    });

    it('when invalid and existent serviceId should fail', (done) => {
      testFlexStatus(null, nonExistentUser, true, null, validUserForGettingStatus, null, done);
    });
  });
});
