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

const { AuthOptionsNames } = require('./../../../../lib/Constants');
const { setup, testers } = require('../../../TestsHelper');
const fixtureSites = require('./../../../fixtures/sites.json');
const fixtureUser = require('./../../../fixtures/user.json');

const existentUserOne = fixtureUser.existentOne;

const baseCmd = 'website create';

describe(baseCmd, () => {
  const jsonOptions = testers.getJsonOptions();
  const defaultFlags = testers.getDefaultFlags();
  const noCliOptions = null;
  const siteName = fixtureSites[0].name;

  before((done) => {
    setup.clearGlobalSetup(null, done);
  });

  describe('using active profile', () => {
    const activeProfile = 'activeProfile';

    before((done) => {
      async.series([
        (next) => {
          setup.clearGlobalSetup(null, next);
        },
        (next) => {
          setup.setActiveProfile(activeProfile, true, next);
        }
      ], done);
    });

    after((done) => {
      setup.clearGlobalSetup(null, done);
    });

    it('with a name should succeed and output default format', (done) => {
      testers.execCmdWithIdentifier(baseCmd, noCliOptions, defaultFlags, siteName, null, done);
    });

    it('with a name should succeed and output JSON', (done) => {
      testers.execCmdWithIdentifier(baseCmd, jsonOptions, defaultFlags, siteName, null, done);
    });

    it('without a name should fail', (done) => {
      const noName = null;
      testers.execCmdWithIdentifier(baseCmd, noCliOptions, defaultFlags, noName, null, done);
    });
  });

  describe('using one-time session', () => {
    before((done) => {
      setup.clearGlobalSetup(null, done);
    });

    it('with a name should succeed and output default format', (done) => {
      const cliOpts = {
        [AuthOptionsNames.EMAIL]: existentUserOne.email,
        [AuthOptionsNames.PASSWORD]: existentUserOne.password
      };
      const validUser = { token: fixtureUser.tokenOne, email: existentUserOne.email };
      testers.execCmdWithIdentifier(baseCmd, cliOpts, defaultFlags, siteName, validUser, done);
    });
  });

  describe('without auth', () => {
    before((done) => {
      setup.clearGlobalSetup(null, done);
    });

    it('should fail', (done) => {
      testers.execCmdWithIdentifier(baseCmd, noCliOptions, defaultFlags, siteName, null, done);
    });
  });
});
