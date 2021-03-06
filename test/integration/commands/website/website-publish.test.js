/**
 * Copyright (c) 2019, Kinvey, Inc. All rights reserved.
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

const { AuthOptionsNames, SitesOptionsNames } = require('./../../../../lib/Constants');
const { buildCmd, execCmdWithAssertion, setup, testers } = require('../../../TestsHelper');
const fixtureSites = require('./../../../fixtures/sites');
const fixtureUser = require('./../../../fixtures/user.json');

const existentSite = fixtureSites[0];
const existentUserOne = fixtureUser.existentOne;
const baseCmd = 'website publish';

describe(baseCmd, () => {
  const jsonOptions = testers.getJsonOptions();
  const defaultFlags = testers.getDefaultFlags();
  const optsDomainName = { [SitesOptionsNames.DOMAIN_NAME]: existentSite.name };
  const noPosArgs = null;

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

    it('with existent site name should succeed and output default format', (done) => {
      const cliOpts = Object.assign({ [SitesOptionsNames.SITE]: existentSite.name }, optsDomainName);
      const cmd = buildCmd(baseCmd, noPosArgs, cliOpts, defaultFlags);
      execCmdWithAssertion(cmd, null, null, true, true, false, null, done);
    });

    it('with existent site id should succeed and output JSON', (done) => {
      const cliOpts = Object.assign({ [SitesOptionsNames.SITE]: existentSite.id }, jsonOptions, optsDomainName);
      const cmd = buildCmd(baseCmd, noPosArgs, cliOpts, defaultFlags);
      execCmdWithAssertion(cmd, null, null, true, true, false, null, done);
    });

    it('with non-existent site name should fail', (done) => {
      const cliOpts = Object.assign({ [SitesOptionsNames.SITE]: 'nope' }, optsDomainName);
      const cmd = buildCmd(baseCmd, noPosArgs, cliOpts, defaultFlags);
      execCmdWithAssertion(cmd, null, null, true, true, false, null, done);
    });

    it('without site identifier but with domainName should fail', (done) => {
      const cmd = buildCmd(baseCmd, noPosArgs, optsDomainName, defaultFlags);
      execCmdWithAssertion(cmd, null, null, true, true, false, null, done);
    });

    it('without domainName but with site identifier should fail', (done) => {
      const cmd = buildCmd(baseCmd, noPosArgs, { [SitesOptionsNames.SITE]: existentSite.id }, defaultFlags);
      execCmdWithAssertion(cmd, null, null, true, true, false, null, done);
    });
  });

  describe('using one-time session', () => {
    before((done) => {
      setup.clearGlobalSetup(null, done);
    });

    it('with existent site identifier should output default format', (done) => {
      const cliOptions = {
        [AuthOptionsNames.EMAIL]: existentUserOne.email,
        [AuthOptionsNames.PASSWORD]: existentUserOne.password,
        [SitesOptionsNames.SITE]: existentSite.name,
        [SitesOptionsNames.DOMAIN_NAME]: existentSite.name
      };
      const apiOptions = { token: fixtureUser.tokenOne };
      const cmd = buildCmd(baseCmd, noPosArgs, cliOptions, defaultFlags);
      execCmdWithAssertion(cmd, null, apiOptions, true, true, false, null, done);
    });
  });

  describe('without auth', () => {
    before((done) => {
      setup.clearGlobalSetup(null, done);
    });

    it('should fail', (done) => {
      const cliOpts = Object.assign({ [SitesOptionsNames.SITE]: existentSite.name }, optsDomainName);
      const cmd = buildCmd(baseCmd, noPosArgs, cliOpts, defaultFlags);
      execCmdWithAssertion(cmd, null, null, true, true, false, null, done);
    });
  });
});
