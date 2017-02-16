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
const moment = require('moment');
const program = require('commander');
const service = require('../lib/service.js');
const init = require('../lib/init.js');
const logger = require('../lib/logger.js');
const project = require('../lib/project.js');
const user = require('../lib/user.coffee');

function validateTimestamp(ts) {
  if (ts == null) return true;
  return moment(ts, moment.ISO_8601, true).isValid();
}

function logs(from, to, command, cb) {
  const options = init(command);
  if (!validateTimestamp(from)) return cb(new Error('Logs \'from\' timestamp invalid (ISO-8601 required)'));
  if (!validateTimestamp(to)) return cb(new Error('Logs \'to\' timestamp invalid (ISO-8601 required)'));
  return async.series([
    (next) => { user.setup(options, next); },
    project.restore,
    (next) => { service.logs(from, to, next); }
  ], (err) => {
    if (err != null) {
      logger.error('%s', err);
      if (cb == null) process.exit(-1);
    }
    if (cb != null) cb(err);
  });
}

module.exports = logs;

program
  .command('logs [from] [to]')
  .description('retrieve and display Internal Flex Service logs')
  .action(logs);
