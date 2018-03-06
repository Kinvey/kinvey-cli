/**
 * Copyright (c) 2017, Kinvey, Inc. All rights reserved.
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
const mockServer = require('../../../mockServer');
const path = require('path');
const suppose = require('suppose');
const fs = require('fs');
const assert = require('assert');

const testsConfig = require('../../../TestsConfig');
const { assertions, getCreatedProfileMessage, runSupposeSequence } = require('../../../TestsHelper');

const { CommonOptionsNames, FlexOptionsNames, OutputFormat } = require('./../../../../lib/Constants');
const { isEmpty } = require('./../../../../lib/Utils');
const { buildCmd, buildOptions, execCmdWithAssertion, setup } = require('../../../TestsHelper');

const fixtureApp = require('./../../../fixtures/app.json');
const fixtureUser = require('./../../../fixtures/user.json');
const fixtureServices = require('./../../../fixtures/datalinks.json');

const existentUserOne = fixtureUser.existentOne;
const tokenOne = fixtureUser.tokenOne;
const nonExistentUser = fixtureUser.nonexistent;

const baseCmd = 'flex list';
const outputFile = './output.txt';

const defaultEnv = {
  NODE_CONFIG: JSON.stringify(testsConfig)
};

const defaultEnvWithDebug = {
  env: defaultEnv,
  debug: fs.createWriteStream(outputFile)
};

const Prompt = {
  selectAppOrOrg: /Would you like to select a service from a Kinvey app or org\? \(Use arrow keys\)/,
  selectApp: /Which app would you like to use\?/,
  selectService: /Which service would you like to use\?/
};

const Keys = {
  downArrow: '\u001b[B',
  upArrow: '\u001b[A'
};

const defaultProfileName = 'flexListProfile';
const defaultDataLinkName = 'TestKinveyDatalink';
const defaultService = fixtureServices.find(x => x.name === defaultDataLinkName);
const projectFlex = assertions.buildExpectedProject('app', fixtureApp.id, defaultService.id, defaultService.name);
const expectedProject = assertions.buildExpectedProjectSetup(defaultProfileName, projectFlex);

function testFlexList(profileName, optionsForCredentials, domain, domainEntityId, isVerbose, validUser, otherOptions, done) {
  const options = buildOptions(profileName, optionsForCredentials, otherOptions);

  const apiOptions = {};

  if (domain) {
    options[FlexOptionsNames.DOMAIN_TYPE] = domain;
    if (domain === 'org') {
      apiOptions.domainType = 'organizations';
    }
  }

  if (domainEntityId) {
    options[FlexOptionsNames.DOMAIN_ID] = domainEntityId;
  }

  if (!isEmpty(validUser)) {
    apiOptions.token = validUser.token;
    apiOptions.existentUser = { email: validUser.email };
  }

  const clearSetupPaths = isVerbose;
  const escapeSlashes = !isVerbose;
  const flags = isVerbose ? [CommonOptionsNames.VERBOSE] : null;
  const positionalArgs = null;
  const cmd = buildCmd(baseCmd, positionalArgs, options, flags);
  execCmdWithAssertion(cmd, null, apiOptions, true, clearSetupPaths, escapeSlashes, done);
}

describe(baseCmd, () => {
  const nonExistentEntityId = '123I_DONT_EXIST';
  const validDomain = 'app';
  const validDomainEntityId = fixtureApp.id;

  const validUserForListing = {
    email: existentUserOne.email,
    token: tokenOne
  };

  let ms = {};
  const nodeCommand = 'node';
  const cliPath = path.join('bin', 'kinvey');

  before((done) => {
    async.series([
      (next) => {
        setup.clearGlobalSetup(null, next);
      },
      (next) => {
        setup.createProfiles(defaultProfileName, next);
      }
    ], done);
  });

  after((done) => {
    setup.clearAllSetup(done);
  });

  describe('App Services', () => {

    before((done) => {
      mockServer(null, (err, server) => {
        if (err) {
          return done(err);
        }

        ms = server;
        done();
      });
    });

    after((done) => {
        if (ms.listening) {
          ms.close(() => {
            done();
          });
        } else {
          done();
        }
    });

    describe('without specifying a profile', () => {
      it('with one valid existing profile should succeed', (done) => {
        const sequence = suppose(nodeCommand, [cliPath, 'flex', 'init'], defaultEnvWithDebug)
          .when(Prompt.selectAppOrOrg).respond('\n')
          .when(Prompt.selectApp).respond('\n')
          .when(Prompt.selectService).respond('\n');

        runSupposeSequence(sequence, (error, exitCode) => {
          assertions.assertSuccessfulFlexInitSequence(error, exitCode, expectedProject, outputFile, 'Saved configuration.', done);
        });
      });
    });
  });
});
