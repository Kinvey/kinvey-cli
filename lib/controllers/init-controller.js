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

const BaseController = require('./base-controller');

// TODO: Add logging where suitable
// TODO: Think about retrying if credentials are not valid or smth similar
class InitController extends BaseController {
  _buildMandatoryQuestions() {
    const mandatoryQuestions = [];
    mandatoryQuestions.push(this.cliManager.prompter.buildQuestion(
      PromptMessages.INPUT_EMAIL,
      AuthOptionsNames.EMAIL,
      PromptTypes.INPUT,
      null,
      null,
      utils.validateEmail
    ));

    mandatoryQuestions.push(this.cliManager.prompter.buildQuestion(
      PromptMessages.INPUT_PASSWORD,
      AuthOptionsNames.PASSWORD,
      PromptTypes.PASSWORD,
      null
    ));

    mandatoryQuestions.push(this.cliManager.prompter.buildQuestion(
      PromptMessages.INPUT_HOST,
      AuthOptionsNames.HOST,
      PromptTypes.INPUT,
      this.cliManager.config.host,
      null
    ));

    mandatoryQuestions.push(this.cliManager.prompter.buildQuestion(
      PromptMessages.INPUT_PROFILE,
      AuthOptionsNames.PROFILE,
      PromptTypes.INPUT,
      'default', // TODO: remove hard-coded str
      null
    ));

    return mandatoryQuestions;
  }

  _getMandatoryUserInput(done) {
    const questions = this._buildMandatoryQuestions();
    this.cliManager.prompter.prompt(questions, done);
  }

  _getMFATokenInput(done) {
    const question = this.cliManager.prompter.buildQuestion(
      PromptMessages.INPUT_MFA_TOKEN,
      'MFAToken',
      PromptTypes.INPUT,
      null,
      null,
      utils.validateMFAToken
    );

    this.cliManager.prompter.prompt(question, done);
  }

  // TODO: refactor this nonsense
  handleInit(done) {
    let retryCreation = false;
    let input;

    async.series([
      (next) => {
        this._getMandatoryUserInput((err, data) => {
          if (err) {
            return next(err);
          }

          input = data;
          next();
        });
      },
      (next) => {
        debugger;
        this.cliManager.createProfile(input[AuthOptionsNames.PROFILE], input[AuthOptionsNames.EMAIL], input[AuthOptionsNames.PASSWORD], input.MFAToken, input[AuthOptionsNames.HOST], (err) => {
          if (err && err.name === 'InvalidTwoFactorAuth') {
            retryCreation = true;
            this._getMFATokenInput((err, data) => {
              if (err) {
                return next(err);
              }

              input.MFAToken = data.MFAToken;
              next();
            })
          }

          next(err);
        });
      },
      (next) => {
        if (!retryCreation) {
          return next(null);
        }

        this.cliManager.createProfile(input[AuthOptionsNames.PROFILE], input[AuthOptionsNames.EMAIL], input[AuthOptionsNames.PASSWORD], input.MFAToken, input[AuthOptionsNames.HOST], next);
      }
    ], (err) => {
      this.cliManager.processCommandResult(err, null, done);
    });
  }
}

module.exports = InitController;
