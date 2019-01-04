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
const merge = require('lodash.merge');

const { AuthOptionsNames, CommonOptionsNames, OutputFormat } = require('./../../../../lib/Constants');
const { isEmpty } = require('./../../../../lib/Utils');
const { buildCmd, execCmdWithAssertion, setup } = require('../../../TestsHelper');
const fixtureUser = require('../../../fixtures/user.json');

const baseCmd = 'profile list';

function testProfileList(profilesCount, optionsForCredentials, otherOptions, done) {
  const profileNames = [];
  for (let i = 0; i < profilesCount; i += 1) {
    profileNames.push(`testProfileList${i}`);
  }

  async.series([
    function createSeveral(next) {
      setup.createProfiles(profileNames, next);
    },
    function listProfiles(next) {
      let options = {};

      if (!isEmpty(optionsForCredentials) && !isEmpty(otherOptions)) {
        merge(options, [optionsForCredentials, otherOptions]);
      } else {
        if (!isEmpty(optionsForCredentials)) {
          options = optionsForCredentials;
        }

        if (!isEmpty(otherOptions)) {
          options = otherOptions;
        }
      }

      const positionalArgs = null;
      const cmd = buildCmd(baseCmd, positionalArgs, options, [CommonOptionsNames.VERBOSE]);
      execCmdWithAssertion(cmd, null, null, true, true, false, null, next);
    }
  ], done);
}

describe(baseCmd, () => {
  before((done) => {
    setup.clearGlobalSetup(null, done);
  });

  afterEach((done) => {
    setup.clearGlobalSetup(null, done);
  });

  it('when several should succeed and print default format', (done) => {
    testProfileList(3, null, null, done);
  });

  it(`when several should succeed and print ${OutputFormat.JSON}`, (done) => {
    testProfileList(3, null, { [CommonOptionsNames.OUTPUT]: OutputFormat.JSON }, done);
  });

  it('when one should succeed', (done) => {
    testProfileList(1, null, null, done);
  });

  it('when one with valid credentials as options should succeed', (done) => {
    testProfileList(1, fixtureUser.existent, null, done);
  });

  it('when one with invalid credentials as options should succeed', (done) => {
    const options = {
      [AuthOptionsNames.EMAIL]: 'notValid',
      [AuthOptionsNames.PASSWORD]: '12345678'
    };
    testProfileList(1, options, null, done);
  });

  it('when none should succeed', (done) => {
    const cmd = `${baseCmd} --verbose`;
    execCmdWithAssertion(cmd, null, null, true, true, false, null, done);
  });
});
