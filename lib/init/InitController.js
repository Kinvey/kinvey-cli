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

const { AuthOptionsNames, EntityType, LogLevel, OperationType, PromptMessages, PromptTypes } = require('../Constants');
const CommandResult = require('../CommandResult');
const { askForValue, Endpoints, formatHost, formatList, isMFATokenError, isEmpty, validateEmail, validateMFAToken, validateString } = require('../Utils');

const BaseController = require('../BaseController');

/**
 * Handles CLI initialization command (kinvey init).
 */
class InitController extends BaseController {
  _getKinveyAuthInfo(input, done) {
    const kinveyAuthQuestions = [];
    kinveyAuthQuestions.push(this.cliManager.prompter.buildQuestion(
      PromptMessages.INPUT_EMAIL,
      AuthOptionsNames.EMAIL,
      PromptTypes.INPUT,
      AuthOptionsNames.EMAIL,
      null,
      validateEmail,
      askForValue(input[AuthOptionsNames.EMAIL])
    ));

    kinveyAuthQuestions.push(this.cliManager.prompter.buildQuestion(
      PromptMessages.INPUT_PASSWORD,
      AuthOptionsNames.PASSWORD,
      PromptTypes.PASSWORD,
      null,
      null,
      validateString,
      askForValue(input[AuthOptionsNames.PASSWORD])
    ));

    kinveyAuthQuestions.push(this.cliManager.prompter.buildQuestion(
      PromptMessages.INPUT_MFA_TOKEN,
      'MFAToken',
      PromptTypes.INPUT,
      null,
      null,
      validateMFAToken,
      () => input.askForMFAToken === true
    ));

    this.cliManager.prompter.prompt(kinveyAuthQuestions, (err, data) => {
      if (err) {
        return done(err);
      }

      Object.assign(input, data);
      done();
    });
  }

  /**
   * Get all enabled identity providers. Returns just Kinvey if all disabled or if feature flag is required.
   * @param instanceId
   * @param done
   * @private
   */
  _getIdentityProviders(instanceId, done) {
    const reqOptions = {
      endpoint: Endpoints.identityProviders(this.cliManager.config.defaultSchemaVersion),
      host: formatHost(instanceId),
      skipAuth: true
    };
    this.cliManager.sendRequest(reqOptions, (err, data) => {
      const kinveyIdp = { name: 'Kinvey' };
      if (err) {
        if (err.name !== 'FeatureFlagRequired') {
          return done(err);
        }

        return done(null, [kinveyIdp]);
      }

      const finalProviders = [];
      data.forEach((x) => {
        if (x.name === 'kinveyIdentity') {
          x.name = 'Kinvey';
        }

        if (x.enabled) {
          finalProviders.push(x);
        }
      });

      if (isEmpty(finalProviders)) {
        finalProviders.push(kinveyIdp);
      }

      done(null, finalProviders);
    });
  }

  _getProfileInfo(input, done) {
    const profileQ = this.cliManager.prompter.buildQuestion(
      PromptMessages.INPUT_PROFILE,
      AuthOptionsNames.PROFILE,
      PromptTypes.INPUT,
      null,
      null,
      validateString,
      askForValue(input[AuthOptionsNames.PROFILE])
    );

    this.cliManager.prompter.prompt(profileQ, (err, data) => {
      if (err) {
        return done(err);
      }

      Object.assign(input, data);
      done();
    });
  }

  _getProfileOverrideInfo(input, done) {
    if (input.askForProfileOverride === false || !this.cliManager.profileExists(input[AuthOptionsNames.PROFILE])) {
      input.operation = OperationType.CREATE;
      return setImmediate(done);
    }

    input.operation = OperationType.UPDATE;

    const qForOverriding = this.cliManager.prompter.buildQuestion(
      PromptMessages.INPUT_OVERRIDE_PROFILE,
      'overrideProfile',
      PromptTypes.CONFIRM,
      true
    );

    this.cliManager.prompter.prompt(qForOverriding, (err, data) => {
      if (err) {
        return done(err);
      }

      if (!data.overrideProfile) {
        return done(new Error('Profile already exists. Update cancelled by user.'));
      }

      done();
    });
  }

  _getHostInfo(input, done) {
    const instanceQ = this.cliManager.prompter.buildQuestion(
      PromptMessages.INPUT_HOST,
      AuthOptionsNames.HOST,
      PromptTypes.INPUT,
      null,
      null,
      null,
      () => input.askForInstanceId
    );

    this.cliManager.prompter.prompt(instanceQ, (err, data) => {
      if (err) {
        return done(err);
      }

      Object.assign(input, data);
      done();
    });
  }

  _getIdentityProviderChoice(input, done) {
    if (isEmpty(input.identityProviders) || !isEmpty(input.identityProvider)) {
      return done();
    }

    const formattedProviders = formatList(input.identityProviders);
    if (formattedProviders.length === 1) {
      input.identityProvider = formattedProviders[0];
      return done();
    }

    const providersQ = this.cliManager.prompter.buildQuestion(
      PromptMessages.INPUT_IDENTITY_PROVIDER,
      'identityProvider',
      PromptTypes.LIST,
      null,
      formattedProviders,
      () => isEmpty(input.identityProvider)
    );

    this.cliManager.prompter.prompt(providersQ, (err, data) => {
      if (err) {
        return done(err);
      }

      Object.assign(input, data);
      done();
    });
  }

  _getUserInput(input, done) {
    async.series([
      (next) => {
        this._getProfileInfo(input, next);
      },
      (next) => {
        this._getProfileOverrideInfo(input, next);
      },
      (next) => {
        this._getHostInfo(input, next);
      },
      (next) => {
        if (!isEmpty(input.identityProviders)) {
          return next();
        }

        this._getIdentityProviders(input[AuthOptionsNames.HOST], (err, data) => {
          if (err) {
            return next(err);
          }


          input.identityProviders = data;
          next();
        });
      },
      (next) => {
        this._getIdentityProviderChoice(input, next);
      },
      (next) => {
        if (!isEmpty(input.identityProvider) && input.identityProvider.name !== 'Kinvey') {
          return next();
        }

        this._getKinveyAuthInfo(input, next);
      }
    ], (err) => {
      if (err) {
        return done(err);
      }

      done(err, input);
    });
  }

  /**
   * Gathers user input and tries to create profile
   * @param {Object} input
   * @param done
   * @private
   */
  _createProfileOnce(input, done) {
    let result;

    async.series([
      (next) => {
        this._getUserInput(input, (err, receivedInput) => {
          if (err) {
            return next(err);
          }

          result = receivedInput;
          next();
        });
      },
      (next) => {
        const host = result[AuthOptionsNames.HOST] || this.cliManager.config.host;
        const options = {
          identityProvider: {
            id: result.identityProvider._id || 'Kinvey',
            name: result.identityProvider.name || 'Kinvey',
          },
          email: result[AuthOptionsNames.EMAIL],
          password: result[AuthOptionsNames.PASSWORD],
          MFAToken: result.MFAToken,
          host: formatHost(host)
        };

        this.cliManager.createProfile(result[AuthOptionsNames.PROFILE], options, next);
      }
    ], (err) => {
      done(err, result);
    });
  }

  /**
   * Tries to create a profile. If profile creation fails due to MFA token required or invalid credentials, it retries.
   * @param done
   * @private
   */
  _tryToCreateProfileRetryable(done) {
    let errProfileCreation = null;
    let input = {
      askForMFAToken: false,
      askForInstanceId: true,
      identityProvider: {}
    };

    async.doUntil(
      (next) => {
        this._createProfileOnce(input, (err, data) => {
          input = Object.assign({}, data);
          input.askForMFAToken = false;
          input.askForInstanceId = false;
          input.askForProfileOverride = false;

          if (err) {
            if (isMFATokenError(err)) {
              errProfileCreation = err;
              input.MFAToken = null;
              input.askForMFAToken = true;
              this.cliManager.log(LogLevel.WARN, err.message || 'Please enter two-factor authentication token.');
              return next(null);
            }

            if (err.name === 'InvalidCredentials') {
              errProfileCreation = err;
              input[AuthOptionsNames.EMAIL] = null;
              input[AuthOptionsNames.PASSWORD] = null;
              this.cliManager.log(LogLevel.WARN, ' Invalid credentials, please authenticate.');
              return next(null);
            }

            return next(err);
          }

          errProfileCreation = null;
          next(null);
        });
      },
      () => errProfileCreation === null,
      (err) => {
        if (err) {
          return done(err);
        }

        done(null, input);
      }
    );
  }

  /**
   * Handles the 'init' command.
   * @param options
   * @param done
   */
  handleInit(options, done) {
    this._tryToCreateProfileRetryable((err, result) => {
      if (err) {
        return done(err);
      }

      const cmdResult = new CommandResult()
        .setRawData({ id: result[AuthOptionsNames.PROFILE] })
        .setBasicMsg(result.operation, EntityType.PROFILE);
      done(null, cmdResult);
    });
  }
}

module.exports = InitController;
