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
const chalk = require('chalk');

const { AllCommandsNotRequiringAuth, AuthOptionsNames, EnvironmentVariables, Errors, LogLevel } = require('./constants');
const Authentication = require('./authentication');
const KinveyError = require('./kinvey-error');
const Request = require('./request');
const { formatHost, getCommandNameFromOptions, isNullOrUndefined, isValidEmail } = require('./utils');

const cmdInit = require('./init/init');
const cmdProfile = require('./profile/profiles-router');
const cmdFlex = require('./flex/flex-router');

const InitController = require('./init/init-controller');
const ProfilesController = require('./profile/profiles-controller');
const FlexController = require('./flex/flex-controller');

const FlexService = require('./flex/flex-service');

/**
 * Serves as mediator between modules. Responsible for routing and controllers initializing.
 */
class CLIManager {
  constructor({ setup, config, logger, notifier, prompter, commandsManager }) {
    this._setup = setup;
    this._authentication = new Authentication(this);
    this._isOneTimeSession = false;
    this._requiresAuth = true;
    this._logger = logger;
    this._notifier = notifier;
    this._commandsManager = commandsManager;
    this.config = config;
    this.prompter = prompter;

    this._registerControllers();
  }

  _registerControllers() {
    this._initController = new InitController({ cliManager: this });
    const flexService = new FlexService(this);
    this._flexController = new FlexController({ cliManager: this, flexService });
    this._profilesController = new ProfilesController({ cliManager: this });
  }

  _processCommonOptions(options) {
    if (options.silent && options.verbose) {
      throw new Error('Mutually exclusive options: \'silent\' and \'verbose\'.');
    }

    if (options.silent) {
      this._logger.config({ level: 3 });
    }

    if (options.verbose) {
      this._logger.config({ level: 0 });
    }

    if (!options.suppressVersionCheck) {
      this.log(LogLevel.DEBUG, 'Checking for package updates');
      this._notifier.notify({ defer: false });
    }
  }

  _authIsRequired(cmd) {
    if (AllCommandsNotRequiringAuth.includes(cmd)) {
      return false;
    }

    return true;
  }

  _setIsOneTimeSession(options) {
    const commandName = getCommandNameFromOptions(options);
    if (commandName === 'init' || commandName === 'profile create') {
      this._isOneTimeSession = false;
      return;
    }

    if (!isNullOrUndefined(options[AuthOptionsNames.PROFILE])) {
      this._isOneTimeSession = false;
      return;
    }

    this._isOneTimeSession = !isNullOrUndefined(options[AuthOptionsNames.EMAIL]) && !isNullOrUndefined(options[AuthOptionsNames.PASSWORD]);
  }

  _clearAuthOptions(options) {
    const commandName = getCommandNameFromOptions(options);
    const disregardAllAuthOptions = commandName === 'init';

    if (disregardAllAuthOptions) {
      Object.keys(AuthOptionsNames).forEach((key) => {
        const propName = AuthOptionsNames[key];
        options[propName] = null;
      });

      return;
    }

    if (commandName === 'profile create') {
      options[AuthOptionsNames.PROFILE] = null;
    }
  }

  /**
   * Processes auth-related options before command execution. Determines if command requires auth or if some options must be cleared.
   * Decides if it is a one-time session.
   * @param options
   * @private
   */
  _processAuthOptions(options) {
    const commandName = getCommandNameFromOptions(options);
    this._requiresAuth = this._authIsRequired(commandName);

    this._clearAuthOptions(options);

    this._setIsOneTimeSession(options);

    if (this._isOneTimeSession) {
      const emailIsValid = isValidEmail(options[AuthOptionsNames.EMAIL]);
      if (!emailIsValid) {
        throw new KinveyError(Errors.InvalidEmail);
      }
    }

    if (options[AuthOptionsNames.HOST]) {
      options[AuthOptionsNames.HOST] = formatHost(options[AuthOptionsNames.HOST]);
    }
  }

  /**
   * Tries to set the current user from a profile name or from the active profile. If there are no saved profiles, it doesn't set it.
   * If no name is provided, no active profile is set and there is only one saved profile, then it sets the user to this profile.
   * @param {String} [profileName] Name of already saved profile. Throws if not found.
   * @private
   */
  _setCurrentUserFromProfile(profileName) {
    if (this._isOneTimeSession || !this._setup.hasProfiles()) {
      return;
    }

    let profile;
    if (profileName) {
      profile = this._setup.findProfileByName(profileName);
    } else if (this._setup.hasActiveProfile()) {
      profile = this._setup.getActiveProfile();
    } else {
      // profile is not provided explicitly, active profile is not set
      const allProfiles = this._setup.getProfiles();
      const isSingleProfile = Object.keys(allProfiles).length === 1;
      if (isSingleProfile) {
        const singleProfileName = Object.keys(allProfiles)[0];
        profile = this._setup.findProfileByName(singleProfileName);
      }
    }

    if (!profile && profileName) {
      throw new KinveyError(Errors.ProfileNotFound);
    }

    if (profile) {
      this._authentication.setCurrentUser(profile);
    }
  }

  _loadGlobalSetup() {
    if (this._isOneTimeSession) {
      return;
    }

    const err = this._setup.load();
    const canContinue = !err || err instanceof Error && err.code === 'ENOENT';
    if (!canContinue) {
      this._logger.error('Failed to load global settings.');
      throw err;
    }
  }

  _initCommandsManager(args) {
    // for testing purposes
    if (args) {
      this._commandsManager(args);
    }

    this._commandsManager
      .usage('kinvey <command> [args] [options]')
      .env(EnvironmentVariables.PREFIX) // populate options with env variables
      .option(
        AuthOptionsNames.EMAIL, {
          global: true,
          describe: 'E-mail address of your Kinvey account',
          type: 'string'
        }
      )
      .option(
        AuthOptionsNames.PASSWORD, {
          global: true,
          describe: 'Password of your Kinvey account',
          type: 'string'
        }
      )
      .option(
        AuthOptionsNames.HOST, {
          global: true,
          describe: 'Host of the Kinvey service',
          type: 'string'
        }
      )
      .option(
        AuthOptionsNames.PROFILE, {
          global: true,
          describe: 'Profile to use',
          type: 'string'
        }
      )
      .option(
        'silent', {
          global: true,
          describe: 'Do not output anything',
          type: 'boolean'
        }
      )
      .option(
        'suppress-version-check', {
          global: true,
          describe: 'Do not check for package updates',
          type: 'boolean'
        }
      )
      .option('verbose', {
        global: true,
        describe: 'Output debug messages',
        type: 'boolean'
      })
      .check((argv) => {
        // FIXME: Move to a middleware when yargs provides middleware support (https://github.com/yargs/yargs/pull/881)
        this._processCommonOptions(argv);
        this._processAuthOptions(argv);

        this._loadGlobalSetup();

        if (!this._isOneTimeSession && this._requiresAuth) {
          this._setCurrentUserFromProfile(argv[AuthOptionsNames.PROFILE]);
        }

        if (this._requiresAuth && !this._isOneTimeSession && !this._authentication.hasCurrentUser()) {
          throw new Error('You must be authenticated.');
        }

        return true;
      })
      .command(cmdInit(this._initController))
      .command('profile', 'Manage profiles. Run \'kinvey profile -h\' for details.', cmdProfile(this._profilesController))
      .command('flex', 'Deploy and manage flex services. Run \'kinvey flex -h\' for details.', cmdFlex(this._flexController))
      .demand(1, '')
      .strict(true)
      .help('h')
      .alias('h', 'help')
      .showHelpOnFail(true);

    this._commandsManager.argv;
  }

  /**
   * Entry point of CLI manager to start processing commands.
   * @param args
   */
  init(args) {
    this._initCommandsManager(args);
  }

  /**
   * Sends request. Returns the request object if additional control is needed (e.g. stop the request).
   * @param {Object} options
   * @param {String} options.endpoint Relative URL (e.g. 'v2/apps')
   * @param {String} [options.host] Base URL (e.g. 'https://manage.kinvey.com/')
   * @param {String} [options.method] HTTP method
   * @param {Object} [options.data]
   * @param {Object} [options.formData]
   * @param {Boolean} [options.skipAuth] If true, doesn't set auth header.
   * @param done
   * @returns {*}
   */
  sendRequest(options, done) {
    if (!options.host) {
      options.host = this.config.host;
    }

    const reqObj = new Request(this._authentication.getCurrentUser(), options);

    this.log(LogLevel.DEBUG, 'Request:  %s %s', reqObj.options.method, reqObj.options.url);

    return reqObj.send((err, res) => {
      const status = res.statusCode || '';
      this.log(LogLevel.DEBUG, 'Response: %s %s %s', reqObj.options.method, reqObj.options.url, chalk.green(status));
      done(err, res.body);
    });
  }

  /**
   * Log using the logger module.
   * @param {String} logLevel
   * @param args
   */
  log(logLevel, ...args) {
    this._logger[logLevel](...args);
  }

  /**
   * Logs out current user if it is a one-time session.
   * @param done
   * @returns {*}
   * @private
   */
  _clearSession(done) {
    if (!this._isOneTimeSession) {
      return done(null);
    }


    this._authentication.logout(done);
  }

  /**
   * Handles any result from command execution.
   * @param err
   * @param result
   * @param [done]
   */
  processCommandResult(err, result, done) {
    this._clearSession(() => {
      const isCallbackProvided = typeof done === 'function';
      if (err) {
        this.log(LogLevel.ERROR, '%s', err);

        if (isCallbackProvided) {
          return done(err);
        }

        process.exit(1);
      } else {
        if (isCallbackProvided) {
          return done(null, result);
        }
      }
    });
  }

  /**
   * Sets the current user if not already set using info from options.
   * @param {Object} options
   * @param done
   * @returns {*}
   */
  setCurrentUserFromOptions(options, done) {
    if (this._authentication.hasCurrentUser()) {
      return done(null);
    }

    this.login(options[AuthOptionsNames.EMAIL], options[AuthOptionsNames.PASSWORD], null, options[AuthOptionsNames.HOST], done);
  }

  /**
   * Issues a login request. If it is a success, sets the current user.
   * @param email
   * @param password
   * @param [MFAToken]
   * @param [host]
   * @param done
   */
  login(email, password, MFAToken, host = this.config.host, done) {
    this._authentication.login(email, password, MFAToken, host, done);
  }

  /**
   * Creates a new profile. Changes are persisted in the setup file.
   * @param profileName
   * @param email
   * @param password
   * @param [MFAToken]
   * @param [host]
   * @param done
   * @returns {*}
   */
  createProfile(profileName, email, password, MFAToken, host = this.config.host, done) {
    if (this.profileExists(profileName)) {
      this.log(LogLevel.DEBUG, `Overriding profile with name '${profileName}'.`);
    }

    if (isNullOrUndefined(profileName)) {
      return done(new Error('Profile name is not set.'));
    }

    const self = this;
    let token;

    async.series([
      function loginUser(next) {
        self.login(email, password, MFAToken, host, (err, data) => {
          if (err) {
            return next(err);
          }

          token = data.token;
          next();
        });
      },
      function saveProfile(next) {
        self._setup.addProfile(profileName, email, token, host);
        self._setup.save((err) => {
          if (!err) {
            self.log(LogLevel.INFO, `Successfully created profile with name '${profileName}'.`);
          }

          next(err);
        });
      }
    ], done);
  }

  /**
   * Returns all saved profiles.
   * @returns {*}
   */
  getProfiles() {
    return this._setup.getProfiles();
  }

  /**
   * Searches for a profile by name. Returns null if not found.
   * @param name
   * @returns {*}
   */
  findProfile(name) {
    return this._setup.findProfileByName(name);
  }

  /**
   * Checks if profile name already exists.
   * @param {String} name
   * @returns {boolean}
   */
  profileExists(name) {
    return isNullOrUndefined(this._setup.findProfileByName(name)) === false;
  }

  /**
   * Deletes a profile by name. Changes are persisted. Doesn't return an error if profile is not found.
   * @param name
   * @param done
   */
  deleteProfile(name, done) {
    this._setup.deleteProfile(name);
    this._setup.save(done);
  }

  getActiveProfile() {
    return this._setup.getActiveProfile();
  }

  setActiveProfile(name, done) {
    if (!this.profileExists(name)) {
      return done(new KinveyError(Errors.ProfileNotFound));
    }

    this._setup.setActiveProfile(name);
    this._setup.save((err) => {
      if (!err) {
        this.log(LogLevel.INFO, `Active profile is set to '${name}'.`);
      }

      done(err);
    });
  }
}

module.exports = CLIManager;
