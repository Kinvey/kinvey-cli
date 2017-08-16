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


//const mockInquirer = require('mock-inquirer');

/*const proxyquire = require('proxyquire');

const pty = require('ptyw.js');
const suppose = require('suppose');

const spawn = require('cross-spawn');
const mockStdin = require('mock-stdin').stdin();

const kinveyCli = require('./../../bin/kinveyCli');*/


const sinon = require('sinon');
const async = require('async');

const configDefault = require('./../../config/default');

const config = require('./../../cmd/config');
const prompt = require('./../../lib/prompt');
const util = require('./../../lib/util');

const command = require('./../fixtures/command.js');
const MockServer = require('./../mock-server');
const fixtureUser = require('./../fixtures/user.json');
const fixtureApps = require('./../fixtures/apps.json');
const fixtureApp = require('./../fixtures/app.json');
const fixtureInternalDataLink = require('./../fixtures/kinvey-dlc.json');
const helperMocks = require('./../helper').mocks;

function setupPromptStubsForSuccess(sandbox) {
  sandbox.stub(prompt, 'getEmailPassword').callsArgWith(2, null, fixtureUser.existent.email, fixtureUser.existent.password);


  sandbox.stub(prompt, 'getAppOrOrg').callsArgWith(1, null, { name: 'App' });
  // verify getAppOrOrg is called with options

  sandbox.stub(prompt, 'getApp').callsArgWith(1, null, fixtureApp);
  // verify getApp is called with fixture apps

  sandbox.stub(prompt, 'getService').callsArgWith(1, null, fixtureInternalDataLink);
  // verify called with array, len=1
}

// TODO: decide what exactly do I need here, do I really need to check it
function assertPromptStubsForSuccess() {
  expect(prompt.getEmailPassword).to.be.calledOnce;
  // verify not called with email and pass
  const emailPassCalls = (prompt.getEmailPassword).getCalls();
  expect(helperMocks.getStubCallArg(emailPassCalls, 0, 0)).to.not.exist;
  expect(helperMocks.getStubCallArg(emailPassCalls, 0, 1)).to.not.exist;
}

function assertUserProjectSetup(expectedUser, expectedProject, cb) {
  async.series(
    [
      function verifyUser(next) {
        util.readJSON(configDefault.paths.session, (err, actualUser) => {
          if (err) {
            return next(err);
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
      // {"app":"123","org":null,"lastJobId":null,"serviceName":"TestKinveyDatalink","schemaVersion":2}
        // TODO: well... verify
        next();
      }
    ],
    cb
  );
}

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

describe('without explicit args', () => {
  const mockServer = new MockServer(true);
  const sandbox = sinon.sandbox.create();

  beforeEach(() => {
    setupPromptStubsForSuccess(sandbox);
  });

  afterEach((done) => {
    sandbox.reset();

    MockServer.clearAll();

    clearUserProjectSetup(done);
  });

  after(() => {
    sandbox.restore();
  });

  it('with valid input should set user and project', (cb) => {
    mockServer.login();
    mockServer.apps();
    mockServer.dataLinks();

    config(null, command, (err) => {
      expect(err).to.not.exist;
      assertPromptStubsForSuccess();

      const expectedUser = { host: configDefault.host };
      const expectedProject = {
        app: fixtureApp.id,
        org: null,
        lastJobId: null,
        serviceName: fixtureInternalDataLink.name,
        schemaVersion: configDefault.defaultSchemaVersion
      };
      assertUserProjectSetup(expectedUser, expectedProject, cb);
    });
  });
});