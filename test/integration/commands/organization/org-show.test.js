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

const { ActiveItemType, AuthOptionsNames, OrgOptionsName } = require('./../../../../lib/Constants');
const { buildCmd, execCmdWithAssertion, setup, testers } = require('../../../TestsHelper');

const fixtureOrg = require('./../../../fixtures/org.json');
const fixtureUser = require('./../../../fixtures/user.json');

const existentUserOne = fixtureUser.existentOne;
const tokenOne = fixtureUser.tokenOne;

const baseCmd = 'org show';
const activeProfile = 'activeProfile';

function testOrgShow(originalOptions, flags, orgIdentifier, validUser, done) {
  const options = originalOptions || {};
  if (orgIdentifier) {
    options[OrgOptionsName.ORG] = orgIdentifier;
  }
  testers.execCmdWithIdentifier(baseCmd, options, flags, null, validUser, done);
}

describe(baseCmd, () => {
  const jsonOptions = testers.getJsonOptions();
  const defaultFlags = testers.getDefaultFlags();

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

  describe('when no active org', () => {
    it('with existent org id as option should output default format', (done) => {
      testOrgShow(null, defaultFlags, fixtureOrg.id, null, done);
    });

    it('with existent org id as option should output JSON', (done) => {
      testOrgShow(jsonOptions, defaultFlags, fixtureOrg.id, null, done);
    });

    it('without id should return error', (done) => {
      testOrgShow(null, defaultFlags, null, null, done);
    });
  });

  describe('when active org', () => {
    before((done) => {
      setup.setActiveItemOnProfile(activeProfile, ActiveItemType.ORG, { id: fixtureOrg.id }, null, done);
    });

    it('without id should succeed', (done) => {
      testOrgShow(null, defaultFlags, null, null, done);
    });

    it('with non-existent org name should disregard active and return error', (done) => {
      testOrgShow(null, defaultFlags, 'noSuchName', null, done);
    });

    it('with credentials as options and existent name should succeed', (done) => {
      const options = {
        [AuthOptionsNames.EMAIL]: existentUserOne.email,
        [AuthOptionsNames.PASSWORD]: existentUserOne.password,
        [OrgOptionsName.ORG]: `"${fixtureOrg.name}"`
      };
      const cmd = buildCmd(baseCmd, null, options, defaultFlags);
      execCmdWithAssertion(cmd, null, { token: tokenOne, email: existentUserOne.email }, true, true, false, null, done);
    });
  });
});
