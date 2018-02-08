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

const os = require('os');

const { AllCommandsNotRequiringAuth, AuthOptionsNames, CommandRequirement, EnvironmentVariables, Errors, CommonOptionsNames, LogLevel, Namespace, OutputFormat, StderrLogLevels } = require('./Constants');
const Authentication = require('./Authentication');
const KinveyError = require('./KinveyError');
const Request = require('./Request');
const { formatHost, getCommandNameFromOptions, isEmpty, isNullOrUndefined, isValidEmail } = require('./Utils');

const cmdInit = require('./init/init');
const cmdProfile = require('./profile/profilesRouter');
const cmdFlex = require('./flex/flexRouter');

const InitController = require('./init/InitController');
const ProfilesController = require('./profile/ProfilesController');
const FlexController = require('./flex/FlexController');

const FlexService = require('./flex/FlexService');

/**
 * Serves as mediator between modules. Responsible for routing and controllers initializing.
 */
class CLIManager {
  constructor({ setup, config, logger, notifier, cliVersion, prompter, commandsManager }) {
    this._setup = setup;
    this._authentication = new Authentication(this);
    this._isOneTimeSession = false;
    this._requiresAuth = true;
    this._outputFormat = OutputFormat.HUMAN_READABLE;
    this._logger = logger;
    this._notifier = notifier;
    this._cliVersion = cliVersion;
    this._commandsManager = commandsManager;
    this.config = config;
    this.prompter = prompter;

    this._registerControllers();
  }

  _registerControllers() {
    this._controllers = {};
    this._controllers.init = new InitController({ cliManager: this });
    const flexService = new FlexService(this);
    this._controllers[Namespace.FLEX] = new FlexController({ cliManager: this, flexService });
    this._controllers[Namespace.PROFILE] = new ProfilesController({ cliManager: this });
  }

  getController(name) {
    const ctrl = this._controllers[name];
    if (isNullOrUndefined(ctrl)) {
      throw new Error(`Controller not found: ${name}.`);
    }

    return ctrl;
  }

  _processCommonOptions(options) {
    if (options[CommonOptionsNames.NO_COLOR]) {
      this._logger.stripColors = true;
      chalk.level = 0;
    }

    if (options[CommonOptionsNames.OUTPUT]) {
      this._outputFormat = options[CommonOptionsNames.OUTPUT];
    }

    if (options[CommonOptionsNames.SILENT] && options[CommonOptionsNames.VERBOSE]) {
      throw new KinveyError(null, `Mutually exclusive options: '${CommonOptionsNames.SILENT}' and '${CommonOptionsNames.VERBOSE}'.`);
    }

    if (options[CommonOptionsNames.SILENT]) {
      this._logger.level = LogLevel.SILENT;
    }

    if (options[CommonOptionsNames.VERBOSE]) {
      this._logger.level = LogLevel.DEBUG;
    }

    if (!options[CommonOptionsNames.SUPPRESS_VERSION_CHECK]) {
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
    if (AllCommandsNotRequiringAuth.includes(commandName)) {
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

    if (!isNullOrUndefined(options[AuthOptionsNames.HOST])) {
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
    if (!isNullOrUndefined(profileName)) {
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
      this.log(LogLevel.DEBUG, 'Failed to load global settings: unable to load config file.');
      throw err;
    }
  }

  _initCommandsManager(args) {
    // for testing purposes
    if (!isNullOrUndefined(args)) {
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
          describe: 'Kinvey dedicated instance hostname',
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
        CommonOptionsNames.OUTPUT, {
          global: true,
          describe: 'Output format',
          type: 'string',
          choices: [OutputFormat.JSON]
        }
      )
      .option(
        CommonOptionsNames.SILENT, {
          global: true,
          describe: 'Do not output anything',
          type: 'boolean'
        }
      )
      .option(
        CommonOptionsNames.SUPPRESS_VERSION_CHECK, {
          global: true,
          describe: 'Do not check for package updates',
          type: 'boolean'
        }
      )
      .option(CommonOptionsNames.VERBOSE, {
        global: true,
        describe: 'Output debug messages',
        type: 'boolean'
      })
      .option(CommonOptionsNames.NO_COLOR, {
        global: true,
        describe: 'Disable colors',
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
      .command(cmdInit(this))
      .command('profile', 'Manage profiles. Run \'kinvey profile -h\' for details.', cmdProfile(this))
      .command('flex', 'Deploy and manage flex services. Run \'kinvey flex -h\' for details.', cmdFlex(this))
      .demand(1, '')
      .strict(true)
      .help('h')
      .alias('h', 'help')
      .showHelpOnFail(true);

    this._commandsManager.argv;
  }

  /**
   * Executes any command handler. Ensures that results from various command executions are handled in a similar fashion.
   * If there are any requirements, they are executed first.
   * @param {Object} ctrl The controller containing command handler.
   * @param {String} commandHandler Name of the command handler.
   * @param {Array} requirements Requirements that need to be fulfilled before actually handling the command.
   * @param {Object} options Command-line positional arguments, options and flags.
   */
  executeCommandHandler(ctrl, commandHandler, requirements, options) {
    requirements = requirements || [];

    async.series([
      (next) => {
        const requiresAuth = requirements.includes(CommandRequirement.AUTH);
        if (!requiresAuth) {
          return setImmediate(next);
        }

        this.setCurrentUserFromOptions(options, next);
      },
      (next) => {
        ctrl[commandHandler].apply(ctrl, [options, next]);
      }
    ], (err, results) => {
      if (err) {
        return this.processCommandResult(err);
      }

      const result = results.pop();
      this.processCommandResult(null, result);
    });
  }

  /**
   * Applies command definitions to commands manager.
   * @param {Object[]} commandDefinitions
   * @param {String} commandDefinitions[].command Official command name.
   * @param {String} commandDefinitions[].desc Official command description.
   * @param {Function} commandDefinitions[].builder Builder function that runs before options reach command handler.
   * @param {String} commandDefinitions[].handlerName Name of command handler.
   * @param {Constants.CommandRequirement[]} commandDefinitions[].requirements Requirements that need to be fulfilled before actually handling the command.
   * @param commandsManager Currently, this is yargs.
   * @param {Object} ctrl Controller responsible for command handling.
   */
  applyCommandDefinitions(commandDefinitions, commandsManager, ctrl) {
    if (isEmpty(commandDefinitions) || !Array.isArray(commandDefinitions)) {
      throw new Error('Command definitions are either empty or not an array.');
    }

    commandDefinitions.forEach((cmdDef) => {
      const handlerName = cmdDef.handlerName;
      if (typeof ctrl[handlerName] !== 'function') {
        throw new Error(`${ctrl.constructor.name} does not contain a function called '${handlerName}'.`);
      }

      const modifiedDef = {
        command: cmdDef.command,
        desc: cmdDef.desc,
        handler: (options) => {
          // wrap command-specific handler in CLIManager's general handler
          this.executeCommandHandler(ctrl, handlerName, cmdDef.requirements, options);
        }
      };

      const ensureErrorOnUndeclaredArgs = (commandsManager) => { commandsManager.demandCommand(0, 0); };

      if (cmdDef.builder) {
        const originalBuilder = cmdDef.builder;
        modifiedDef.builder = (commandsManager) => {
          ensureErrorOnUndeclaredArgs(commandsManager);
          originalBuilder(commandsManager, this);
        };
      } else {
        modifiedDef.builder = ensureErrorOnUndeclaredArgs;
      }

      // apply command to commandsManager - basically, expose it to the world
      commandsManager.command(modifiedDef);
    });
  }

  /**
   * Makes sure that if profile exists, token will be invalidated. If an error occurs, it logs but doesn't pass it to callback.
   * @param {String} profileName
   * @param done
   * @returns {*}
   * @private
   */
  _logoutUserFromProfile(profileName, done) {
    const profile = this._setup.findProfileByName(profileName);
    if (isNullOrUndefined(profile)) {
      return setImmediate(done);
    }

    this._authentication.setCurrentUser(profile);
    this._authentication.logout((err) => {
      if (err) {
        this.log(LogLevel.DEBUG, `Failed to invalidate token for profile with name '${profileName}'.`);
      }

      done();
    });
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
    options = options || {};
    if (isNullOrUndefined(options.host)) {
      options.host = this.config.host;
    }

    if (isNullOrUndefined(options.timeout)) {
      options.timeout = this.config.timeout;
    }

    options.cliVersion = this._cliVersion;

    const reqObj = new Request(this._authentication.getCurrentUser(), options);

    this.log(LogLevel.DEBUG, 'Request:  %s %s', reqObj.options.method, reqObj.options.url);

    return reqObj.send((err, res) => {
      const status = res.statusCode || '';
      this.log(LogLevel.DEBUG, 'Response: %s %s %s', reqObj.options.method, reqObj.options.url, status);
      done(err, res.body);
    });
  }

  /**
   * Log using the logger module.
   * @param {Constants.LogLevel} logLevel
   * @param args
   */
  log(logLevel, ...args) {
    if (!StderrLogLevels.includes(logLevel)) {
      return;
    }

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
      return setImmediate(() => { done(); });
    }


    this._authentication.logout(done);
  }

  /**
   * Handles any result from command execution.
   * @param {Error} [err]
   * @param {CommandResult} [result]
   */
  processCommandResult(err, result) {
    this._clearSession(() => {
      if (err) {
        this.log(LogLevel.ERROR, err);
        return process.exit(1);
      }

      const output = result.getFormattedResult(this._outputFormat);
      this._logger.log(LogLevel.DATA, output);
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
      return setImmediate(() => { done(); });
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
    const emailIsValid = isValidEmail(email);
    if (!emailIsValid) {
      return setImmediate(() => { done(new KinveyError(Errors.InvalidEmail)); });
    }

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

    let token;

    async.series([
      (next) => {
        this.login(email, password, MFAToken, host, (err, data) => {
          if (err) {
            return next(err);
          }

          token = data.token;
          next();
        });
      },
      (next) => {
        const newUser = this._authentication.getCurrentUser();
        this._logoutUserFromProfile(profileName, () => {
          this._authentication.setCurrentUser(newUser);
          next();
        });
      },
      (next) => {
        // save profile
        this._setup.addProfile(profileName, email, token, host);
        this._setup.save(next);
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
    async.series([
      (next) => {
        this._logoutUserFromProfile(name, next);
      },
      (next) => {
        this._setup.deleteProfile(name);
        this._setup.save(next);
      }
    ], done);
  }

  getActiveProfile() {
    return this._setup.getActiveProfile();
  }

  setActiveProfile(name, done) {
    if (!this.profileExists(name)) {
      return done(new KinveyError(Errors.ProfileNotFound));
    }

    this._setup.setActiveProfile(name);
    this._setup.save(done);
  }
}

module.exports = CLIManager;
