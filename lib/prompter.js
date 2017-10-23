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

const inquirer = require('inquirer');

/**
 * Serves as a wrapper around the module used for gathering user input.
 */
class Prompter {
  /**
   * Prompts with the specified question(s).
   * @param {Array|Object} question
   * @param {string} question.message
   * @param {string} question.name
   * @param {string} question.type
   * @param {Array} [question.choices]
   * @param [question.validate]
   * @param [question.when]
   * @param done
   */
  static prompt(question, done) {
    if (!Array.isArray(question)) {
      question = [question];
    }

    inquirer.prompt(question, (data) => {
      done(null, data);
    });
  }

  /**
   * Builds a question.
   * @param message
   * @param name
   * @param type
   * @param defaultValue
   * @param choices
   * @param validate
   * @param when
   * @returns {{message: *, name: *, type: *, choices: *, validate: *, when: *}}
   */
  static buildQuestion(message, name, type, defaultValue, choices, validate, when) {
    return {
      message,
      name,
      type,
      choices,
      validate,
      when,
      'default': defaultValue
    };
  }
}

module.exports = Prompter;
