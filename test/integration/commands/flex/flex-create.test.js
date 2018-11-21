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

const { APIRuntime, AppOptionsName, AuthOptionsNames, CLIRuntime, FlexOptionsNames, Namespace, OrgOptionsName } = require('./../../../../lib/Constants');
const fixtureApp = require('./../../../fixtures/app.json');
const fixtureOrg = require('./../../../fixtures/org.json');
const fixtureUser = require('./../../../fixtures/user.json');
const fixtureService = require('./../../../fixtures/internal-flex-service.json');
const { buildCmd, execCmdWithAssertion, setup, testers } = require('../../../TestsHelper');

const baseCmd = `${Namespace.FLEX} create`;
const serviceName = fixtureService.name;

function testServiceCreate(options, flags, name, apiOptions, done) {
  const posArgs = name ? [name] : [];
  const cmd = buildCmd(baseCmd, posArgs, options, flags);
  execCmdWithAssertion(cmd, null, apiOptions, true, true, false, null, done);
}

describe(baseCmd, () => {
  const jsonOptions = testers.getJsonOptions();
  const defaultFlags = testers.getDefaultFlags();
  const optionsForApp = { [AppOptionsName.APP]: fixtureApp.id };
  const optionsForOrg = { [OrgOptionsName.ORG]: fixtureOrg.id };
  const optionsForSecret = { secret: 123 };
  const optionsForSecretAndApp = Object.assign({}, optionsForSecret, optionsForApp);
  const jsonOptionsPlusSecretAndApp = Object.assign(jsonOptions, optionsForSecretAndApp);

  before((done) => {
    setup.clearGlobalSetup(null, done);
  });

  after((done) => {
    setup.clearGlobalSetup(null, done);
  });

  describe('with active profile', () => {
    const activeProfile = 'activeProfile';

    before((done) => {
      setup.setActiveProfile(activeProfile, true, done);
    });

    after((done) => {
      setup.clearGlobalSetup(null, done);
    });

    it('with a name, secret, basic env vars and app should succeed and output default format', (done) => {
      const options = Object.assign({ [FlexOptionsNames.ENV_VARS]: 'KEY_1=value1,KEY_2=value2' }, optionsForSecretAndApp);
      testServiceCreate(options, defaultFlags, serviceName, { envVars: { KEY_1: 'value1', KEY_2: 'value2' } }, done);
    });

    it('with a name, secret, basic env vars, runtime and app should succeed and output default format', (done) => {
      const options = Object.assign({ [FlexOptionsNames.ENV_VARS]: 'KEY_1=value1', [FlexOptionsNames.RUNTIME]: CLIRuntime.NODE8 }, optionsForSecretAndApp);
      testServiceCreate(options, defaultFlags, serviceName, { envVars: { KEY_1: 'value1' }, runtime: APIRuntime.NODE8 }, done);
    });

    it('with a name, app and invalid env vars should fail', (done) => {
      const options = Object.assign({ [FlexOptionsNames.ENV_VARS]: 'KEY_1=value1,KEY_2=[3,5]' }, optionsForApp);
      testServiceCreate(options, defaultFlags, serviceName, null, done);
    });

    it('with a name, app and invalid runtime should fail', (done) => {
      const options = Object.assign({ [FlexOptionsNames.RUNTIME]: 'node8.11.1' }, optionsForApp);
      testServiceCreate(options, defaultFlags, serviceName, null, done);
    });

    it('with a name, secret, complex env vars and app should succeed and output JSON', (done) => {
      const envVarsValue = '"{\\"KEY_1\\": [1, 2, \\"three\\"], \\"KEY_2\\": \\"some value\\"}"';
      const options = Object.assign({ [FlexOptionsNames.ENV_VARS_SET]: envVarsValue }, jsonOptionsPlusSecretAndApp);
      testServiceCreate(options, null, serviceName, { envVars: { KEY_1: JSON.stringify([1, 2, 'three']), KEY_2: 'some value' } }, done);
    });

    it('without a name should fail', (done) => {
      testServiceCreate(optionsForSecretAndApp, defaultFlags, null, null, done);
    });

    it('without a secret should succeed', (done) => {
      testServiceCreate(optionsForApp, null, serviceName, null, done);
    });

    it('without an app and org should fail', (done) => {
      testServiceCreate(optionsForSecret, null, serviceName, null, done);
    });

    it('with both app and org should fail', (done) => {
      const optionsAppOrg = Object.assign({}, optionsForSecretAndApp, optionsForOrg);
      testServiceCreate(optionsAppOrg, null, serviceName, null, done);
    });
  });

  describe('with one-time session', () => {
    it('with name, secret and org should succeed', (done) => {
      const apiOptions = {
        domainType: 'organizations',
        domainEntityId: fixtureOrg.id
      };

      const optionsOrgSecretAndCredentials = Object.assign(
        {},
        optionsForSecret,
        optionsForOrg,
        {
          [AuthOptionsNames.EMAIL]: fixtureUser.existent.email,
          [AuthOptionsNames.PASSWORD]: fixtureUser.existent.password
        }
      );
      const cmd = buildCmd(baseCmd, [serviceName], optionsOrgSecretAndCredentials, defaultFlags);
      execCmdWithAssertion(cmd, null, apiOptions, true, true, false, null, done);
    });
  });
});
