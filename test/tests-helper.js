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
const inquirer = require('inquirer');
const snapshot = require('snap-shot-it');
const stripAnsi = require('strip-ansi');

const childProcess = require('child_process');

const { AuthOptionsNames, EnvironmentVariables } = require('./../lib/constants');
//const config = require('config');
const logger = require('../lib/logger');
// const prompt = require('./../lib/prompt');
const { isEmpty, isNullOrUndefined, readJSON, writeJSON } = require('../lib/utils');

const fixtureUser = require('./fixtures/user.json');
const fixtureApp = require('./fixtures/app.json');
const fixtureInternalDataLink = require('./fixtures/kinvey-dlc.json');
const fixtureJob = require('./fixtures/job.json');
const testsConfig = require('./tests-config');
const mockServer = require('./mock-server');

const existentUser = fixtureUser.existent;
const globalSetupPath = testsConfig.paths.session;
const projectPath = testsConfig.paths.project;

const helper = {};

helper.assertions = {
  assertCmdCommandWithoutCallbackForError(expectedErr) {
    expect(process.exit).to.be.calledOnce;
    expect(process.exit).to.be.calledWith(-1);
    expect(logger.error).to.be.calledOnce;
    expect(logger.error).to.be.calledWith('%s', expectedErr);
  },
  assertCmdCommandWithCallbackForError(actualErr, expectedErr) {
    expect(actualErr).to.exist;
    expect(logger.error).to.be.calledOnce;
    expect(logger.error).to.be.calledWith('%s', expectedErr);
    expect(actualErr).to.equal(expectedErr);
  },
  // Asserts that the saved session(user) and the saved project are as expected.
  assertUserProjectSetup(expectedUser, expectedProject, cb) {
    async.series(
      [
        function verifyUser(next) {
          util.readJSON(config.paths.session, (err, actualUser) => {
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
          util.readJSON(config.paths.project, (err, actualProject) => {
            if (err) {
              return next(err);
            }

            if (!expectedProject) {
              expect(actualProject).to.equal('');
              return next();
            }

            let discrepancy;
            for (const prop in expectedProject) {
              const actualValue = actualProject[prop];
              const expectedValue = expectedProject[prop];
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
  },
  assertError(actualErr, expectedErr) {
    expect(actualErr).to.exist;
    const expectedName = expectedErr.NAME || expectedErr.name;
    expect(actualErr.name).to.equal(expectedName);
    const expectedMsg = expectedErr.MESSAGE || expectedErr.message;
    expect(actualErr.message).to.equal(expectedMsg);
  },
  /**
   * Asserts that the global setup matches the expected.
   * @param expected If null, assumes that setup must be empty - either blank or without profiles and active items.
   * @param path If null, uses the path from the tests config.
   * @param done
   */
  assertGlobalSetup(expected, path, done) {
    path = path || globalSetupPath;
    readJSON(path, (err, actual) => {
      if (err) {
        return done(err);
      }

      if (!expected || (isEmpty(expected.active) && isEmpty(expected.profiles))) {
        const actualDoesNotContainData = isEmpty(actual) || (isEmpty(actual.active) && isEmpty(actual.profiles));
        expect(actualDoesNotContainData, `Setup at ${path} is empty.`).to.be.true;
        return done(null);
      }

      expect(actual).to.deep.equal(expected);
      done(null);
    });
  },

  assertProjectSetup(expected, path, done) {
    path = path || projectPath;
    readJSON(path, (err, actual) => {
      if (err) {
        return done(err);
      }

      if (!expected || isEmpty(expected.flex)) {
        const actualDoesNotContainData = isEmpty(actual) || isEmpty(actual.flex);
        expect(actualDoesNotContainData, `Setup at ${path} is empty.`).to.be.true;
        return done(null);
      }

      expect(actual).to.deep.equal(expected);
      done(null);
    });
  },

  buildExpectedProject(appId, org, lastJobId, serviceName, service, schemaVersion = config.defaultSchemaVersion) {
    return {
      org,
      lastJobId,
      serviceName,
      service,
      schemaVersion,
      app: appId
    };
  },
  buildExpectedUser(host = config.host, token = fixtureUser.token) {
    const user = {
      host,
      tokens: {
        [host]: token
      }
    };

    return user;
  },
  buildExpectedProfile(profileName, host, email, token) {
    const profile = {
      [profileName] : {
        email: email || existentUser.email,
        token: token || fixtureUser.token,
        host: host || testsConfig.host
      }
    };

    return profile;
  },
  buildExpectedProfiles(profiles) {
    if (!Array.isArray(profiles)) {
      profiles = [profiles];
    }

    const result = {};

    profiles.forEach((p) => {
      const name = Object.keys(p)[0];
      result[name] = p[name];
    });

    return result;
  },
  buildExpectedActiveItems(profileName) {
    return {
      profile: profileName
    }
  },
  buildExpectedGlobalSetup(activeItems, profiles) {
    return {
      active: activeItems,
      profiles: profiles
    }
  }
};

helper.mocks = {
  getInquirerPrompt(sandbox, answers) {
    return sandbox.stub(inquirer, 'prompt', (questions, cb) => {
      setTimeout(() => {
        cb(answers);
      }, 0);
    });
  },
  getStubCallArg(allCalls, callPosition, argPosition) {
    return allCalls[callPosition].args[argPosition];
  }
};

helper.env = {
  setCredentials(user, password) {
    process.env[EnvironmentVariables.USER] = user;
    process.env[EnvironmentVariables.PASSWORD] = password;
  },
  unsetCredentials() {
    delete process.env[EnvironmentVariables.USER];
    delete process.env[EnvironmentVariables.PASSWORD];
  }
};

helper.setup = {
  createProfile(name, email, password, done) {
    email = email || existentUser.email;
    password = password || existentUser.password;

    const cmd = `profile create ${name} --verbose --${AuthOptionsNames.EMAIL} ${email} --${AuthOptionsNames.PASSWORD} ${password}`;

    helper.execCmdWithoutAssertion(cmd, null, (err) => {
      if (err) {
        return done(err);
      }

      readJSON(globalSetupPath, (err, actualSetup) => {
        if (err) {
          return done(err);
        }

        const isCreated = actualSetup && actualSetup.profiles && !isEmpty(actualSetup.profiles[name]);
        if (!isCreated) {
          return done(new Error(`Failed to create profile with name ${name}.`));
        }

        done(null);
      });
    });
  },

  createProfiles(names, done) {
    if (!Array.isArray(names)) {
      names = [names];
    }

    async.eachSeries(
      names,
      (name, next) => {
        this.createProfile(name, existentUser.email, existentUser.password, next);
      },
      done
    );
  },

  setActiveProfile(name, shouldCreate, done) {
    async.series([
      (next) => {
        if (!shouldCreate) {
          setImmediate(() => {
            next(null);
          });
        } else {
          this.createProfiles(name, next);
        }
      },
      function setAsActiveProfile(next) {
        const cmd = `profile use ${name} --verbose`;

        helper.execCmdWithoutAssertion(cmd, null, (err) => {
          if (err) {
            return next(err);
          }

          readJSON(globalSetupPath, (err, actualSetup) => {
            if (err) {
              return next(err);
            }

            const isActive = actualSetup && actualSetup.active && actualSetup.active.profile === name;
            if (!isActive) {
              return next(new Error(`Failed to set as active profile with name ${name}.`));
            }

            next(null);
          });
        });
      }
    ], done);
  },

  deleteProfileFromSetup(name, path, done) {
    path = path || globalSetupPath;
    let setup;

    readJSON(path, (err, actualSetup) => {
      if (err) {
        return done(err);
      }

      setup = actualSetup;
      if (!setup || !setup.profiles || !setup.profiles[name]) {
        return done(new Error(`Profile not found - ${name}.`));
      }

      delete setup.profiles[name];
      if (setup.active && setup.active.profile === name) {
        delete setup.active.profile;
      }

      writeJSON(path, setup, done);
    });
  },

  createProjectSetup(options, done) {
    options = options || {
      flex: {
        domain: 'app',
        domainEntityId: fixtureApp.id,
        serviceId: fixtureInternalDataLink.id,
        serviceName: fixtureInternalDataLink.name,
        schemaVersion: 2
      }
    };

    writeJSON(testsConfig.paths.project, options, done);
  },

  configureUserAndProject(sandbox, mockServer, cb) {
    this.userProjectPromptStubsForSuccess(sandbox);

    mockServer.loginWithSuccess();
    mockServer.apps();
    mockServer.dataLinks();

    require('../lib/commands/flex/config').handler({}, (err) => {
      expect(err).to.not.exist;
      expect(mockServer.isDone()).to.be.true;

      const expectedUser = {
        host: config.host,
        tokens: {
          [config.host]: fixtureUser.token
        }
      };

      const expectedProject = helper.assertions.buildExpectedProject(fixtureApp.id, null, null, fixtureInternalDataLink.name, fixtureInternalDataLink.id);

      helper.assertions.assertUserProjectSetup(expectedUser, expectedProject, cb);
    });
  },

  setInvalidProject(cb) {
    // setup for failure - service is null
    const invalidProjectToRestore = helper.assertions.buildExpectedProject(fixtureApp.id, null, null, fixtureInternalDataLink.name, null);
    util.writeJSON(config.paths.project, invalidProjectToRestore, (err) => {
      cb(err, invalidProjectToRestore);
    });
  },

  userProjectPromptStubsForSuccess(sandbox) {
    this.userPromptStubsForSuccess(sandbox);
    this.projectPromptStubsForSuccess(sandbox);
  },

  userPromptStubsForSuccess(sandbox) {
    sandbox.stub(prompt, 'getEmailPassword').callsArgWith(2, null, fixtureUser.existent.email, fixtureUser.existent.password);
  },

  projectPromptStubsForSuccess(sandbox) {
    sandbox.stub(prompt, 'getAppOrOrg').callsArgWith(1, null, { name: 'App' });
    sandbox.stub(prompt, 'getApp').callsArgWith(1, null, fixtureApp);
    sandbox.stub(prompt, 'getService').callsArgWith(1, null, fixtureInternalDataLink);
  },

  // Deploys a job. User must be already logged in and project must be set.
  initiateJobDeploy(mockServer, cb) {
    mockServer.deployJob();

    require('../lib/commands/flex/deploy').handler({}, (err) => {
      expect(err).to.not.exist;
      expect(mockServer.isDone()).to.be.true;

      const expectedUser = {
        host: config.host,
        tokens: {
          [config.host]: fixtureUser.token
        }
      };
      const expectedProject = helper.assertions.buildExpectedProject(fixtureApp.id, null, fixtureJob.job, fixtureInternalDataLink.name, fixtureInternalDataLink.id);
      helper.assertions.assertUserProjectSetup(expectedUser, expectedProject, cb);
    });
  },

  // Clears content in session and project files.
  clearUserProjectSetup(cb) {
    async.series(
      [
        function clearUser(next) {
          util.writeJSON(config.paths.session, '', next);
        },
        function clearProject(next) {
          util.writeJSON(config.paths.project, '', next);
        }
      ],
      cb
    );
  },

  clearGlobalSetup(path, done) {
    path = path || globalSetupPath;
    writeJSON(path, '', done);
  },

  clearProjectSetup(path, done) {
    path = path || projectPath;
    writeJSON(path, '', done);
  },

  // Ensure modules are reloaded every time and tests are independent (e.g class User -> this.token will be cleared).
  clearRequireCache() {
    const modules = [
      '/commands/flex/config', '/commands/flex/deploy', '/commands/flex/job', '/commands/flex/list', '/commands/flex/logout', '/commands/flex/logs', '/commands/flex/recycle', '/commands/flex/status',
      '/project', '/service', '/user', '/util'
    ];

    modules.forEach(module => {
      const pathToResolve = `./../lib${module}`;
      delete require.cache[require.resolve(pathToResolve)];
    });
  },

  // Clears some cached modules, any unused nock interceptors, user/session info and project setup info.
  performGeneralCleanup(cb) {
    helper.setup.clearRequireCache();
    mockServer.clearAll();
    helper.setup.clearUserProjectSetup(cb);
  }
};

helper.execCmd = function execCmd(cliCmd, options, done) {
  options = options || {
      env: {
        NODE_CONFIG: JSON.stringify(testsConfig)
      }
    };

  const fullCmd = `node .\\bin\\cli.js ${cliCmd}`;
  return childProcess.exec(fullCmd, options, (err, stdout, stderr) => {
    done(err, stdout, stderr);
  });
};

helper.execCmdWithoutAssertion = function (cliCmd, options, done) {
  let ms = {};
  async.series([
    (next) => {
      ms = mockServer(null, next);
    },
    (next) => {
      helper.execCmd(cliCmd, options, next);
    }
  ], (err) => {
    ms.close(() => {
      done(err);
    });
  });
};

helper.getOutputWithoutSetupPaths = function getOutputWithoutSetupPaths(output) {
  const globalSetupWithoutEscapedSlashes = globalSetupPath;
  const globalSetupWithEscapedSlashes = globalSetupWithoutEscapedSlashes.replace(/\\/g, '\\\\');
  const globalSetupReg = new RegExp(globalSetupWithEscapedSlashes, 'gi');
  const outputWithoutSetupPaths = output.replace(globalSetupReg, 'globalSetupPath');

  // TODO: create a method to escape slashes and get regex
  const projectSetupWithoutEscapedSlashes = testsConfig.paths.project;
  const projectSetupWithEscapedSlashes = projectSetupWithoutEscapedSlashes.replace(/\\/g, '\\\\');
  const projectSetupReg = new RegExp(projectSetupWithEscapedSlashes, 'gi');
  const result = outputWithoutSetupPaths.replace(projectSetupReg, 'projectSetupPath');
  return result;
};

helper.execCmdWithAssertion = function (cliCmd, cmdOptions, apiOptions, snapshotIt, clearSetupPaths, escapeSlashes, done) {
  let ms = {};

  async.series([
    (next) => {
      ms = mockServer(apiOptions, next);
    },
    (next) => {
      helper.execCmd(cliCmd, cmdOptions, (err, stdout, stderr) => {
        // I don't think I'll need it, will remove probably
        /*const errIsExpected = !isNullOrUndefined(expectedErr);
        if (errIsExpected) {
          helper.assertions.assertError(err, expectedErr);
        } else {
          expect(err).to.not.exist;
        }*/

        let output;
        if (stdout) {
          output = stdout;
        } else if (stderr) {
          output = stderr;
        } else {
          output = err;
        }

        const strippedOutput = stripAnsi(output) || '';
        let finalOutput;
        
        // paths will be different for each machine so let's just remove them
        if (clearSetupPaths) {
          finalOutput = helper.getOutputWithoutSetupPaths(strippedOutput);
        } else if (escapeSlashes && process.env.SNAPSHOT_UPDATE !== "1") {
          // if we save in a snapshot 'bin\cli.js', then when we compare, snap-shot-it retrieves the value as 'bincli.js' and the actual value is 'bin\cli.js', hence the test fails
          //finalOutput = strippedOutput.replace(/\\/g, '\\\\');
          finalOutput = strippedOutput.replace(/\\/g, '');
        } else {
          finalOutput = strippedOutput;
        }

        if (snapshotIt) {
          try {
            snapshot(finalOutput);
          } catch(ex) {
            return next(ex, finalOutput);
          }
        }

        next(null, finalOutput);
      });
    }
  ], (err, results) => {
    ms.close(() => {
      if (err) {
        return done(err);
      }

      done(null, results.pop());
    });
  });
};

module.exports = helper;
