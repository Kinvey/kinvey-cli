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

const cloneDeep = require('lodash.clonedeep');

const { AuthOptionsNames, FlexOptionsNames, Namespace } = require('./../../../../lib/Constants');
const fixtureApp = require('./../../../fixtures/app.json');
const fixtureUser = require('./../../../fixtures/user.json');
const fixtureService = require('./../../../fixtures/internal-flex-service.json');
const fixtureSvcEnvs = require('./../../../fixtures/svc-envs-several.json');
const fixtureSvcEnvOneEnvVar = require('./../../../fixtures/svc-env-one-env-var.json');
const { buildCmd, buildOptions, execCmdWithAssertion, setup, testers } = require('../../../TestsHelper');

const baseCmd = `${Namespace.FLEX} update`;
const jsonOptions = testers.getJsonOptions();
const defaultFlags = testers.getDefaultFlags();

function testFlexUpdate(options, flags, apiOptions, done) {
  const cmd = buildCmd(baseCmd, null, options, flags);
  execCmdWithAssertion(cmd, null, apiOptions, true, true, false, null, done);
}

describe(baseCmd, () => {
  before((done) => {
    setup.clearGlobalSetup(null, done);
  });

  after((done) => {
    setup.clearGlobalSetup(null, done);
  });

  describe('by specifying a profile', () => {
    const profileToUse = 'primaryProfile';
    const optionsForProfile = { [AuthOptionsNames.PROFILE]: profileToUse };

    before('set up profile', (done) => {
      setup.createProfiles(['profileOne', profileToUse], done);
    });

    describe('when valid project is set', () => {
      before((done) => {
        setup.createProjectSetup(
          profileToUse,
          {
            domain: 'app',
            domainEntityId: fixtureApp.id,
            serviceId: fixtureService.id,
            serviceName: fixtureService.name,
            svcEnvId: fixtureSvcEnvOneEnvVar.id,
            schemaVersion: 2
          },
          done
        );
      });

      after((done) => {
        setup.clearProjectSetup(null, done);
      });

      it('with valid basic env vars (replace) should succeed and output default format', (done) => {
        const options = Object.assign({ [FlexOptionsNames.ENV_VARS_REPLACE]: 'KEY_1=value1,KEY_2=value2' }, optionsForProfile);
        const envVars = { KEY_1: 'value1', KEY_2: 'value2' };
        const updatedSvcEnv = cloneDeep(fixtureSvcEnvOneEnvVar);
        delete updatedSvcEnv.id;
        updatedSvcEnv.environmentVariables = envVars;
        const apiOptions = {
          envVars,
          updatedSvcEnv,
          svcEnvs: fixtureSvcEnvs
        };
        testFlexUpdate(options, defaultFlags, apiOptions, done);
      });

      it('with valid basic env vars (set) should succeed and output JSON format', (done) => {
        const options = Object.assign({ [FlexOptionsNames.ENV_VARS_SET]: 'KEY_1=value1,KEY_2=value2' }, optionsForProfile, jsonOptions);
        const envVars = { KEY_1: 'value1', KEY_2: 'value2' };
        const updatedSvcEnv = cloneDeep(fixtureSvcEnvOneEnvVar);
        delete updatedSvcEnv.id;
        updatedSvcEnv.environmentVariables = Object.assign({}, updatedSvcEnv.environmentVariables, envVars);
        const apiOptions = {
          envVars,
          updatedSvcEnv,
          svcEnvs: fixtureSvcEnvs
        };
        testFlexUpdate(options, defaultFlags, apiOptions, done);
      });

      it('with invalid basic env vars (set) should fail', (done) => {
        const options = Object.assign({ [FlexOptionsNames.ENV_VARS_SET]: 'KEY_1=val,ue1,KEY_2=value2' }, optionsForProfile);
        testFlexUpdate(options, defaultFlags, null, done);
      });

      it('with both set and replace env vars should fail', (done) => {
        const options = Object.assign({ [FlexOptionsNames.ENV_VARS_SET]: 'KEY_1=value1', [FlexOptionsNames.ENV_VARS_REPLACE]: 'KEY_2=value2' }, optionsForProfile);
        testFlexUpdate(options, defaultFlags, null, done);
      });
    });

    describe('when invalid project is set', () => {
      before((done) => {
        setup.createProjectSetup(profileToUse, { serviceId: '123nonExistent' }, done);
      });

      after((done) => {
        setup.clearProjectSetup(null, done);
      });

      it('with existent service and svc env as options and single env var (set) should succeed', (done) => {
        const options = Object.assign(
          {
            [FlexOptionsNames.ENV_VARS_SET]: 'MY_KEY_1=3.5',
            [FlexOptionsNames.SERVICE_ID]: fixtureService.id,
            [FlexOptionsNames.SVC_ENV]: fixtureSvcEnvOneEnvVar.name
          },
          optionsForProfile
        );
        const envVars = { MY_KEY_1: '3.5' };
        const updatedSvcEnv = cloneDeep(fixtureSvcEnvOneEnvVar);
        delete updatedSvcEnv.id;
        updatedSvcEnv.environmentVariables = Object.assign({}, updatedSvcEnv.environmentVariables, envVars);
        const apiOptions = {
          envVars,
          updatedSvcEnv,
          svcEnvs: fixtureSvcEnvs
        };
        testFlexUpdate(options, defaultFlags, apiOptions, done);
      });
    });
  });

  describe('by specifying credentials', () => {
    const credsOptions = {
      [AuthOptionsNames.EMAIL]: fixtureUser.existentOne.email,
      [AuthOptionsNames.PASSWORD]: fixtureUser.existentOne.password
    };

    const apiOptionsUser = {
      token: fixtureUser.tokenOne
    };

    it('without service and svc env should fail', (done) => {
      const options = buildOptions(null, credsOptions, { [FlexOptionsNames.ENV_VARS_SET]: 'KEY_1=value1' });
      testFlexUpdate(options, defaultFlags, apiOptionsUser, done);
    });

    it('with service but without svc env (when many) should fail', (done) => {
      const options = buildOptions(null, credsOptions, { [FlexOptionsNames.ENV_VARS_SET]: 'KEY_1=value1', [FlexOptionsNames.SERVICE_ID]: fixtureService.id });
      const apiOptions = Object.assign({ svcEnvs: fixtureSvcEnvs }, apiOptionsUser);
      testFlexUpdate(options, defaultFlags, apiOptions, done);
    });

    it('with service, svc env and valid complex env vars (set) should succeed', (done) => {
      const options = buildOptions(
        null,
        credsOptions,
        {
          [FlexOptionsNames.ENV_VARS_SET]: '"{\\"KEY_1\\": [1, 2, \\"three\\"], \\"KEY_2\\": \\"3.5\\"}"',
          [FlexOptionsNames.SERVICE_ID]: fixtureService.id,
          [FlexOptionsNames.SVC_ENV]: fixtureSvcEnvOneEnvVar.id
        });
      const envVars = { KEY_1: JSON.stringify([1, 2, 'three']), KEY_2: JSON.stringify(3.5) };
      const updatedSvcEnv = cloneDeep(fixtureSvcEnvOneEnvVar);
      delete updatedSvcEnv.id;
      updatedSvcEnv.environmentVariables = Object.assign({}, updatedSvcEnv.environmentVariables, envVars);
      const apiOptions = Object.assign({}, apiOptionsUser, { envVars, updatedSvcEnv, svcEnvs: fixtureSvcEnvs });
      testFlexUpdate(options, defaultFlags, apiOptions, done);
    });
  });
});
