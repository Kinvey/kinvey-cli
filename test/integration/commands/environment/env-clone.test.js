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
const { assertions, buildCmd, execCmdWithAssertion, setup, testers } = require('../../../TestsHelper');
const fixtureApp = require('./../../../fixtures/app.json');
const fixtureEnv = require('./../../../fixtures/env.json');
const fixtureEnvs = require('./../../../fixtures/envs.json');
const fixtureUser = require('./../../../fixtures/user.json');

const existentUser = fixtureUser.existent;

const baseCmd = `${Namespace.ENV} clone`;
const activeProfile = 'activeProfile';
const existentEnvId = fixtureEnv.id;
const existentEnvName = fixtureEnv.name;
const existentTargetEnvName = fixtureEnvs[1].name;
const existentTargetEnvId = fixtureEnvs[1].id;

function testEnvClone(options, flags, envIdentifier, appIdentifier, targetEnvIdentifier, done) {
  options = options || {};
  const mergedOptions = Object.assign({}, options);
  if (appIdentifier) {
    mergedOptions[AppOptionsName.APP] = appIdentifier;
  }

  if (envIdentifier) {
    mergedOptions[EnvOptionsName.ENV] = envIdentifier;
  }

  testers.execCmdWithIdentifier(baseCmd, mergedOptions, flags, targetEnvIdentifier, null, done);
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
    it('should fail', (done) => {
      const options = {
        [AuthOptionsNames.EMAIL]: existentUser.email,
        [AuthOptionsNames.PASSWORD]: existentUser.password,
        [AppOptionsName.APP]: fixtureApp.name,
        [EnvOptionsName.ENV]: existentEnvName,
        [EnvOptionsName.TARGET]: existentTargetEnvName
      };
      const cmd = buildCmd(baseCmd, null, options, [CommonOptionsNames.VERBOSE, CommonOptionsNames.NO_PROMPT]);
      execCmdWithAssertion(cmd, null, null, true, true, false, null, (err) => {
        expect(err).to.not.exist;
        done();
      });
    });

    it('using existent target env name and existent env name and existent app name should fail', (done) => {
      testEnvClone(null, defaultFlags, existentEnvName, fixtureApp.name, existentTargetEnvName, done);
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
      const activeApp = { id: fixtureApp.id };

      before((done) => {
        setup.setActiveItemOnProfile(activeProfile, ActiveItemType.APP, activeApp, null, done);
      });

      after((done) => {
        setup.clearSingleActiveItemOnProfile(activeProfile, ActiveItemType.APP, null, done);
      });

      describe('active env is set', () => {
        beforeEach((done) => {
          const activeEnv = { id: fixtureEnv.id };
          setup.setActiveItemOnProfile(activeProfile, ActiveItemType.ENV, activeEnv, null, done);
        });

        afterEach((done) => {
          setup.clearSingleActiveItemOnProfile(activeProfile, ActiveItemType.ENV, null, done);
        });

        it('using non-existent target env should fail', (done) => {
          testEnvClone(null, defaultFlags, null, null, 'noSuchName', done);
        });

        it('using existent target env without env arg should succeed', (done) => {
          testEnvClone(null, defaultFlags, null, null, existentTargetEnvName, done);
        });

        it('using existent target env with non-existent env id should take precedence and fail', (done) => {
          testEnvClone(null, defaultFlags, 'kid_JjJJjg2cN', null, existentTargetEnvName, done);
        });
      });

      describe('active env is not set', () => {
        it('using existant target env and existent env name should succeed', (done) => {
          testEnvClone(null, defaultFlags, existentEnvName, null, existentTargetEnvName, done);
        });

        it('using existant target env and existent env name and non-existent app name should fail', (done) => {
          testEnvClone(null, defaultFlags, existentEnvName, 'noSuchApp', existentTargetEnvName, done);
        });

        it('using non-existent env name should fail', (done) => {
          testEnvClone(null, defaultFlags, 'noSuchName', null, existentTargetEnvName, done);
        });

        it('using non-existent env id should fail', (done) => {
          testEnvClone(null, defaultFlags, 'kid_JjJJjg2cN', null, existentTargetEnvName, done);
        });
      });
    });

    describe('when active app is not set', () => {
      it('using existent target env name and existent env name and existent app name should succeed', (done) => {
        testEnvClone(null, defaultFlags, existentEnvName, fixtureApp.name, existentTargetEnvName, done);
      });

      it('using existent target env name and existent env name and existent app id should succeed', (done) => {
        testEnvClone(null, defaultFlags, existentEnvName, fixtureApp.id, existentTargetEnvName, done);
      });

      it('using existent target env name and existent env name and existent app name should succeed', (done) => {
        testEnvClone(null, defaultFlags, existentEnvName, fixtureApp.name, existentTargetEnvName, done);
      });

      it('using existent target env name and existent env id and existent app name should succeed', (done) => {
        testEnvClone(null, defaultFlags, existentEnvId, fixtureApp.name, existentTargetEnvName, done);
      });

      it('using existent target env name and existent env name and existent app name should succeed', (done) => {
        testEnvClone(null, defaultFlags, existentEnvName, fixtureApp.name, existentTargetEnvName, done);
      });

      it('using existent target env id name and existent env name and existent app name should succeed', (done) => {
        testEnvClone(null, defaultFlags, existentEnvName, fixtureApp.name, existentTargetEnvId, done);
      });

      it('using existent target env id and existent env name and no app should fail', (done) => {
        testEnvClone(null, defaultFlags, existentEnvId, null, existentTargetEnvId, done);
      });

      it('without target env and without env and without app should fail', (done) => {
        testEnvClone(null, defaultFlags, null, null, null, done);
      });
    });
  });
});
