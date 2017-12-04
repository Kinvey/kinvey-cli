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
const { AuthOptionsNames, PromptMessages, PromptTypes } = require('./../constants');
const utils = require('./../utils');

const BaseController = require('./../base-controller');

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
      utils.validateEmail,
      utils.askForValue(input[AuthOptionsNames.EMAIL])
    ));

    questions.push(this.cliManager.prompter.buildQuestion(
      PromptMessages.INPUT_PASSWORD,
      AuthOptionsNames.PASSWORD,
      PromptTypes.PASSWORD,
      null,
      null,
      utils.validateString,
      utils.askForValue(input[AuthOptionsNames.PASSWORD])
    ));

    questions.push(this.cliManager.prompter.buildQuestion(
      PromptMessages.INPUT_MFA_TOKEN,
      'MFAToken',
      PromptTypes.INPUT,
      null,
      null,
      utils.validateMFAToken,
      () => {
        return input.askForMFAToken === true;
      }
    ));

    questions.push(this.cliManager.prompter.buildQuestion(
      PromptMessages.INPUT_HOST,
      AuthOptionsNames.HOST,
      PromptTypes.INPUT,
      this.cliManager.config.host,
      null,
      null,
      utils.askForValue(input[AuthOptionsNames.HOST])
    ));

    questions.push(this.cliManager.prompter.buildQuestion(
      PromptMessages.INPUT_PROFILE,
      AuthOptionsNames.PROFILE,
      PromptTypes.INPUT,
      'default',
      null,
      null,
      utils.askForValue(input[AuthOptionsNames.PROFILE])
    ));

    return questions;
  }

  _getUserInput(input, done) {
    const questions = this._buildQuestions(input);
    this.cliManager.prompter.prompt(questions, (err, data) => {
      if (err) {
        return done(err);
      }

      const mergedData = Object.assign({}, input, data);
      done(null, mergedData);
    });
  }

  /**
   * Gathers user input and tries to create profile
   * @param {Object} input
   * @param done
   * @private
   */
  _createProfileOnce(input, done) {
    async.series([
      (next) => {
        this._getUserInput(input, (err, mergedInput) => {
          if (err) {
            return next(err);
          }

          input = mergedInput;
          next();
        });
      },
      (next) => {
        this.cliManager.createProfile(input[AuthOptionsNames.PROFILE], input[AuthOptionsNames.EMAIL], input[AuthOptionsNames.PASSWORD], input.MFAToken, input[AuthOptionsNames.HOST], next);
      }
    ], (err) => {
      done(err, input);
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
      askForMFAToken: false
    };

    async.doUntil(
      (next) => {
        this._createProfileOnce(input, (err, data) => {
          input = data;
          input.askForMFAToken = false;

          if (err) {
            if (err.name === 'InvalidTwoFactorAuth') {
              errProfileCreation = err;
              input.askForMFAToken = true;
              return next(null);
            }

            if (err.name === 'InvalidCredentials') {
              errProfileCreation = err;
              input[AuthOptionsNames.EMAIL] = null;
              input[AuthOptionsNames.PASSWORD] = null;
              return next(null);
            }

            return next(err);
          }

          errProfileCreation = null;
          next(null);
        });
      },
      () => {
        return errProfileCreation === null;
      },
      done
    );
  }

  /**
   * Handles the 'init' command.
   * @param done
   */
  handleInit(done) {
    this._tryToCreateProfileRetryable((err) => {
      this.cliManager.processCommandResult(err, null, done);
    });
  }
}

module.exports = InitController;
