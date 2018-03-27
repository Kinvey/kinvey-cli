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

const { ActiveItemType, AppOptionsName, AuthOptionsNames, Namespace } = require('./../../../../lib/Constants');
const { setup, testers } = require('../../../TestsHelper');

const fixtureApp = require('./../../../fixtures/app.json');
const fixtureUser = require('./../../../fixtures/user.json');

const existentUser = fixtureUser.existent;

const baseCmd = `${Namespace.ENV} list`;

function testEnvList(options, flags, appIdentifier, validUser, done) {
  options = options || {};
  const mergedOptions = Object.assign({}, options);
  if (appIdentifier) {
    mergedOptions[AppOptionsName.APP] = appIdentifier;
  }

  testers.execCmdWithIdentifier(baseCmd, mergedOptions, flags, null, validUser, done);
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

  describe('when active app is set', () => {
    const activeProfile = 'activeProfile';
    const activeItem = { id: fixtureApp.id };

    before((done) => {
      async.series([
        (next) => {
          setup.setActiveProfile(activeProfile, true, next);
        },
        (next) => {
          setup.setActiveItemOnProfile(activeProfile, ActiveItemType.APP, activeItem, null, next);
        }
      ], done);
    });

    after((done) => {
      setup.clearGlobalSetup(null, done);
    });

    it('should output default format', (done) => {
      testEnvList(null, defaultFlags, null, null, done);
    });

    it('should output JSON', (done) => {
      testEnvList(jsonOptions, defaultFlags, null, null, done);
    });

    it('with non-existent app id should take precedence and return error', (done) => {
      testEnvList(null, defaultFlags, '173783d46f3d4bffb1c581d5b203fc7c', null, done);
    });

    it('with non-existent app name should take precedence and return error', (done) => {
      testEnvList(null, defaultFlags, 'iJustDoNotExist', null, done);
    });
  });

  describe('when one-time session', () => {
    const credentialsOptions = {
      [AuthOptionsNames.EMAIL]: existentUser.email,
      [AuthOptionsNames.PASSWORD]: existentUser.password
    };

    it('with existent app name should succeed', (done) => {
      testEnvList(credentialsOptions, defaultFlags, fixtureApp.name, null, done);
    });

    it('without app identifier should fail', (done) => {
      testEnvList(credentialsOptions, defaultFlags, null, null, done);
    });
  });
});
