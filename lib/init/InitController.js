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
const { askForValue, formatHost, isMFATokenError, validateEmail, validateMFAToken, validateString } = require('../Utils');

const BaseController = require('../BaseController');

/**
 * Handles CLI initialization command (kinvey init).
 */
class InitController extends BaseController {
  /**
   * Builds all questions for gathering user input for profile creation. Skips some questions if their answers are already in input.
   * @param {Object} input
   * @returns {Array}
   * @private
   */
  _buildQuestions(input) {
    const questions = [];
    questions.push(this.cliManager.prompter.buildQuestion(
      PromptMessages.INPUT_EMAIL,
      AuthOptionsNames.EMAIL,
      PromptTypes.INPUT,
      AuthOptionsNames.EMAIL,
      null,
      validateEmail,
      askForValue(input[AuthOptionsNames.EMAIL])
    ));

    questions.push(this.cliManager.prompter.buildQuestion(
      PromptMessages.INPUT_PASSWORD,
      AuthOptionsNames.PASSWORD,
      PromptTypes.PASSWORD,
      null,
      null,
      validateString,
      askForValue(input[AuthOptionsNames.PASSWORD])
    ));

    questions.push(this.cliManager.prompter.buildQuestion(
      PromptMessages.INPUT_MFA_TOKEN,
      'MFAToken',
      PromptTypes.INPUT,
      null,
      null,
      validateMFAToken,
      () => input.askForMFAToken === true
    ));

    questions.push(this.cliManager.prompter.buildQuestion(
      PromptMessages.INPUT_HOST,
      AuthOptionsNames.HOST,
      PromptTypes.INPUT,
      null,
      null,
      null,
      () => input.askForInstanceId
    ));

    questions.push(this.cliManager.prompter.buildQuestion(
      PromptMessages.INPUT_PROFILE,
      AuthOptionsNames.PROFILE,
      PromptTypes.INPUT,
      null,
      null,
      validateString,
      askForValue(input[AuthOptionsNames.PROFILE])
    ));

    return questions;
  }

  _getUserInput(input, done) {
    let gatheredInput;

    async.series([
      (next) => {
        const questions = this._buildQuestions(input);
        this.cliManager.prompter.prompt(questions, (err, data) => {
          if (err) {
            return next(err);
          }

          gatheredInput = Object.assign({}, input, data);
          next(null, gatheredInput);
        });
      },
      (next) => {
        if (gatheredInput.askForProfileOverride === false || !this.cliManager.profileExists(gatheredInput[AuthOptionsNames.PROFILE])) {
          gatheredInput.operation = OperationType.CREATE;
          return setImmediate(next);
        }

        gatheredInput.operation = OperationType.UPDATE;

        const qForOverriding = this.cliManager.prompter.buildQuestion(
          PromptMessages.INPUT_OVERRIDE_PROFILE,
          'overrideProfile',
          PromptTypes.CONFIRM,
          true
        );

        this.cliManager.prompter.prompt(qForOverriding, (err, data) => {
          if (err) {
            return next(err);
          }

          if (!data.overrideProfile) {
            return next(new Error('Profile already exists. Update cancelled by user.'));
          }

          next();
        });
      }
    ], (err) => {
      if (err) {
        return done(err);
      }

      done(null, gatheredInput);
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
        const formattedHost = formatHost(host);
        this.cliManager.createProfile(result[AuthOptionsNames.PROFILE], result[AuthOptionsNames.EMAIL], result[AuthOptionsNames.PASSWORD], result.MFAToken, formattedHost, next);
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
      askForInstanceId: true
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
