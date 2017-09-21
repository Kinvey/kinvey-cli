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

const path = require('path');
const sinon = require('sinon');

const config = require('config');

const Errors = require('./../../lib/constants').Errors;
const util = require('./../../lib/util');

const command = require('./../fixtures/command.js');
const MockServer = require('./../mock-server');
const fixtureApp = require('./../fixtures/app.json');
const fixtureJob = require('./../fixtures/job.json');
const fixtureInternalDataLink = require('./../fixtures/kinvey-dlc.json');
const helper = require('../tests-helper');

describe('deploy', () => {
  const mockServer = new MockServer(true);
  const sandbox = sinon.sandbox.create();

  const cmdDeployPath = './../../cmd/deploy';

  const defaultExpectedUser = helper.assertions.buildExpectedUser();
  const expectedProjectBeforeDeploy = helper.assertions.buildExpectedProject(fixtureApp.id, null, null, fixtureInternalDataLink.name, fixtureInternalDataLink.id);
  const expectedProjectAfterDeploy = helper.assertions.buildExpectedProject(fixtureApp.id, null, fixtureJob.job, fixtureInternalDataLink.name, fixtureInternalDataLink.id);

  afterEach('generalCleanup', (cb) => {
    sandbox.restore();
    helper.setup.performGeneralCleanup(cb);
  });

  describe('when user and project are already set', () => {
    beforeEach('setupUserAndProject', (cb) => {
      helper.setup.configureUserAndProject(sandbox, mockServer, cb);
    });

    // user's flex service
    describe("user's project is valid", () => {
      it('and valid project setup should initiate deploy', (cb) => {
        mockServer.deployJob();

        require(cmdDeployPath)(command, (err) => {
          expect(err).to.not.exist;
          expect(mockServer.isDone()).to.be.true;

          helper.assertions.assertUserProjectSetup(defaultExpectedUser, expectedProjectAfterDeploy, cb);
        });
      });

      it('and invalid project setup should return error', (cb) => {
        helper.setup.setInvalidProject((err, invalidProjectToRestore) => {
          expect(err).to.not.exist;

          require(cmdDeployPath)(command, (err) => {
            helper.assertions.assertError(err, Errors.ProjectNotConfigured);
            helper.assertions.assertUserProjectSetup(defaultExpectedUser, invalidProjectToRestore, cb);
          });
        });
      });
    });

    describe("user's project is invalid", () => {
      const pathPackageJSON = path.join(config.paths.package, 'package.json');
      let initialPackageSetup;

      before('getInitialPackageSetup', (cb) => {
        util.readJSON(pathPackageJSON, (err, data) => {
          if (err) {
            return cb(err);
          }

          initialPackageSetup = data;
          cb();
        });
      });

      after('restorePackageSetup', (cb) => {
        util.writeJSON(pathPackageJSON, initialPackageSetup, cb);
      });

      it('should return error', (cb) => {
        const invalidPackageContent = { dependencies: {} };

        // mess up user's service - remove kinvey-flex-sdk from dependencies
        util.writeJSON(pathPackageJSON, invalidPackageContent, (err) => {
          expect(err).to.not.exist;

          require(cmdDeployPath)(command, (err) => {
            helper.assertions.assertError(err, Errors.InvalidProject);
            helper.assertions.assertUserProjectSetup(defaultExpectedUser, expectedProjectBeforeDeploy, cb);
          });
        });
      });
    });
  });

  describe('when user and project are not set', () => {
    beforeEach('setupPromptStubs', () => {
      helper.setup.userPromptStubsForSuccess(sandbox);
    });

    it('should set user and return error', (cb) => {
      mockServer.loginWithSuccess();

      require(cmdDeployPath)(command, (err) => {
        helper.assertions.assertError(err, Errors.ProjectNotConfigured);
        expect(mockServer.isDone()).to.be.true;

        helper.assertions.assertUserProjectSetup(defaultExpectedUser, null, cb);
      });
    });
  });
});
