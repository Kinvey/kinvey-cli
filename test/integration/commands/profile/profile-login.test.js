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

const fs = require('fs');
const path = require('path');

const async = require('async');
const suppose = require('suppose');

const { ActiveItemType, Namespace, PromptMessages } = require('./../../../../lib/Constants');
const testsConfig = require('../../../TestsConfig');
const { assertions, runSupposeSequence, setup, testers } = require('../../../TestsHelper');
const fixtureApp = require('./../../../fixtures/app.json');
const fixtureUser = require('./../../../fixtures/user.json');
const mockServer = require('../../../mockServer');

const existentUser = fixtureUser.existent;

const baseCmd = `${Namespace.PROFILE} login`;

function testProfileLogin(options, flags, identifier, done) {
  testers.execCmdWithIdentifier(baseCmd, options, flags, identifier, null, done);
}

describe(baseCmd, () => {
  const jsonOptions = testers.getJsonOptions();
  const defaultFlags = testers.getDefaultFlags();

  before((done) => {
    setup.clearGlobalSetup(null, done);
  });

  after((done) => {
    setup.clearGlobalSetup(null, done);
  });

  describe('without active profile', () => {
    const noSpecifiedProfile = null;

    describe('when no profiles', () => {
      before((done) => {
        setup.clearGlobalSetup(null, done);
      });

      it('and none specified should fail', (done) => {
        testProfileLogin(null, defaultFlags, noSpecifiedProfile, done);
      });
    });

    describe('when several profiles', () => {
      const specifiedProfile = 'two';

      before((done) => {
        setup.createProfiles(['one', specifiedProfile], done);
      });

      after((done) => {
        setup.clearGlobalSetup(null, done);
      });

      it('and none specified should fail', (done) => {
        testProfileLogin(null, defaultFlags, noSpecifiedProfile, done);
      });

      it('and non-existent specified should fail', (done) => {
        testProfileLogin(null, defaultFlags, 'noSuchProfile', done);
      });

      it('and non-existent specified should fail', (done) => {
        testProfileLogin(null, defaultFlags, 'noSuchProfile', done);
      });
    });
  });

  describe('with active profile', () => {
    const activeProfile = 'activeProfile';
    const activeItemOnProfile = { id: fixtureApp.id };
    let ms = {};

    before((done) => {
      async.series([
        (next) => {
          setup.createProfiles(['one'], next);
        },
        (next) => {
          setup.setActiveProfile(activeProfile, true, next);
        },
        (next) => {
          setup.setActiveItemOnProfile(activeProfile, ActiveItemType.APP, activeItemOnProfile, null, next);
        }
      ], done);
    });

    before((done) => {
      mockServer(null, (err, server) => {
        if (err) {
          return done(err);
        }

        ms = server;
        return done();
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

    it('should succeed', (done) => {
      const outputFilePath = testsConfig.paths.supposeDebug;

      async.series([
        (next) => {
          const env = {
            NODE_CONFIG: JSON.stringify(testsConfig),
            PATH: process.env.PATH
          };

          const cliPath = path.join('bin', 'kinvey');
          const promptMsg = new RegExp(`\\? ${PromptMessages.INPUT_EMAIL}: ${existentUser.email}(\n)*${PromptMessages.INPUT_PASSWORD} `);
          const sequence = suppose('node', [cliPath, Namespace.PROFILE, 'login'], { env, debug: fs.createWriteStream(outputFilePath) })
            .when(promptMsg)
            .respond(`${existentUser.password}\n`);

          runSupposeSequence(sequence, (err, exitCode) => {
            expect(err).to.not.exist;
            expect(exitCode).to.equal(0);
            next();
          });
        },
        (next) => {
          const expectedFinalOutput = `Updated profile: ${activeProfile}`;
          assertions.assertFileContainsString(outputFilePath, expectedFinalOutput, next);
        },
        (next) => {
          // verify active app is not removed from profile
          const expectedActive = { [ActiveItemType.APP]: activeItemOnProfile };
          assertions.assertActiveItemsOnProfile(expectedActive, activeProfile, null, next);
        }
      ], done);
    });
  });
});
