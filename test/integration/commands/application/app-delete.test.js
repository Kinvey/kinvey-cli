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

const { AuthOptionsNames, CommonOptionsNames, Namespace, OutputFormat } = require('./../../../../lib/Constants');
const { buildCmd, execCmdWithAssertion, setup, testers } = require('../../../TestsHelper');
const fixtureApp = require('./../../../fixtures/app.json');
const fixtureUser = require('./../../../fixtures/user.json');

const existentUser = fixtureUser.existent;

const baseCmd = `${Namespace.APP} delete`;

const activeProfile = 'activeProfile';
const appName = fixtureApp.name;
const appId = fixtureApp.id;

function testAppDelete(options, flags, identifier, done) {
  testers.execCmdWithIdentifier(baseCmd, options, flags, identifier, null, done);
}

describe(baseCmd, () => {
  const jsonOptions = testers.getJsonOptions();
  const defaultFlags = testers.getDefaultFlags();

  after((done) => {
    setup.clearGlobalSetup(null, done);
  });

  describe('with profile', () => {
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

    it('using existent app id should succeed and output default format', (done) => {
      testAppDelete(null, defaultFlags, appId, done);
    });

    it('using existent app id should succeed and output JSON', (done) => {
      testAppDelete(jsonOptions, defaultFlags, appId, done);
    });

    it('using existent app name should succeed', (done) => {
      testAppDelete(null, defaultFlags, appName, done);
    });

    it('using non-existent app name should fail', (done) => {
      testAppDelete(null, defaultFlags, 'noSuchName', done);
    });

    it('using non-existent app id should fail', (done) => {
      testAppDelete(null, defaultFlags, 'f1a003439ed940608a1c82895cc0ef1e', done);
    });
  });

  describe('without profile', () => {
    it('with credentials as options should succeed', (done) => {
      const credentials = {
        [AuthOptionsNames.EMAIL]: existentUser.email,
        [AuthOptionsNames.PASSWORD]: existentUser.password
      };
      const cmd = buildCmd(baseCmd, [appId], credentials, defaultFlags);
      execCmdWithAssertion(cmd, null, null, true, true, false, null, (err) => {
        expect(err).to.not.exist;
        done();
      });
    });
  });
});
