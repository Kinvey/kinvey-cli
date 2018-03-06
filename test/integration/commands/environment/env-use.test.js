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

const { ActiveItemType, AppOptionsName, AuthOptionsNames, Namespace } = require('./../../../../lib/Constants');
const { buildCmd, execCmdWithAssertion, setup, testers } = require('../../../TestsHelper');
const fixtureApp = require('./../../../fixtures/app.json');
const fixtureEnv = require('./../../../fixtures/env.json');
const fixtureUser = require('./../../../fixtures/user.json');

const existentUser = fixtureUser.existent;

const baseCmd = `${Namespace.ENV} use`;
const activeProfile = 'activeProfile';
const existentEnvId = fixtureEnv.id;
const existentEnvName = fixtureEnv.name;

function testEnvUse(options, flags, envIdentifier, expectedActive, appIdentifier, done) {
  options = options || {};
  const mergedOptions = Object.assign({}, options);
  if (appIdentifier) {
    mergedOptions[AppOptionsName.APP] = appIdentifier;
  }

  testers.execCmdWithIdentifierAndActiveCheck(baseCmd, mergedOptions, flags, envIdentifier, expectedActive, activeProfile, null, done);
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
      const options = {
        [AuthOptionsNames.EMAIL]: existentUser.email,
        [AuthOptionsNames.PASSWORD]: existentUser.password,
        [AppOptionsName.APP]: fixtureApp.id
      };
      const cmd = buildCmd(baseCmd, [fixtureApp.id], options, defaultFlags);
      execCmdWithAssertion(cmd, null, null, true, true, false, (err) => {
        expect(err).to.not.exist;
        done();
      });
    });
  });

  describe('with profile', () => {
    const expectedActive = { [ActiveItemType.ENV]: { id: fixtureEnv.id } };

    before((done) => {
      setup.setActiveProfile(activeProfile, true, done);
    });

    afterEach((done) => {
      setup.clearSingleActiveItemOnProfile(activeProfile, ActiveItemType.ENV, null, done);
    });

    after((done) => {
      setup.clearGlobalSetup(null, done);
    });

    describe('when active app is set', () => {
      before((done) => {
        const activeApp = { id: fixtureApp.id };
        setup.setActiveItemOnProfile(activeProfile, ActiveItemType.APP, activeApp, null, done);
      });

      after((done) => {
        setup.clearSingleActiveItemOnProfile(activeProfile, ActiveItemType.APP, null, done);
      });

      it('using existent env id should succeed and output default format', (done) => {
        testEnvUse(null, defaultFlags, existentEnvId, expectedActive, null, done);
      });

      it('using existent env id should succeed and output JSON', (done) => {
        testEnvUse(jsonOptions, defaultFlags, existentEnvId, expectedActive, null, done);
      });

      it('using existent env name should succeed', (done) => {
        testEnvUse(null, defaultFlags, existentEnvName, expectedActive, null, done);
      });

      it('using existent env name and non-existent app name should fail', (done) => {
        testEnvUse(null, defaultFlags, existentEnvName, null, 'noSuchApp', done);
      });

      it('using non-existent env name should fail', (done) => {
        testEnvUse(null, defaultFlags, 'noSuchName', null, null, done);
      });

      it('using non-existent env id should fail', (done) => {
        testEnvUse(null, defaultFlags, 'f1a003439ed940608a1c82895cc0ef1e', null, null, done);
      });
    });

    describe('when active app is not set', () => {
      it('using existent env name and existent app name should succeed', (done) => {
        testEnvUse(null, defaultFlags, existentEnvName, expectedActive, fixtureApp.name, done);
      });

      it('using existent env name and existent app id should succeed', (done) => {
        testEnvUse(null, defaultFlags, existentEnvName, expectedActive, fixtureApp.id, done);
      });

      // technically, the env id is enough but we need to be consistent, so an error is expected
      it('using existent env id and no app should fail', (done) => {
        testEnvUse(null, defaultFlags, existentEnvId, null, null, done);
      });

      it('without env and without app should fail', (done) => {
        testEnvUse(null, defaultFlags, null, null, null, done);
      });
    });
  });
});
