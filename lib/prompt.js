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

function validateEmail(email) {
  if (isEmail(email)) return true;
  return 'Please enter a valid e-mail address.';
}

function getApp(apps, cb) {
  logger.debug('Prompting for application');
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
  logger.debug('Prompting for app or organization');
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
  logger.debug('Prompting for organization');
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
  logger.debug('Prompting for service');
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
  logger.debug('Prompting for email and/or password');
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

exports.getApp = getApp;
exports.getAppOrOrg = getAppOrOrg;
exports.getOrg = getOrg;
exports.getService = getService;
exports.getEmailPassword = getEmailPassword;
