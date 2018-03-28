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

const { ActiveItemType, AuthOptionsNames, Namespace } = require('./../../../../lib/Constants');
const { buildCmd, execCmdWithAssertion, setup, testers } = require('../../../TestsHelper');
const fixtureApp = require('./../../../fixtures/app.json');
const fixtureUser = require('./../../../fixtures/user.json');

const existentUser = fixtureUser.existent;

const baseCmd = `${Namespace.APP} use`;
const activeProfile = 'activeProfile';

function testAppUse(options, flags, identifier, expectedActive, done) {
  testers.execCmdWithIdentifierAndActiveCheck(baseCmd, options, flags, identifier, expectedActive, activeProfile, null, done);
}

describe(baseCmd, () => {
  const jsonOptions = testers.getJsonOptions();
  const defaultFlags = testers.getDefaultFlags();

  before((done) => {
    setup.clearGlobalSetup(null, done);
  });

  after((done) => {
    setup.clearGlobalSetup(null, done);
  });

  describe('without profile', () => {
    it('with credentials as options should fail', (done) => {
      const credentials = {
        [AuthOptionsNames.EMAIL]: existentUser.email,
        [AuthOptionsNames.PASSWORD]: existentUser.password
      };
      const cmd = buildCmd(baseCmd, [fixtureApp.id], credentials, defaultFlags);
      execCmdWithAssertion(cmd, null, null, true, true, false, null, (err) => {
        expect(err).to.not.exist;
        done();
      });
    });
  });

  describe('with profile', () => {
    const expectedActive = { [ActiveItemType.APP]: { id: fixtureApp.id } };

    before((done) => {
      setup.setActiveProfile(activeProfile, true, done);
    });

    afterEach((done) => {
      setup.clearActiveItemsOnProfile(activeProfile, null, done);
    });

    after((done) => {
      setup.clearGlobalSetup(null, done);
    });

    it('using existent app id should succeed and output default format', (done) => {
      testAppUse(null, defaultFlags, fixtureApp.id, expectedActive, done);
    });

    it('using existent app id should succeed and output JSON', (done) => {
      testAppUse(jsonOptions, defaultFlags, fixtureApp.id, expectedActive, done);
    });

    it('using existent app name should succeed', (done) => {
      testAppUse(null, defaultFlags, fixtureApp.name, expectedActive, done);
    });

    it('using non-existent app name should fail', (done) => {
      testAppUse(null, defaultFlags, 'noSuchName', null, done);
    });

    it('using non-existent app id should fail', (done) => {
      testAppUse(null, defaultFlags, 'f1a003439ed940608a1c82895cc0ef1e', null, done);
    });
  });
});
