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
const isEmail = require('isemail');
const logger = require('./logger.js');
const util = require('./util.js');
const PromptMessages = require('./constants').PromptMessages;
const InfoMessages = require('./constants').InfoMessages;

function validateMfaToken(value) {
  if (/^\d{6}$/.test(value)) return true;
  return PromptMessages.INVALID_MFA_TOKEN;
}

function validateEmail(email) {
  if (isEmail(email)) return true;
  return PromptMessages.INVALID_EMAIL_ADDRESS;
}

function getApp(apps, cb) {
  logger.debug(InfoMessages.APP_PROMPTING);
  return inquirer.prompt([
    {
      message: 'Which app would you like to use?',
      name: 'app',
      type: 'list',
      choices: util.formatList(apps),
      when: apps.length > 0
    }
  ], (answers) => cb(null, answers.app));
}

function getAppOrOrg(options, cb) {
  logger.debug(InfoMessages.APP_OR_ORG_PROMPTING);
  return inquirer.prompt([
    {
      message: 'Would you like to select a service from a Kinvey app or org?',
      name: 'option',
      type: 'list',
      choices: util.formatList(options),
      when: options.length > 0
    }
  ], (answers) => cb(null, answers.option));
}

function getOrg(orgs, cb) {
  logger.debug(InfoMessages.ORG_PROMPTING);
  return inquirer.prompt([
    {
      message: 'Which organization would you like to use?',
      name: 'org',
      type: 'list',
      choices: util.formatList(orgs),
      when: orgs.length > 0
    }
  ], (answers) => cb(null, answers.org));
}

function getService(services, cb) {
  logger.debug(InfoMessages.SERVICE_PROMPTING);
  return inquirer.prompt([
    {
      message: 'Which service would you like to use?',
      name: 'service',
      type: 'list',
      choices: util.formatList(services),
      when: services.length > 0
    }
  ], (answers) => cb(null, answers.service));
}

function getEmailPassword(email, password, cb) {
  logger.debug(InfoMessages.EMAIL_PASSWORD_PROMPTING);
  return inquirer.prompt([
    {
      message: 'E-mail',
      name: 'email',
      validate: validateEmail,
      when: email == null
    }, {
      message: 'Password',
      name: 'password',
      type: 'password',
      when: password == null
    }
  ], (answers) => {
    if (answers.email != null) email = answers.email;
    if (answers.password != null) password = answers.password;
    return cb(null, email, password);
  });
}

function getTwoFactorToken(token, cb) {
  logger.debug(InfoMessages.TWO_FACTOR_TOKEN_PROMPTING);
  return inquirer.prompt([
    {
      message: 'Two-factor authentication token',
      name: 'mfaToken',
      when: token == null,
      validate: validateMfaToken
    }
  ], (answers) => {
    if (answers.mfaToken != null) token = answers.mfaToken;
    return cb(null, token);
  });
}

exports.getApp = getApp;
exports.getAppOrOrg = getAppOrOrg;
exports.getOrg = getOrg;
exports.getService = getService;
exports.getEmailPassword = getEmailPassword;
exports.getTwoFactorToken = getTwoFactorToken;
exports.validateEmail = validateEmail;
exports.validateMfaToken = validateMfaToken;
