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

const { AuthOptionsNames, CommonOptionsNames, OutputFormat } = require('./../../../../lib/Constants');
const { buildCmd, execCmdWithAssertion } = require('../../../TestsHelper');

const fixtureUser = require('./../../../fixtures/user.json');

const existentUser = fixtureUser.existent;

const baseCmd = 'app list';

describe(baseCmd, () => {
  const jsonOptions = { [CommonOptionsNames.OUTPUT]: OutputFormat.JSON };
  const defaultFlags = [CommonOptionsNames.VERBOSE];
  const credentialsOptions = {
    [AuthOptionsNames.EMAIL]: existentUser.email,
    [AuthOptionsNames.PASSWORD]: existentUser.password
  };

  it('when there are apps should output default format', (done) => {
    const cmd = buildCmd(baseCmd, null, credentialsOptions, defaultFlags);
    execCmdWithAssertion(cmd, null, null, true, true, false, null, done);
  });

  it('when there are apps should output JSON', (done) => {
    const options = Object.assign({}, credentialsOptions, jsonOptions);
    const cmd = buildCmd(baseCmd, null, options, defaultFlags);
    execCmdWithAssertion(cmd, null, null, true, true, false, null, done);
  });

  it('when no apps should succeed', (done) => {
    const cmd = buildCmd(baseCmd, null, credentialsOptions, defaultFlags);
    const apiOptions = {
      apps: []
    };
    execCmdWithAssertion(cmd, null, apiOptions, true, true, false, null, done);
  });
});
