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

const path = require('path');
const fs = require('fs');

const suppose = require('suppose');
const cloneDeep = require('lodash.clonedeep');

const { Command, DomainTypes, PromptMessages, EntityType, OperationMessage, Errors, AuthOptionsNames, EnvironmentVariables, SubCommand, Namespace } = require('../../../../lib/Constants');
const testsConfig = require('../../../TestsConfig');
const { assertions, setup, runSupposeSequence } = require('../../../TestsHelper');
const mockServer = require('../../../mockServer');

const fixtureApp = require('./../../../fixtures/app.json');
const fixtureOrg = require('./../../../fixtures/org.json');
const fixtureServices = require('./../../../fixtures/datalinks.json');
const fixtureSvcEnvsOne = require('./../../../fixtures/svc-envs-one.json');
const fixtureSvcEnvsSeveral = require('./../../../fixtures/svc-envs-several.json');

const baseCmd = Command.FLEX_INIT;
const outputFile = testsConfig.paths.supposeDebug;

const defaultEnv = {
  NODE_CONFIG: JSON.stringify(testsConfig),
  PATH: process.env.PATH
};

const defaultEnvWithDebug = {
  env: defaultEnv,
  debug: fs.createWriteStream(outputFile)
};

const Prompt = {
  selectOrganization: new RegExp(PromptMessages.INPUT_ORG),
  selectService: new RegExp(PromptMessages.INPUT_SPECIFIC_SERVICE),
  selectSvcEnv: new RegExp(PromptMessages.INPUT_SPECIFIC_SVC_ENV)
};

const Keys = {
  downArrow: '\u001b[B',
  upArrow: '\u001b[A'
};

const defaultProfileName = 'flexListProfile';
const defaultDataLinkName = 'TestKinveyDatalink';
const defaultService = fixtureServices.find(x => x.name === defaultDataLinkName);

const defaultSvcEnvId = fixtureSvcEnvsOne[0].id;

const orgProjectFlex = assertions.buildExpectedProject(DomainTypes.ORG, fixtureOrg.id, defaultService.id, defaultService.name, defaultSvcEnvId);
const expectedOrgProject = assertions.buildExpectedProjectSetup(defaultProfileName, orgProjectFlex);


const flexInitSuccessMessage = `${OperationMessage.save} ${EntityType.CONFIGURATION}.`;
const notFoundProfileErrorMessage = Errors.ProfileNotFound.MESSAGE;
const secondValidProfileName = 'secondValidProfileName';
const notAuthenticatedMessage = 'You must be authenticated.';
const notExistingProfileName = 'NotExistingProfile';

const nodeCommand = 'node';
const cliPath = path.join('bin', 'kinvey');
const defaultFlexInitOptions = [cliPath, Namespace.FLEX, SubCommand[Namespace.FLEX].INIT];
const profileEnvVarName = EnvironmentVariables.PROFILE;

const buildSupposeFlexInitSequence = (paramsArray, environment) => {
  const sequence = suppose(nodeCommand, paramsArray, environment)
    .when(Prompt.selectOrganization)
    .respond('\n')
    .when(Prompt.selectService)
    .respond('\n');

  return sequence;
};

const buildProfileOptions = (baseOptions, profileName) => {
  const profileOptions = cloneDeep(baseOptions);
  profileOptions.push(`--${AuthOptionsNames.PROFILE}`, profileName);
  return profileOptions;
};

describe(baseCmd, () => {
  let ms = {};

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

  describe('Organization Level Services', () => {
    const orgOptions = { domainType: 'organizationId', domainEntityId: fixtureOrg.id };

    it('with one not active valid profile should succeed', (done) => {
      setup.createProfiles(defaultProfileName, (err) => {
        expect(err).to.not.exist;
        mockServer(orgOptions, (err, server) => {
          expect(err).to.not.exist;
          ms = server;
          const sequence = buildSupposeFlexInitSequence(defaultFlexInitOptions, defaultEnvWithDebug);
          runSupposeSequence(sequence, (error, exitCode) => {
            assertions.assertSuccessfulFlexInitSequence(error, exitCode, expectedOrgProject, outputFile, flexInitSuccessMessage, done);
          });
        });
      });
    });

    it('with one active valid profile should succeed', (done) => {
      setup.setActiveProfile(defaultProfileName, true, (err) => {
        expect(err).to.not.exist;
        mockServer(orgOptions, (err, server) => {
          expect(err).to.not.exist;
          ms = server;
          const sequence = buildSupposeFlexInitSequence(defaultFlexInitOptions, defaultEnvWithDebug);

          runSupposeSequence(sequence, (error, exitCode) => {
            assertions.assertSuccessfulFlexInitSequence(error, exitCode, expectedOrgProject, outputFile, flexInitSuccessMessage, done);
          });
        });
      });
    });

    it('with one active valid profile and a few svc envs to choose from should succeed', (done) => {
      setup.setActiveProfile(defaultProfileName, true, (err) => {
        expect(err).to.not.exist;
        mockServer({ domainType: 'organizationId', domainEntityId: fixtureOrg.id, svcEnvs: fixtureSvcEnvsSeveral }, (err, server) => {
          expect(err).to.not.exist;
          ms = server;
          const sequence = suppose(nodeCommand, defaultFlexInitOptions, defaultEnvWithDebug)
            .when(Prompt.selectOrganization)
            .respond('\n')
            .when(Prompt.selectService)
            .respond('\n')
            .when(Prompt.selectSvcEnv)
            .respond(Keys.downArrow)
            .respond('\n');

          const svcEnvId = fixtureSvcEnvsSeveral[1].id;
          const expectedFlexNs = assertions.buildExpectedProject(DomainTypes.ORG, fixtureOrg.id, defaultService.id, defaultService.name, svcEnvId);
          const expectedProjectSetup = assertions.buildExpectedProjectSetup(defaultProfileName, expectedFlexNs);

          runSupposeSequence(sequence, (error, exitCode) => {
            assertions.assertSuccessfulFlexInitSequence(error, exitCode, expectedProjectSetup, outputFile, flexInitSuccessMessage, done);
          });
        });
      });
    });

    it('with one active valid profile and no svc envs to choose from should fail', (done) => {
      setup.setActiveProfile(defaultProfileName, true, (err) => {
        expect(err).to.not.exist;
        mockServer({ domainType: 'organizationId', domainEntityId: fixtureOrg.id, svcEnvs: [] }, (err, server) => {
          expect(err).to.not.exist;
          ms = server;

          const sequence = buildSupposeFlexInitSequence(defaultFlexInitOptions, defaultEnvWithDebug);

          runSupposeSequence(sequence, (error, exitCode) => {
            const expErrMsg = Errors.NoScvEnvFound.MESSAGE;
            assertions.assertSupposeError(error, exitCode, expErrMsg, 1);
            done();
          });
        });
      });
    });

    it('with one active valid profile and no services to choose from should fail', (done) => {
      setup.setActiveProfile(defaultProfileName, true, (err) => {
        expect(err).to.not.exist;
        mockServer({ domainType: 'organizationId', domainEntityId: 'withoutServices' }, (err, server) => {
          expect(err).to.not.exist;
          ms = server;

          const sequence = buildSupposeFlexInitSequence(defaultFlexInitOptions, defaultEnvWithDebug);

          runSupposeSequence(sequence, (error, exitCode) => {
            const expErrMsg = Errors.NoFlexServicesFound.MESSAGE;
            assertions.assertSupposeError(error, exitCode, expErrMsg, 1);
            done();
          });
        });
      });
    });

    it('with one active valid profile and no orgs to choose from should fail', (done) => {
      setup.setActiveProfile(defaultProfileName, true, (err) => {
        expect(err).to.not.exist;
        mockServer({ orgs: [] }, (err, server) => {
          expect(err).to.not.exist;
          ms = server;

          const sequence = buildSupposeFlexInitSequence(defaultFlexInitOptions, defaultEnvWithDebug);

          runSupposeSequence(sequence, (error, exitCode) => {
            const expErrMsg = Errors.NoOrgsFound.MESSAGE;
            assertions.assertSupposeError(error, exitCode, expErrMsg, 1);
            done();
          });
        });
      });
    });

    it('from two profiles should use the active one', (done) => {
      setup.createProfiles(secondValidProfileName, (err) => {
        expect(err).to.not.exist;
        setup.setActiveProfile(defaultProfileName, true, (err) => {
          expect(err).to.not.exist;
          mockServer(orgOptions, (err, server) => {
            expect(err).to.not.exist;
            ms = server;
            const sequence = buildSupposeFlexInitSequence(defaultFlexInitOptions, defaultEnvWithDebug);

            runSupposeSequence(sequence, (error, exitCode) => {
              assertions.assertSuccessfulFlexInitSequence(error, exitCode, expectedOrgProject, outputFile, flexInitSuccessMessage, done);
            });
          });
        });
      });
    });

    it('should use the submitted profile as an option', (done) => {
      setup.createProfiles(defaultProfileName, (err) => {
        expect(err).to.not.exist;
        setup.setActiveProfile(secondValidProfileName, true, (err) => {
          expect(err).to.not.exist;
          mockServer(orgOptions, (err, server) => {
            expect(err).to.not.exist;
            ms = server;
            const profileOptions = buildProfileOptions(defaultFlexInitOptions, defaultProfileName);
            const sequence = buildSupposeFlexInitSequence(profileOptions, defaultEnvWithDebug);

            runSupposeSequence(sequence, (error, exitCode) => {
              assertions.assertSuccessfulFlexInitSequence(error, exitCode, expectedOrgProject, outputFile, flexInitSuccessMessage, done);
            });
          });
        });
      });
    });

    it('should use the submitted profile as an environment variable', (done) => {
      const envWithProfileVar = {
        env: cloneDeep(defaultEnv),
        debug: fs.createWriteStream(outputFile)
      };
      envWithProfileVar.env[profileEnvVarName] = defaultProfileName;
      setup.createProfiles(defaultProfileName, (err) => {
        expect(err).to.not.exist;
        setup.setActiveProfile(secondValidProfileName, true, (err) => {
          expect(err).to.not.exist;
          mockServer(orgOptions, (err, server) => {
            expect(err).to.not.exist;
            ms = server;
            const sequence = buildSupposeFlexInitSequence(defaultFlexInitOptions, envWithProfileVar);

            runSupposeSequence(sequence, (error, exitCode) => {
              assertions.assertSuccessfulFlexInitSequence(error, exitCode, expectedOrgProject, outputFile, flexInitSuccessMessage, done);
            });
          });
        });
      });
    });

    it('submitted profile as an option should be used if there is another profile set as an environment variable', (done) => {
      const envWithProfileVar = {
        env: cloneDeep(defaultEnv),
        debug: fs.createWriteStream(outputFile)
      };
      envWithProfileVar.env[profileEnvVarName] = secondValidProfileName;
      setup.createProfiles(defaultProfileName, (err) => {
        expect(err).to.not.exist;
        setup.setActiveProfile(secondValidProfileName, true, (err) => {
          expect(err).to.not.exist;
          mockServer(orgOptions, (err, server) => {
            expect(err).to.not.exist;
            ms = server;

            const profileOptions = buildProfileOptions(defaultFlexInitOptions, defaultProfileName);
            const sequence = buildSupposeFlexInitSequence(profileOptions, envWithProfileVar);

            runSupposeSequence(sequence, (error, exitCode) => {
              assertions.assertSuccessfulFlexInitSequence(error, exitCode, expectedOrgProject, outputFile, flexInitSuccessMessage, done);
            });
          });
        });
      });
    });

    it('should return a not authenticated error message if there are no profiles', (done) => {
      mockServer(null, (err, server) => {
        expect(err).to.not.exist;
        ms = server;
        const sequence = buildSupposeFlexInitSequence(defaultFlexInitOptions, defaultEnvWithDebug);

        runSupposeSequence(sequence, (error, exitCode) => {
          assertions.assertSupposeError(error, exitCode, notAuthenticatedMessage, 1);
          done();
        });
      });
    });

    it('should return a not authenticated error message if there are more than one not active profiles', (done) => {
      setup.createProfiles([secondValidProfileName, defaultProfileName], (err) => {
        expect(err).to.not.exist;
        mockServer(null, (err, server) => {
          expect(err).to.not.exist;
          ms = server;
          const sequence = buildSupposeFlexInitSequence(defaultFlexInitOptions, defaultEnvWithDebug);

          runSupposeSequence(sequence, (error, exitCode) => {
            assertions.assertSupposeError(error, exitCode, notAuthenticatedMessage, 1);
            done();
          });
        });
      });
    });

    it('should return a not found error message if a not existing profile is submitted as an option', (done) => {
      setup.createProfiles(defaultProfileName, (err) => {
        expect(err).to.not.exist;
        mockServer(null, (err, server) => {
          expect(err).to.not.exist;
          ms = server;
          const profileOptions = buildProfileOptions(defaultFlexInitOptions, notExistingProfileName);
          const sequence = buildSupposeFlexInitSequence(profileOptions, defaultEnvWithDebug);

          runSupposeSequence(sequence, (error, exitCode) => {
            assertions.assertSupposeError(error, exitCode, notFoundProfileErrorMessage, 1);
            done();
          });
        });
      });
    });
  });
});
