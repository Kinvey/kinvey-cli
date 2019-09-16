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
const deepCopy = require('lodash.clonedeep');

const { ActiveItemType, AppOptionsName, AuthOptionsNames, CommonOptionsNames, DomainTypes, FlexOptionsNames, Namespace } = require('./../../../../lib/Constants');
const { assertions, buildCmd, execCmdWithAssertion, setup, testers } = require('../../../TestsHelper');
const fixtureApp = require('./../../../fixtures/app.json');
const fixtureUser = require('./../../../fixtures/user.json');
const fixtureService = require('./../../../fixtures/internal-flex-service.json');

const baseCmd = 'flex delete';

function testServiceDelete(originalOptions, flags, serviceId, expectedProjectConfig, done) {
  const options = originalOptions || {};
  if (serviceId) {
    options[FlexOptionsNames.SERVICE_ID] = serviceId;
  }
  testers.execCmdWithIdentifier(baseCmd, options, flags, null, null, (err) => {
    expect(err).to.not.exist;
    assertions.assertProjectSetup(expectedProjectConfig, null, done);
  });
}

describe(baseCmd, () => {
  const jsonOptions = testers.getJsonOptions();
  const defaultFlagsPlusNoPrompt = testers.getDefaultFlags();
  defaultFlagsPlusNoPrompt.push(CommonOptionsNames.NO_PROMPT);

  before((done) => {
    setup.clearAllSetup(done);
  });

  after((done) => {
    setup.clearAllSetup(done);
  });

  describe('when active profile is set and project config is set', () => {
    const activeProfile = 'activeProfile';
    const nonActiveProfile = 'nonActiveProfile';
    const allProfiles = [activeProfile, nonActiveProfile];
    const projectConfig = assertions.buildExpectedProject(DomainTypes.APP, fixtureApp.id, fixtureService.id, fixtureService.name);
    const fullConfig = Object.assign({}, {
      activeProfile: { flex: deepCopy(projectConfig) },
      nonActiveProfile: { flex: deepCopy(projectConfig) }
    });

    beforeEach((done) => {
      async.series([
        (next) => {
          setup.createProfiles(allProfiles, next);
        },
        (next) => {
          setup.setActiveProfile(activeProfile, false, next);
        },
        (next) => {
          async.eachSeries(
            allProfiles,
            (profile, cb) => {
              setup.createProjectSetup(profile, projectConfig, cb);
            },
            next
          );
        }
      ], done);
    });

    afterEach((done) => {
      setup.clearAllSetup(done);
    });

    it('without explicit profile and serviceId should succeed', (done) => {
      const expectedConfig = deepCopy(fullConfig);
      delete expectedConfig.activeProfile.flex.serviceId;
      delete expectedConfig.activeProfile.flex.serviceName;
      testServiceDelete(null, defaultFlagsPlusNoPrompt, null, expectedConfig, done);
    });

    it('with explicit profile and without serviceId should succeed', (done) => {
      const expectedConfig = deepCopy(fullConfig);
      delete expectedConfig.nonActiveProfile.flex.serviceId;
      delete expectedConfig.nonActiveProfile.flex.serviceName;
      const options = Object.assign({}, jsonOptions, { [AuthOptionsNames.PROFILE]: nonActiveProfile });
      testServiceDelete(options, defaultFlagsPlusNoPrompt, null, expectedConfig, done);
    });

    it('without explicit profile and with non-existent serviceId should fail', (done) => {
      const nonExistentServiceId = '124';
      testServiceDelete(null, defaultFlagsPlusNoPrompt, nonExistentServiceId, fullConfig, done);
    });

    it('when one-time session and existent serviceId should succeed', (done) => {
      const serviceId = fixtureService.id;
      const options = {
        [AuthOptionsNames.EMAIL]: fixtureUser.existent.email,
        [AuthOptionsNames.PASSWORD]: fixtureUser.existent.password
      };
      // project config should not be altered if one-time session
      testServiceDelete(options, defaultFlagsPlusNoPrompt, serviceId, fullConfig, done);
    });
  });

  describe('when profiles nor project config are set', () => {
    it('when one-time session and existent serviceId should succeed', (done) => {
      const serviceId = fixtureService.id;
      const options = {
        [AuthOptionsNames.EMAIL]: fixtureUser.existent.email,
        [AuthOptionsNames.PASSWORD]: fixtureUser.existent.password
      };

      testServiceDelete(options, defaultFlagsPlusNoPrompt, serviceId, null, done);
    });
  });
});
