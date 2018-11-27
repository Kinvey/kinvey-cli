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

const { FlexOptionsNames, Namespace } = require('./../../../../lib/Constants');
const fixtureServices = require('./../../../fixtures/datalinks.json');
const fixtureSvcEnvsSeveral = require('./../../../fixtures/svc-envs-several.json');
const { buildCmd, execCmdWithAssertion, setup, testers } = require('../../../TestsHelper');

const baseCmd = `${Namespace.FLEX} show`;
const defaultFlags = testers.getDefaultFlags();

function testFlexShow(options, flags, apiOptions, done) {
  const cmd = buildCmd(baseCmd, null, options, flags);
  execCmdWithAssertion(cmd, null, apiOptions, true, true, false, null, done);
}

describe(baseCmd, () => {
  const profileToUse = 'activeProfile';

  before((done) => {
    setup.clearGlobalSetup(null, done);
  });

  after((done) => {
    setup.clearGlobalSetup(null, done);
  });

  describe('using active profile', () => {
    before('set up active profile', (done) => {
      setup.setActiveProfile(profileToUse, true, done);
    });

    after((done) => {
      setup.clearGlobalSetup(null, done);
    });

    describe('when valid project is set', () => {
      before((done) => {
        setup.createProjectSetup(profileToUse, null, done);
      });

      after((done) => {
        setup.clearProjectSetup(null, done);
      });

      it('without service and svc env as options should succeed', (done) => {
        testFlexShow(null, defaultFlags, null, done);
      });

      it('with service and svc env as options should succeed', (done) => {
        const options = {
          [FlexOptionsNames.SERVICE_ID]: fixtureServices[fixtureServices.length - 1].id,
          [FlexOptionsNames.SVC_ENV]: 'stg4'
        };
        testFlexShow(options, defaultFlags, { svcEnvs: fixtureSvcEnvsSeveral }, done);
      });
    });
  });
});
