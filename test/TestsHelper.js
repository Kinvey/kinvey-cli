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

const async = require('async');
const inquirer = require('inquirer');
const snapshot = require('snap-shot-it');
const stripAnsi = require('strip-ansi');

const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');

const { AuthOptionsNames, CommonOptionsNames, EnvironmentVariables, OutputFormat } = require('./../lib/Constants');
const logger = require('../lib/logger');
const { isEmpty, isNullOrUndefined, readJSON, writeJSON } = require('../lib/Utils');

const fixtureUser = require('./fixtures/user.json');
const fixtureApp = require('./fixtures/app.json');
const fixtureInternalDataLink = require('./fixtures/kinvey-dlc.json');
const testsConfig = require('./TestsConfig');
const mockServer = require('./mockServer');

const existentUser = fixtureUser.existent;
const globalSetupPath = testsConfig.paths.session;
const projectPath = testsConfig.paths.project;
const supposeDebugPath = testsConfig.paths.supposeDebug;

const TestsHelper = {};

TestsHelper.assertions = {
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

  assertActiveItemsOnProfile(expected, profileName, path, done) {
    path = path || globalSetupPath;
    readJSON(path, (err, actual) => {
      if (err) {
        return done(err);
      }

      if (!actual || !actual.profiles || !actual.profiles[profileName]) {
        return done(new Error(`Profile not found: ${profileName}.`));
      }

      const actualProfile = actual.profiles[profileName];
      if (!expected) {
        const noActualActiveItems = isEmpty(actualProfile.active) || isNullOrUndefined(actualProfile.active);
        expect(noActualActiveItems).to.equal(true);
        return done(null);
      }

      const expectedActiveItemTypes = Object.keys(expected);
      expectedActiveItemTypes.forEach((expectedKey) => {
        expect(actualProfile.active[expectedKey]).to.deep.equal(expected[expectedKey]);
      });

      done(null);
    });
  },

  assertProjectSetup(expected, path, done) {
    path = path || projectPath;
    readJSON(path, (err, actual) => {
      if (err) {
        return done(err);
      }

      if (!expected) {
        const actualDoesNotContainData = isEmpty(actual);
        expect(actualDoesNotContainData, `Setup at ${path} is empty.`).to.be.true;
        return done(null);
      }

      expect(actual).to.deep.equal(expected);
      done(null);
    });
  },

  buildExpectedProject(domain, domainEntityId, serviceId, serviceName, schemaVersion = testsConfig.defaultSchemaVersion) {
    return {
      domain,
      domainEntityId,
      serviceId,
      serviceName,
      schemaVersion
    };
  },
  buildExpectedUser(host = testsConfig.host, token = fixtureUser.token) {
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
      [profileName]: {
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
    };
  },
  buildExpectedGlobalSetup(activeItems, profiles) {
    return {
      active: activeItems,
      profiles
    };
  },
  buildExpectedProjectSetup(profileName, serviceInfo) {
    const result = {};
    result[profileName] = { flex: serviceInfo };
    return result;
  },
  assertFileContainsString(filePath, expectedString, done) {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        return done(err);
      }
      const fileContent = String.fromCharCode.apply(null, data);
      expect(fileContent).to.contain(expectedString);
      done(null);
    });
  },
  assertSuccessfulInitSequence(error, exitCode, expectedSetup, outputFile, expectedString, done) {
    expect(error).to.not.exist;
    expect(exitCode).to.equal(0);
    this.assertGlobalSetup(expectedSetup, testsConfig.paths.session, (err) => {
      expect(err).to.not.exist;
      this.assertFileContainsString(outputFile, expectedString, done);
    });
  },
  assertSuccessfulFlexInitSequence(error, exitCode, expectedSetup, outputFile, expectedString, done) {
    expect(error).to.not.exist;
    expect(exitCode).to.equal(0);
    this.assertProjectSetup(expectedSetup, null, (err) => {
      expect(err).to.not.exist;
      this.assertFileContainsString(outputFile, expectedString, done);
    });
  },
  assertSupposeError(error, exitCode, expectedErrorMessage, expectedExitCode) {
    expect(error).to.exist;
    expect(error.message).to.contain(expectedErrorMessage);
    expect(exitCode).to.equal(expectedExitCode);
  }
};

TestsHelper.mocks = {
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

TestsHelper.env = {
  setCredentials(user, password) {
    process.env[EnvironmentVariables.USER] = user;
    process.env[EnvironmentVariables.PASSWORD] = password;
  },
  unsetCredentials() {
    delete process.env[EnvironmentVariables.USER];
    delete process.env[EnvironmentVariables.PASSWORD];
  }
};

TestsHelper.setup = {
  createProfile(name, email, password, done) {
    email = email || existentUser.email;
    password = password || existentUser.password;

    const cmd = `profile create ${name} --verbose --${AuthOptionsNames.EMAIL} ${email} --${AuthOptionsNames.PASSWORD} ${password}`;

    TestsHelper.execCmdWithoutAssertion(cmd, null, (err) => {
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

        TestsHelper.execCmdWithoutAssertion(cmd, null, (err) => {
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

  _readGlobalSetupForProfile(profileName, path, done) {
    path = path || globalSetupPath;
    let setup;

    readJSON(path, (err, actualSetup) => {
      if (err) {
        return done(err);
      }

      setup = actualSetup;
      if (!setup || !setup.profiles || !setup.profiles[profileName]) {
        return done(new Error(`Profile not found - ${profileName}.`));
      }

      done(null, setup);
    });
  },

  setActiveItemOnProfile(profileName, entityType, activeItem, path, done) {
    path = path || globalSetupPath;
    TestsHelper.setup._readGlobalSetupForProfile(profileName, path, (err, setup) => {
      if (err) {
        return done(err);
      }

      if (!setup.profiles[profileName].active) {
        setup.profiles[profileName].active = {};
      }

      setup.profiles[profileName].active[entityType] = activeItem;
      writeJSON(path, setup, done);
    });
  },

  deleteProfileFromSetup(name, path, done) {
    path = path || globalSetupPath;
    TestsHelper.setup._readGlobalSetupForProfile(name, path, (err, setup) => {
      delete setup.profiles[name];
      if (setup.active && setup.active.profile === name) {
        delete setup.active.profile;
      }

      writeJSON(path, setup, done);
    });
  },

  createProjectSetup(key, options, done) {
    const filePath = testsConfig.paths.project;

    readJSON(filePath, (err, data) => {
      if (err && err.code !== 'ENOENT') {
        return done(err);
      }

      data = data || {};
      const flex = {
        flex: options || {
          domain: 'app',
          domainEntityId: fixtureApp.id,
          serviceId: fixtureInternalDataLink.id,
          serviceName: fixtureInternalDataLink.name,
          schemaVersion: 2
        }
      };
      data[key] = flex;

      writeJSON(filePath, data, done);
    });
  },

  clearGlobalSetup(path, done) {
    path = path || globalSetupPath;
    writeJSON(path, '', done);
  },

  clearSupposeDebugFile(path, done) {
    path = path || supposeDebugPath;
    writeJSON(path, '', done);
  },

  _clearActiveItemsOnProfile(profileName, activeItemType, path, done) {
    path = path || globalSetupPath;
    TestsHelper.setup._readGlobalSetupForProfile(profileName, path, (err, setup) => {
      const clearAll = isNullOrUndefined(activeItemType);
      if (clearAll) {
        delete setup.profiles[profileName].active;
      } else {
        if (!setup.profiles[profileName].active) {
          return done(new Error(`No active items found for profile '${profileName}'.`));
        }

        delete setup.profiles[profileName].active[activeItemType];
      }

      writeJSON(path, setup, done);
    });
  },

  clearActiveItemsOnProfile(profileName, path, done) {
    TestsHelper.setup._clearActiveItemsOnProfile(profileName, null, path, done);
  },

  clearSingleActiveItemOnProfile(profileName, activeItemType, path, done) {
    TestsHelper.setup._clearActiveItemsOnProfile(profileName, activeItemType, path, done);
  },

  clearProjectSetup(path, done) {
    path = path || projectPath;
    fs.unlink(path, (err) => {
      if (err) {
        if (err.code === 'ENOENT') {
          return done();
        }

        return done(err);
      }

      done();
    });
  },

  clearAllSetup(done) {
    async.series([
      (next) => {
        this.clearGlobalSetup(null, next);
      },
      (next) => {
        this.clearProjectSetup(null, next);
      },
      (next) => {
        this.clearSupposeDebugFile(null, next);
      }
    ], done);
  }
};

TestsHelper.buildOptions = function buildOptions(profileName, optionsForCredentials, otherOptions) {
  let options = isEmpty(optionsForCredentials) ? {} : Object.assign({}, optionsForCredentials);
  if (profileName) {
    options[AuthOptionsNames.PROFILE] = profileName;
  }

  if (!isEmpty(otherOptions)) {
    options = Object.assign(options, otherOptions);
  }

  return options;
};

TestsHelper.buildCmd = function buildCmd(baseCmd, positionalArgs, options, flags) {
  let result = baseCmd;

  // append positional arguments
  if (Array.isArray(positionalArgs)) {
    positionalArgs.forEach((x) => {
      result += ` ${x}`;
    });
  }

  // append options
  if (!isEmpty(options)) {
    const optionsNames = Object.keys(options);
    optionsNames.forEach((optionName) => {
      const optionValue = options[optionName];
      result += ` --${optionName} ${optionValue}`;
    });
  }

  // append flags
  if (Array.isArray(flags)) {
    flags.forEach((f) => {
      result += ` --${f}`;
    });
  }

  return result;
};

TestsHelper.testTooManyArgs = function testTooManyArgs(baseCmd, additionalArgsCount, done) {
  const additionalArgs = Array(additionalArgsCount).fill('redundantArg');
  const cmd = TestsHelper.buildCmd(baseCmd, additionalArgs);
  TestsHelper.execCmdWithAssertion(cmd, null, null, true, false, false, null, (err) => {
    expect(err).to.not.exist;
    done();
  });
};

TestsHelper.execCmd = function execCmd(cliCmd, options, done) {
  options = options || {};
  // options.env.PATH should always be set in order to run the tests in Travis
  if (options.env) {
    options.env.PATH = options.env.PATH || process.env.PATH;
  } else {
    options.env = {
      PATH: process.env.PATH,
      NODE_CONFIG: JSON.stringify(testsConfig)
    };
  }

  const fullCmd = `node ${path.join('bin', 'kinvey')} ${cliCmd}`;
  return childProcess.exec(fullCmd, options, (err, stdout, stderr) => {
    done(err, stdout, stderr);
  });
};

TestsHelper.execCmdWithoutAssertion = function execCmdWithoutAssertion(cliCmd, options, done) {
  let ms = {};
  async.series([
    (next) => {
      mockServer(null, (err, server) => {
        if (err) {
          return next(err);
        }

        ms = server;
        next(null);
      });
    },
    (next) => {
      TestsHelper.execCmd(cliCmd, options, next);
    }
  ], (err) => {
    if (ms.listening) {
      ms.close(() => {
        done(err);
      });
    } else {
      done(err);
    }
  });
};

TestsHelper.getOutputWithoutSetupPaths = function getOutputWithoutSetupPaths(output) {
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

TestsHelper.execCmdWithAssertion = function (cliCmd, cmdOptions, apiOptions, snapshotIt, clearSetupPaths, escapeSlashes, replacementObject, done) {
  let ms = {};

  async.series([
    (next) => {
      mockServer(apiOptions, (err, server) => {
        if (err) {
          return next(err);
        }

        ms = server;
        next(null);
      });
    },
    (next) => {
      TestsHelper.execCmd(cliCmd, cmdOptions, (err, stdout, stderr) => {
        // Data output from successful command execution goes to stdout; everything else - stderr
        const output = `${stderr}${stdout}`;

        const strippedOutput = stripAnsi(output) || '';
        let finalOutput;
        // paths will be different for each machine so let's just remove them
        if (clearSetupPaths) {
          finalOutput = TestsHelper.getOutputWithoutSetupPaths(strippedOutput);
        } else if (escapeSlashes && process.env.SNAPSHOT_UPDATE !== '1') {
          // if we save in a snapshot 'bin\cli.js', then when we compare, snap-shot-it retrieves the value as 'bincli.js' and the actual value is 'bin\cli.js', hence the test fails
          finalOutput = strippedOutput.replace(/\\/g, '');
        } else {
          finalOutput = strippedOutput;
        }

        // ensure line separators are always the same
        finalOutput = finalOutput.replace(/\r\n/g, '\n');

        // replace a given text/regex if an object with 'oldValue' and 'newValue' fields is submitted.
        if (replacementObject && typeof replacementObject === 'object') {
          const matchedText = finalOutput.match(replacementObject.oldValue)[0];
          finalOutput = finalOutput.replace(matchedText, replacementObject.newValue);
        }

        if (snapshotIt) {
          try {
            snapshot(finalOutput);
          } catch (ex) {
            return next(ex, finalOutput);
          }
        }

        next(null, finalOutput);
      });
    }
  ], (err, results) => {
    if (ms.listening) {
      ms.close(() => {
        if (err) {
          return done(err);
        }

        done(null, results.pop());
      });
    } else {
      if (err) {
        return done(err);
      }

      done(null, results.pop());
    }
  });
};

TestsHelper.runSupposeSequence = (sequenceObject, callback) => {
  let error;
  sequenceObject
    .on('error', (err) => {
      error = err;
    })
    .end((exitCode) => {
      callback(error, exitCode);
    });
};

TestsHelper.getCreatedProfileMessage = profileName => `Created profile: ${profileName}`;

TestsHelper.testers = {};
TestsHelper.testers.getJsonOptions = function getJsonOptions() {
  return { [CommonOptionsNames.OUTPUT]: OutputFormat.JSON };
};

TestsHelper.testers.getDefaultFlags = function getDefaultFlags() {
  return [CommonOptionsNames.VERBOSE];
};

TestsHelper.testers.execCmdWithIdentifier = function execCmdWithIdentifier(baseCmd, options, flags, identifier, validUser, done) {
  const apiOptions = {};
  if (!isEmpty(validUser)) {
    apiOptions.token = validUser.token;
    apiOptions.existentUser = { email: validUser.email };
  }

  const positionalArgs = [];
  if (identifier) {
    positionalArgs.push(identifier);
  }
  const cmd = TestsHelper.buildCmd(baseCmd, positionalArgs, options, flags);
  TestsHelper.execCmdWithAssertion(cmd, null, apiOptions, true, true, false, null, done);
};

TestsHelper.testers.execCmdWithIdentifierAndActiveCheck = function execCmdWithIdentifierAndActiveCheck(baseCmd, options, flags, identifier, expectedActive, profileName, validUser, done) {
  TestsHelper.testers.execCmdWithIdentifier(baseCmd, options, flags, identifier, validUser, (err) => {
    expect(err).to.not.exist;
    if (isNullOrUndefined(expectedActive)) {
      return setImmediate(done);
    }

    TestsHelper.assertions.assertActiveItemsOnProfile(expectedActive, profileName, null, done);
  });
};

module.exports = TestsHelper;
