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
const async = require('async');

const configDefault = require('./../../config/default');

const prompt = require('./../../lib/prompt');
const util = require('./../../lib/util');

const command = require('./../fixtures/command.js');
const MockServer = require('./../mock-server');
const fixtureUser = require('./../fixtures/user.json');
const fixtureApps = require('./../fixtures/apps.json');
const fixtureApp = require('./../fixtures/app.json');
const fixtureInternalDataLink = require('./../fixtures/kinvey-dlc.json');
const helperMocks = require('./../helper').mocks;
const helperEnv = require('./../helper').env;

function setupPromptStubsForSuccess(sandbox) {
  sandbox.stub(prompt, 'getEmailPassword').callsArgWith(2, null, fixtureUser.existent.email, fixtureUser.existent.password);

  setupProjectPromptStubsForSuccess(sandbox);
}

function setupProjectPromptStubsForSuccess(sandbox) {
  sandbox.stub(prompt, 'getAppOrOrg').callsArgWith(1, null, { name: 'App' });
  sandbox.stub(prompt, 'getApp').callsArgWith(1, null, fixtureApp);
  sandbox.stub(prompt, 'getService').callsArgWith(1, null, fixtureInternalDataLink);
}

function assertPromptStubsForSuccess(verifyServicePrompt = true) {
  // verify user is prompted for credentials just once
  expect(prompt.getEmailPassword).to.be.calledOnce;

  // verify method not called with email and pass
  const emailPassCalls = (prompt.getEmailPassword).getCalls();
  expect(helperMocks.getStubCallArg(emailPassCalls, 0, 0)).to.not.exist;
  expect(helperMocks.getStubCallArg(emailPassCalls, 0, 1)).to.not.exist;

  if (verifyServicePrompt) {
    // verify user is prompted for service selection just once
    expect(prompt.getService).to.be.calledOnce;

    const getServiceCalls = (prompt.getService).getCalls();
    const services = helperMocks.getStubCallArg(getServiceCalls, 0, 0);
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

function buildExpectedProject(appId, org, lastJobId, serviceName, schemaVersion = configDefault.defaultSchemaVersion) {
  return {
    org,
    lastJobId,
    serviceName,
    schemaVersion,
    app: appId
  };
}

// Asserts that the saved session(user) and the saved project are as expected.
function assertUserProjectSetup(expectedUser, expectedProject, cb) {
  async.series(
    [
      function verifyUser(next) {
        util.readJSON(configDefault.paths.session, (err, actualUser) => {
          if (err) {
            return next(err);
          }

          if (!expectedUser) {
            expect(actualUser).to.equal('');
            return next();
          }

          const host = expectedUser.host;
          expect(actualUser.host).to.equal(host);

          if (expectedUser.tokens) {
            expect(actualUser.tokens).to.exist;
            expect(actualUser.tokens[host]).to.exist.and.to.equal(expectedUser.tokens[host]);
          }

          next();
        });
      },
      function verifyProject(next) {
        util.readJSON(configDefault.paths.project, (err, actualProject) => {
          if (err) {
            return next(err);
          }

          if (!expectedProject) {
            expect(actualProject).to.equal('');
            return next();
          }

          let discrepancy;
          for (let prop in expectedProject) {
            let actualValue = actualProject[prop];
            let expectedValue = expectedProject[prop];
            if (actualValue !== expectedValue) {
              discrepancy = `Expected: ${expectedValue}. Actual: ${actualValue}.`;
              break;
            }
          }

          expect(discrepancy).to.not.exist;

          next();
        });
      }
    ],
    cb
  );
}

// Clears content in session and project files.
function clearUserProjectSetup(cb) {
  async.series(
    [
      function clearUser(next) {
        util.writeJSON(configDefault.paths.session, '', next);
      },
      function clearProject(next) {
        util.writeJSON(configDefault.paths.project, '', next);
      }
    ],
    cb
  );
}

// Ensure modules are reloaded every time and tests are independent (e.g class User -> this.token will be cleared).
function clearRequireCache() {
  delete require.cache[require.resolve('./../../lib/user')];
  delete require.cache[require.resolve('./../../lib/project')];
  delete require.cache[require.resolve('./../../cmd/config')];
}

// Requires 'cmd/config' for each test to ensure that tests are independent.
describe('config', () => {
  const mockServer = new MockServer(true);
  const defaultExpectedUser = {
    host: configDefault.host,
    tokens: {
      [configDefault.host]: fixtureUser.token
    }
  };
  const defaultExpectedProject = buildExpectedProject(fixtureApp.id, null, null, fixtureInternalDataLink.name);

  const sandbox = sinon.sandbox.create();

  afterEach((done) => {
    sandbox.reset();

    MockServer.clearAll();

    clearRequireCache();

    clearUserProjectSetup(done);
  });

  after(() => {
    sandbox.restore();
  });

  describe('without explicit args and from prompts', () => {
    before(() => {
      setupPromptStubsForSuccess(sandbox);
    });

    after(() => {
      sandbox.restore();
    });

    // valid input means user, password and project selection
    it('with valid input and no 2FA required should set user and project', (cb) => {
      mockServer.loginForSuccess();
      mockServer.apps();
      mockServer.dataLinks();

      require('./../../cmd/config')(null, command, (err) => {
        expect(err).to.not.exist;
        assertPromptStubsForSuccess();
        expect(mockServer.isDone()).to.be.true;
        assertUserProjectSetup(defaultExpectedUser, defaultExpectedProject, cb);
      });
    });

    // Scenario: CLI prompts for email and password. Verified but 2FA is on. Prompts for 2FA token - a wrong one is entered.
    // Prompts again for token - provide a correct token. Provide correct project info.
    // Expects user and project to be set properly.
    it('with valid input and 2FA required should set user and project', (cb) => {
      mockServer.loginWithTwoFactorAuthFail();
      mockServer.loginForSuccess(fixtureUser.existentWith2FA);

      mockServer.apps();
      mockServer.dataLinks();

      const twoFactorTokenStub = sandbox.stub(prompt, 'getTwoFactorToken');
      twoFactorTokenStub.callsArgWith(1, null, fixtureUser.invalidTwoFactorToken);
      twoFactorTokenStub.callsArgWith(1, null, fixtureUser.validTwoFactorToken);

      require('./../../cmd/config')(null, command, (err) => {
        expect(err).to.not.exist;
        assertPromptStubsForSuccess();
        expect(mockServer.isDone()).to.be.true;
        assertUserProjectSetup(defaultExpectedUser, defaultExpectedProject, cb);
      });
    });

    // User/session info must be set even though no internal dataLinks (Flex services) are found.
    it('with valid input and no Flex services created should set user and return error', (cb) => {
      mockServer.loginForSuccess();
      mockServer.apps();
      mockServer.dataLinks(fixtureApp.id, []);

      require('./../../cmd/config')(null, command, (err) => {
        expect(err).to.exist;
        expect(err.name).to.equal('NoFlexServicesFound');
        assertPromptStubsForSuccess(false);

        expect(mockServer.isDone()).to.be.true;

        const expectedProject = null;
        assertUserProjectSetup(defaultExpectedUser, expectedProject, cb);
      });
    });
  });

  describe('without explicit args and credentials from environment', () => {
    before(() => {
      setupProjectPromptStubsForSuccess(sandbox);
    });

    afterEach(() => {
      helperEnv.unsetCredentials();
    });

    after(() => {
      sandbox.restore();
    });

    it('with valid project input and valid credentials should set user and project', (cb) => {
      mockServer.loginForSuccess();
      mockServer.apps();
      mockServer.dataLinks();

      helperEnv.setCredentials(fixtureUser.existent.email, fixtureUser.existent.password);

      require('./../../cmd/config')(null, command, (err) => {
        expect(err).to.not.exist;
        expect(mockServer.isDone()).to.be.true;
        assertUserProjectSetup(defaultExpectedUser, defaultExpectedProject, cb);
      });
    });

    // TODO: The config command should fail right after credentials turn out to be invalid. But a few more requests are
    // made and that's why the test fails. Probably, a fix should be applied to the code.
    it.skip('with invalid credentials should not prompt and return error', (cb) => {
      mockServer.loginForFail(fixtureUser.nonexistent);
      helperEnv.setCredentials(fixtureUser.nonexistent.email, fixtureUser.nonexistent.password);

      require('./../../cmd/config')(null, command, (err) => {
        expect(err).to.exist;
        expect(err.name).to.equal('InvalidCredentials');
        expect(mockServer.isDone()).to.be.true;
        assertUserProjectSetup(null, null, cb);
      });
    });
  });

  describe('with explicit args', () => {
    before(() => {
      setupProjectPromptStubsForSuccess(sandbox);
    });

    after(() => {
      sandbox.restore();
    });

    // simulates `kinvey config -e kinveyAccount@kinvey.com -p yourKinveyPassword --host https://host:123`
    it('with valid email, password and host as options should set user and project', (cb) => {
      const host = 'https://host:123';
      const expectedHost = `${host}/`;
      const customHostMockServer = new MockServer(true, expectedHost);
      customHostMockServer.loginForSuccess();
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
            }
          }
        }
      };

      require('./../../cmd/config')(null, commandMock, (err) => {
        expect(err).to.not.exist;

        expect(customHostMockServer.isDone()).to.be.true;

        const expectedUser = {
          host: expectedHost,
          tokens: {
            [expectedHost]: fixtureUser.token
          }
        };
        assertUserProjectSetup(expectedUser, defaultExpectedProject, cb);
      });
    });
  });
});