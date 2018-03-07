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
const cloneDeep = require('lodash.clonedeep');

const testsConfig = require('../../../TestsConfig');
const { assertions, getCreatedProfileMessage, runSupposeSequence } = require('../../../TestsHelper');

const { EnvironmentVariables, CommonOptionsNames, FlexOptionsNames, OutputFormat } = require('./../../../../lib/Constants');
const { isEmpty } = require('./../../../../lib/Utils');
const { buildCmd, buildOptions, execCmdWithAssertion, setup } = require('../../../TestsHelper');

const fixtureApp = require('./../../../fixtures/app.json');
const fixtureOrg = require('./../../../fixtures/org.json');


const fixtureUser = require('./../../../fixtures/user.json');
const fixtureServices = require('./../../../fixtures/datalinks.json');

const existentUserOne = fixtureUser.existentOne;
const tokenOne = fixtureUser.tokenOne;
const nonExistentUser = fixtureUser.nonexistent;

const baseCmd = 'flex init';
const outputFile = testsConfig.paths.supposeDebug;

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
  selectService: /Which service would you like to use\?/,
  selectOrganization: /Which organization/
};

const Keys = {
  downArrow: '\u001b[B',
  upArrow: '\u001b[A'
};

const validDomains = {
  app: 'app',
  org: 'org'
};

const defaultProfileName = 'flexListProfile';
const defaultDataLinkName = 'TestKinveyDatalink';
const defaultService = fixtureServices.find(x => x.name === defaultDataLinkName);
const secondDataLinkName = 'TestSecondKinveyDatalink';
const secondService = fixtureServices.find(x => x.name === secondDataLinkName);

const appProjectFlex = assertions.buildExpectedProject(validDomains.app, fixtureApp.id, defaultService.id, defaultService.name);
const expectedAppProject = assertions.buildExpectedProjectSetup(defaultProfileName, appProjectFlex);
const orgProjectFlex = assertions.buildExpectedProject(validDomains.org, fixtureOrg.id, secondService.id, secondService.name);
const expectedOrgProject = assertions.buildExpectedProjectSetup(defaultProfileName, orgProjectFlex);

const secondValidProfileName = 'secondValidProfileName';
const flexInitSuccessMessage = 'Saved configuration.';
const notAuthenticatedMessage = 'You must be authenticated.';
const notFoundProfileErrorMessage = 'Profile not found. Please verify profile name exists.';
const notExistingProfileName = 'NotExistingProfile';


describe(baseCmd, () => {
  const nonExistentEntityId = '123I_DONT_EXIST';
  const validDomainEntityId = fixtureApp.id;

  const validUserForListing = {
    email: existentUserOne.email,
    token: tokenOne
  };

  let ms = {};
  const nodeCommand = 'node';
  const cliPath = path.join('bin', 'kinvey');

  beforeEach((done) => {
    setup.clearAllSetup(done);
  });

  afterEach((done) => {
    setup.clearAllSetup(done);
  });

  afterEach((done) => {
    if (ms.listening) {
      ms.close(() => {
        done();
      });
    } else {
      done();
    }
  });

  describe('App Level Services', () => {

    it('with one not active valid profile should succeed', (done) => {
      setup.createProfiles(defaultProfileName, () => {
        setup.startMockServer(null, (server) => {
          ms = server;
          const sequence = suppose(nodeCommand, [cliPath, 'flex', 'init'], defaultEnvWithDebug)
            .when(Prompt.selectAppOrOrg).respond('\n')
            .when(Prompt.selectApp).respond('\n')
            .when(Prompt.selectService).respond('\n');

          runSupposeSequence(sequence, (error, exitCode) => {
            assertions.assertSuccessfulFlexInitSequence(error, exitCode, expectedAppProject, outputFile, flexInitSuccessMessage, done);
          });
        }, done);
      });
    });

    it('with one active valid profile should succeed', (done) => {
      setup.setActiveProfile(defaultProfileName, true, () => {
        setup.startMockServer(null, (server) => {
          ms = server;
          const sequence = suppose(nodeCommand, [cliPath, 'flex', 'init'], defaultEnvWithDebug)
            .when(Prompt.selectAppOrOrg).respond('\n')
            .when(Prompt.selectApp).respond('\n')
            .when(Prompt.selectService).respond('\n');

          runSupposeSequence(sequence, (error, exitCode) => {
            assertions.assertSuccessfulFlexInitSequence(error, exitCode, expectedAppProject, outputFile, flexInitSuccessMessage, done);
          });
        }, done);
      });
    });

    it('from two profiles should use the active one', (done) => {
      setup.createProfiles(secondValidProfileName, () => {
        setup.setActiveProfile(defaultProfileName, true, () => {
          setup.startMockServer(null, (server) => {
            ms = server;
            const sequence = suppose(nodeCommand, [cliPath, 'flex', 'init'], defaultEnvWithDebug)
              .when(Prompt.selectAppOrOrg).respond('\n')
              .when(Prompt.selectApp).respond('\n')
              .when(Prompt.selectService).respond('\n');

            runSupposeSequence(sequence, (error, exitCode) => {
              assertions.assertSuccessfulFlexInitSequence(error, exitCode, expectedAppProject, outputFile, flexInitSuccessMessage, done);
            });
          }, done);
        });
      });
    });

    it('should use the submitted profile as an option', (done) => {
      setup.createProfiles(defaultProfileName, () => {
        setup.setActiveProfile(secondValidProfileName, true, () => {
          setup.startMockServer(null, (server) => {
            ms = server;
            const sequence = suppose(nodeCommand, [cliPath, 'flex', 'init', '--profile', defaultProfileName], defaultEnvWithDebug)
              .when(Prompt.selectAppOrOrg).respond('\n')
              .when(Prompt.selectApp).respond('\n')
              .when(Prompt.selectService).respond('\n');

            runSupposeSequence(sequence, (error, exitCode) => {
              assertions.assertSuccessfulFlexInitSequence(error, exitCode, expectedAppProject, outputFile, flexInitSuccessMessage, done);
            });
          }, done);
        });
      });
    });

    it('should use the submitted profile as an environment variable', (done) => {
      const envWithProfileVar = {
        env: cloneDeep(defaultEnv),
        debug: fs.createWriteStream(outputFile)
      };
      envWithProfileVar.env[EnvironmentVariables.PROFILE] = defaultProfileName;
      setup.createProfiles(defaultProfileName, () => {
        setup.setActiveProfile(secondValidProfileName, true, () => {
          setup.startMockServer(null, (server) => {
            ms = server;
            const sequence = suppose(nodeCommand, [cliPath, 'flex', 'init'], envWithProfileVar)
              .when(Prompt.selectAppOrOrg).respond('\n')
              .when(Prompt.selectApp).respond('\n')
              .when(Prompt.selectService).respond('\n');

            runSupposeSequence(sequence, (error, exitCode) => {
              assertions.assertSuccessfulFlexInitSequence(error, exitCode, expectedAppProject, outputFile, flexInitSuccessMessage, done);
            });
          }, done);
        });
      });
    });

    it('submitted profile as an option should be used if there is another profile set as an environment variable', (done) => {
      const envWithProfileVar = {
        env: cloneDeep(defaultEnv),
        debug: fs.createWriteStream(outputFile)
      };
      envWithProfileVar.env[EnvironmentVariables.PROFILE] = secondValidProfileName;
      setup.createProfiles(defaultProfileName, () => {
        setup.setActiveProfile(secondValidProfileName, true, () => {
          setup.startMockServer(null, (server) => {
            ms = server;
            const sequence = suppose(nodeCommand, [cliPath, 'flex', 'init', '--profile', defaultProfileName], envWithProfileVar)
              .when(Prompt.selectAppOrOrg).respond('\n')
              .when(Prompt.selectApp).respond('\n')
              .when(Prompt.selectService).respond('\n');

            runSupposeSequence(sequence, (error, exitCode) => {
              assertions.assertSuccessfulFlexInitSequence(error, exitCode, expectedAppProject, outputFile, flexInitSuccessMessage, done);
            });
          }, done);
        });
      });
    });

    it('should return a not authenticated error message if there are no profiles', (done) => {
      setup.startMockServer(null, (server) => {
        ms = server;
        const sequence = suppose(nodeCommand, [cliPath, 'flex', 'init'], defaultEnvWithDebug)
          .when(Prompt.selectAppOrOrg).respond('\n')
          .when(Prompt.selectApp).respond('\n')
          .when(Prompt.selectService).respond('\n');

        runSupposeSequence(sequence, (error, exitCode) => {
          expect(error.message).to.contain(notAuthenticatedMessage);
          expect(exitCode).to.equal(1);
          done();
        });
      }, done);
    });

    it('should return a not authenticated error message if there are more than one not active profiles', (done) => {
      setup.createProfiles([secondValidProfileName, defaultProfileName], () => {
        setup.startMockServer(null, (server) => {
          ms = server;
          const sequence = suppose(nodeCommand, [cliPath, 'flex', 'init'], defaultEnvWithDebug)
            .when(Prompt.selectAppOrOrg).respond('\n')
            .when(Prompt.selectApp).respond('\n')
            .when(Prompt.selectService).respond('\n');

          runSupposeSequence(sequence, (error, exitCode) => {
            expect(error.message).to.contain(notAuthenticatedMessage);
            expect(exitCode).to.equal(1);
            done();
          });
        }, done);
      });
    });

    it('should return a not found error message if a not existing profile is submitted as an option', (done) => {
      setup.createProfiles(defaultProfileName, () => {
        setup.startMockServer(null, (server) => {
          ms = server;
          const sequence = suppose(nodeCommand, [cliPath, 'flex', 'init', '--profile', notExistingProfileName], defaultEnvWithDebug)
            .when(Prompt.selectAppOrOrg).respond('\n')
            .when(Prompt.selectApp).respond('\n')
            .when(Prompt.selectService).respond('\n');

          runSupposeSequence(sequence, (error, exitCode) => {
            expect(error.message).to.contain(notFoundProfileErrorMessage);
            expect(exitCode).to.equal(1);
            done();
          });
        }, done);
      });
    });
  });

  describe('Organization Level Services', () => {
    const orgOptions = { domainType: 'organizations'};

    it('with one not active valid profile should succeed', (done) => {
      setup.createProfiles(defaultProfileName, () => {
        setup.startMockServer(orgOptions, (server) => {
          ms = server;
          const sequence = suppose(nodeCommand, [cliPath, 'flex', 'init'], defaultEnvWithDebug)
            .when(Prompt.selectAppOrOrg).respond(Keys.downArrow).respond('\n')
            .when(Prompt.selectOrganization).respond(Keys.downArrow).respond('\n')
            .when(Prompt.selectService).respond(Keys.downArrow).respond('\n');

          runSupposeSequence(sequence, (error, exitCode) => {
            assertions.assertSuccessfulFlexInitSequence(error, exitCode, expectedOrgProject, outputFile, flexInitSuccessMessage, done);
          });
        }, done);
      });
    });
  });
});
