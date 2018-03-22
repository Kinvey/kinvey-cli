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

const { ActiveItemType, AuthOptionsNames, Namespace } = require('./../../../../lib/Constants');
const { setup, testers } = require('../../../TestsHelper');

const fixtureApp = require('./../../../fixtures/app.json');
const fixtureUser = require('./../../../fixtures/user.json');

const existentUserOne = fixtureUser.existentOne;
const tokenOne = fixtureUser.tokenOne;

const baseCmd = `${Namespace.APP} show`;
const activeProfile = 'activeProfile';

function testAppShow(options, flags, identifier, validUser, done) {
  testers.execCmdWithIdentifier(baseCmd, options, flags, identifier, validUser, done);
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

  describe('when no active app', () => {
    it('with existent app id as option should output default format', (done) => {
      testAppShow(null, defaultFlags, fixtureApp.id, null, done);
    });

    it('with existent app id as option should output JSON', (done) => {
      testAppShow(jsonOptions, defaultFlags, fixtureApp.id, null, done);
    });

    it('without id should return error', (done) => {
      testAppShow(null, defaultFlags, null, null, done);
    });
  });

  describe('when active app', () => {
    before((done) => {
      setup.setActiveItemOnProfile(activeProfile, ActiveItemType.APP, { id: fixtureApp.id }, null, done);
    });

    it('without id should succeed', (done) => {
      testAppShow(null, defaultFlags, null, null, done);
    });

    it('with non-existent app name should disregard active and return error', (done) => {
      testAppShow(null, defaultFlags, 'noSuchName', null, done);
    });

    it('with credentials as options and existent name should succeed', (done) => {
      const options = {
        [AuthOptionsNames.EMAIL]: existentUserOne.email,
        [AuthOptionsNames.PASSWORD]: existentUserOne.password
      };
      testAppShow(options, defaultFlags, fixtureApp.name, { token: tokenOne, email: existentUserOne.email }, done);
    });
  });
});
