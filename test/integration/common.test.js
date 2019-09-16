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

const { ActiveItemType, Namespace } = require('./../../lib/Constants');
const { writeJSON } = require('./../../lib/Utils');
const fixtureApp = require('./../fixtures/app.json');
const fixtureEnv = require('./../fixtures/env.json');
const TestsConfig = require('../TestsConfig');
const { assertions, buildCmd, execCmdWithAssertion, setup } = require('../TestsHelper');

describe('common', () => {
  before((done) => {
    setup.clearGlobalSetup(null, done);
  });

  after((done) => {
    setup.clearGlobalSetup(null, done);
  });

  describe('flags and options', () => {
    it('with unsupported hyphenated option should fail', (done) => {
      const options = {
        'test-option': 10
      };
      const cmd = buildCmd(`${Namespace.PROFILE} show`, null, options);
      execCmdWithAssertion(cmd, null, null, true, true, false, null, done);
    });

    it('with unsupported hyphenated flag should fail', (done) => {
      const cmd = buildCmd(`${Namespace.PROFILE} show`, null, null, ['no-prompt']);
      execCmdWithAssertion(cmd, null, null, true, true, false, null, done);
    });
  });

  describe('incomplete commands', () => {
    before((done) => {
      const profileName = 'testProfile';
      async.series([
        (next) => {
          setup.setActiveProfile(profileName, true, next);
        },
        (next) => {
          setup.setActiveItemOnProfile(profileName, ActiveItemType.APP, { id: fixtureApp.id }, null, next);
        },
        (next) => {
          setup.setActiveItemOnProfile(profileName, ActiveItemType.ENV, { id: fixtureEnv.id }, null, next);
        },
      ], done);
    });

    const allNamespaces = Object.keys(Namespace).map(x => Namespace[x]);
    allNamespaces.forEach((ns) => {
      it(`namespace (${ns}) only should show help`, (done) => {
        execCmdWithAssertion(ns, null, null, true, true, false, null, done);
      });
    });
  });

  describe('invalid credentials', () => {
    before('set up profile', (done) => {
      const profile = assertions.buildExpectedProfile('testProfile', TestsConfig.host, 'test@mail.com', 'expiredToken');
      writeJSON({ file: TestsConfig.paths.session, data: { profiles: profile } }, done);
    });

    after((done) => {
      setup.clearGlobalSetup(null, done);
    });

    it('when token is expired should fail and suggest command', (done) => {
      execCmdWithAssertion('app list', null, null, true, true, true, null, done);
    });
  });
});
