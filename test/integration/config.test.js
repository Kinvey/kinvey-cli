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

const sinon = require('sinon');

const Errors = require('./../../lib/constants').Errors;
const prompt = require('./../../lib/prompt');

const command = require('./../fixtures/command.js');
const MockServer = require('./../mock-server');
const fixtureUser = require('./../fixtures/user.json');
const fixtureApp = require('./../fixtures/app.json');
const fixtureInternalDataLink = require('./../fixtures/kinvey-dlc.json');
const helper = require('../tests-helper');

function assertPromptStubsForSuccess(verifyServicePrompt = true) {
  // verify user is prompted for credentials just once
  expect(prompt.getEmailPassword).to.be.calledOnce;

  // verify method not called with email and pass
  const emailPassCalls = (prompt.getEmailPassword).getCalls();
  expect(helper.mocks.getStubCallArg(emailPassCalls, 0, 0)).to.not.exist;
  expect(helper.mocks.getStubCallArg(emailPassCalls, 0, 1)).to.not.exist;

  if (verifyServicePrompt) {
    // verify user is prompted for service selection just once
    expect(prompt.getService).to.be.calledOnce;

    const getServiceCalls = (prompt.getService).getCalls();
    const services = helper.mocks.getStubCallArg(getServiceCalls, 0, 0);
    expect(services).to.be.an.array;

    // verify user can choose only from Flex services and no other
    let containsOnlyFlexServices = true;
    services.forEach(x => {
      if (x.type !== 'internal') {
        containsOnlyFlexServices = false;
      }
    });

    expect(containsOnlyFlexServices, 'User must choose only from Flex services.').to.equal(true);
  }
}

// Requires 'cmd/config' for each test to ensure that tests are independent.
describe('config', () => {
  const mockServer = new MockServer(true);

  const defaultExpectedUser = helper.assertions.buildExpectedUser();
  const defaultExpectedProject = helper.assertions.buildExpectedProject(fixtureApp.id, null, null, fixtureInternalDataLink.name, fixtureInternalDataLink.id);

  const sandbox = sinon.sandbox.create();
  const cmdConfigPath = './../../cmd/config';

  afterEach('generalCleanup', (done) => {
    sandbox.reset();
    helper.setup.performGeneralCleanup(done);
  });

  after('cleanupStubs', () => {
    sandbox.restore();
  });

  describe('without explicit args and from prompts', () => {
    before(() => {
      helper.setup.userProjectPromptStubsForSuccess(sandbox);
    });

    after(() => {
      sandbox.restore();
    });

    // valid input means user, password and project selection
    it('with valid input and no 2FA required should set user and project', (cb) => {
      mockServer.loginWithSuccess();
      mockServer.apps();
      mockServer.dataLinks();

      require(cmdConfigPath)(null, command, (err) => {
        expect(err).to.not.exist;
        assertPromptStubsForSuccess();
        expect(mockServer.isDone()).to.be.true;
        helper.assertions.assertUserProjectSetup(defaultExpectedUser, defaultExpectedProject, cb);
      });
    });

    // Scenario: CLI prompts for email and password. Verified but 2FA is on. Prompts for 2FA token - a wrong one is entered.
    // Prompts again for token - provide a correct token. Provide correct project info.
    // Expects user and project to be set properly.
    it('with valid input and 2FA required should set user and project', (cb) => {
      mockServer.loginWithTwoFactorAuthFail();
      mockServer.loginWithSuccess(fixtureUser.existentWith2FA);

      mockServer.apps();
      mockServer.dataLinks();

      const twoFactorTokenStub = sandbox.stub(prompt, 'getTwoFactorToken');
      twoFactorTokenStub.callsArgWith(1, null, fixtureUser.invalidTwoFactorToken);
      twoFactorTokenStub.callsArgWith(1, null, fixtureUser.validTwoFactorToken);

      require(cmdConfigPath)(null, command, (err) => {
        expect(err).to.not.exist;
        assertPromptStubsForSuccess();
        expect(mockServer.isDone()).to.be.true;
        helper.assertions.assertUserProjectSetup(defaultExpectedUser, defaultExpectedProject, cb);
      });
    });

    // User/session info must be set even though no internal dataLinks (Flex services) are found.
    it('with valid input and no Flex services created should set user and return error', (cb) => {
      mockServer.loginWithSuccess();
      mockServer.apps();
      mockServer.dataLinks([]);

      require(cmdConfigPath)(null, command, (err) => {
        helper.assertions.assertError(err, Errors.NoFlexServicesFound);
        assertPromptStubsForSuccess(false);

        expect(mockServer.isDone()).to.be.true;

        const expectedProject = null;
        helper.assertions.assertUserProjectSetup(defaultExpectedUser, expectedProject, cb);
      });
    });
  });

  describe('without explicit args and credentials from environment', () => {
    before(() => {
      helper.setup.projectPromptStubsForSuccess(sandbox);
    });

    afterEach(() => {
      helper.env.unsetCredentials();
    });

    after(() => {
      sandbox.restore();
    });

    it('with valid project input and valid credentials should set user and project', (cb) => {
      mockServer.loginWithSuccess();
      mockServer.apps();
      mockServer.dataLinks();

      helper.env.setCredentials(fixtureUser.existent.email, fixtureUser.existent.password);

      require(cmdConfigPath)(null, command, (err) => {
        expect(err).to.not.exist;
        expect(mockServer.isDone()).to.be.true;
        helper.assertions.assertUserProjectSetup(defaultExpectedUser, defaultExpectedProject, cb);
      });
    });

    // TODO: The config command should fail right after credentials turn out to be invalid. But a few more requests are
    // made and that's why the test fails. Probably, a fix should be applied to the code.
    it.skip('with invalid credentials should not prompt and return error', (cb) => {
      mockServer.loginWithFail(fixtureUser.nonexistent);
      helper.env.setCredentials(fixtureUser.nonexistent.email, fixtureUser.nonexistent.password);

      require(cmdConfigPath)(null, command, (err) => {
        expect(err).to.exist;
        expect(err.name).to.equal('InvalidCredentials');
        expect(mockServer.isDone()).to.be.true;
        helper.assertions.assertUserProjectSetup(null, null, cb);
      });
    });
  });

  describe('with explicit args', () => {
    before(() => {
      helper.setup.projectPromptStubsForSuccess(sandbox);
    });

    after(() => {
      sandbox.restore();
    });

    // simulates `kinvey config -e kinveyAccount@kinvey.com -p yourKinveyPassword --host https://host:123`
    it('with valid email, password and host as options should set user and project', (cb) => {
      const host = 'https://host:123';
      const expectedHost = `${host}/`;
      const customHostMockServer = new MockServer(true, expectedHost);
      customHostMockServer.loginWithSuccess();
      customHostMockServer.apps();
      customHostMockServer.dataLinks();

      const commandMock = {
        opts: () => {},
        parent: {
          opts: () => {
            return {
              host,
              email: fixtureUser.existent.email,
              password: fixtureUser.existent.password
            };
          }
        }
      };

      require(cmdConfigPath)(null, commandMock, (err) => {
        expect(err).to.not.exist;

        expect(customHostMockServer.isDone()).to.be.true;

        const expectedUser = helper.assertions.buildExpectedUser(expectedHost);
        helper.assertions.assertUserProjectSetup(expectedUser, defaultExpectedProject, cb);
      });
    });
  });
});
