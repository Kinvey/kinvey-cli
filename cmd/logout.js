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
const program = require('commander');
const logger = require('../lib/logger.coffee');
const project = require('../lib/project.coffee');
const user = require('../lib/user.coffee');

function logout(command, cb) {
  return async.series([
    (next) => { user.logout(next); },
    (next) => { project.logout(next); }
  ], (err) => {
    if (err != null) {
      logger.error('%s', err);
      if (cb == null) process.exit(-1);
    }
    if (cb != null) cb(err);
  });
}

module.exports = logout;

program
  .command('logout')
  .description('resets host, removes sessions, and clears project settings')
  .action(logout);
