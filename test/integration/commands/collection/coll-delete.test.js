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

const { ActiveItemType, AppOptionsName, AuthOptionsNames, CommonOptionsNames, EnvOptionsName, Namespace } = require('./../../../../lib/Constants');
const { buildCmd, execCmdWithAssertion, setup, testers } = require('../../../TestsHelper');
const fixtureApp = require('./../../../fixtures/app.json');
const fixtureEnv = require('./../../../fixtures/env.json');
const fixtureColl = require('./../../../fixtures/collection.json');
const fixtureUser = require('./../../../fixtures/user.json');

const existentUser = fixtureUser.existent;

const baseCmd = `${Namespace.COLL} delete`;
const activeProfile = 'activeProfile';
const existentEnvId = fixtureEnv.id;
const existentEnvName = fixtureEnv.name;
const validCollName = fixtureColl.name;

function testCollCreate(options, flags, envIdentifier, appIdentifier, collName, done) {
  options = options || {};
  const mergedOptions = Object.assign({}, options);
  if (appIdentifier) {
    mergedOptions[AppOptionsName.APP] = appIdentifier;
  }

  if (envIdentifier) {
    mergedOptions[EnvOptionsName.ENV] = envIdentifier;
  }

  flags = flags || [];
  flags.push(CommonOptionsNames.NO_PROMPT);
  testers.execCmdWithIdentifier(baseCmd, mergedOptions, flags, collName, null, done);
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
    it('with credentials as options, existent app and env, and coll name should succeed', (done) => {
      const options = {
        [AuthOptionsNames.EMAIL]: existentUser.email,
        [AuthOptionsNames.PASSWORD]: existentUser.password,
        [AppOptionsName.APP]: fixtureApp.name,
        [EnvOptionsName.ENV]: fixtureEnv.name
      };
      const cmd = buildCmd(baseCmd, [fixtureColl.name], options, [CommonOptionsNames.VERBOSE, CommonOptionsNames.NO_PROMPT]);
      execCmdWithAssertion(cmd, null, null, true, true, false, null, (err) => {
        expect(err).to.not.exist;
        done();
      });
    });

    it('with credentials as options, existent app and env, and no coll name should fail', (done) => {
      const options = {
        [AuthOptionsNames.EMAIL]: existentUser.email,
        [AuthOptionsNames.PASSWORD]: existentUser.password,
        [AppOptionsName.APP]: fixtureApp.name,
        [EnvOptionsName.ENV]: fixtureEnv.name
      };
      const cmd = buildCmd(baseCmd, null, options, defaultFlags);
      execCmdWithAssertion(cmd, null, null, true, true, false, null, (err) => {
        expect(err).to.not.exist;
        done();
      });
    });
  });

  describe('with profile', () => {
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

      describe('active env is set', () => {
        before((done) => {
          const activeEnv = { id: fixtureEnv.id };
          setup.setActiveItemOnProfile(activeProfile, ActiveItemType.ENV, activeEnv, null, done);
        });

        after((done) => {
          setup.clearSingleActiveItemOnProfile(activeProfile, ActiveItemType.ENV, null, done);
        });

        it('without env arg should succeed', (done) => {
          testCollCreate(null, defaultFlags, null, null, validCollName, done);
        });

        it('with non-existent env id should take precedence and fail', (done) => {
          testCollCreate(null, defaultFlags, 'kid_JjJJjg2cN', null, validCollName, done);
        });
      });

      describe('active env is not set', () => {
        it('using existent env id should succeed and output default format', (done) => {
          testCollCreate(null, defaultFlags, existentEnvId, null, validCollName, done);
        });

        it('using existent env id should succeed and output JSON', (done) => {
          testCollCreate(jsonOptions, defaultFlags, existentEnvId, null, validCollName, done);
        });

        it('using existent env name should succeed', (done) => {
          testCollCreate(null, defaultFlags, existentEnvName, null, validCollName, done);
        });

        it('using existent env name and non-existent app name should fail', (done) => {
          testCollCreate(null, defaultFlags, existentEnvName, 'noSuchApp', validCollName, done);
        });

        it('using non-existent env name should fail', (done) => {
          testCollCreate(null, defaultFlags, 'noSuchName', null, validCollName, done);
        });

        it('using non-existent env id should fail', (done) => {
          testCollCreate(null, defaultFlags, 'kid_JjJJjg2cN', null, validCollName, done);
        });
      });
    });

    describe('when active app is not set', () => {
      it('using existent env name and existent app name should succeed', (done) => {
        testCollCreate(null, defaultFlags, existentEnvName, fixtureApp.name, validCollName, done);
      });

      it('using existent env name and existent app id should succeed', (done) => {
        testCollCreate(null, defaultFlags, existentEnvName, fixtureApp.id, validCollName, done);
      });

      it('using existent env id and no app should fail', (done) => {
        testCollCreate(null, defaultFlags, existentEnvId, null, validCollName, done);
      });

      it('without env and without app should fail', (done) => {
        testCollCreate(null, defaultFlags, null, null, validCollName, done);
      });
    });
  });
});
