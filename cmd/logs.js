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
const config = require('config');
const moment = require('moment');
const program = require('commander');
const service = require('../lib/service.js');
const init = require('../lib/init.js');
const logger = require('../lib/logger.js');
const project = require('../lib/project.js');
const user = require('../lib/user.js');
const handleActionFailure = require('./../lib/util').handleCommandFailure;

function validateTimestamp(ts) {
  if (ts == null) return true;
  return moment(ts, moment.ISO_8601, true).isValid();
}

function validateNumber(number) {
  if (number == null) return true;
  if (number === 0 || number === '0') return false;
  return /^\d+$/.test(number);
}

function logs(command, cb) {
  const options = init(command);

  // Validate input parameters
  if (!validateTimestamp(options.start)) return handleActionFailure(new Error('Logs \'start\' timestamp invalid (ISO-8601 expected)'), cb);
  if (!validateTimestamp(options.end)) return handleActionFailure(new Error('Logs \'end\' timestamp invalid (ISO-8601 expected)'), cb);
  if (!validateNumber(options.number)) return handleActionFailure(new Error('Logs \'number\' parameter invalid (non-zero integer expected)'), cb);
  if (!validateNumber(options.page)) return handleActionFailure(new Error('Logs \'page\' parameter invalid (non-zero integer expected)'), cb);

  return async.series([
    (next) => user.setup(options, next),
    (next) => project.restore(next),
    (next) => service.logs(options.start, options.end, options.number, options.page, next)
  ], (err) => {
    handleActionFailure(err, cb);
  });
}

module.exports = logs;

program
  .command('logs')
  .option('--start <string>', 'fetch log entries starting from provided timestamp')
  .option('--end <string>', 'fetch log entries up to provided timestamp')
  .option('--page <number>', 'page (non-zero integer, default=1)')
  .option('-n, --number <number>', `number of entries to fetch, i.e. page size (non-zero integer, default=${config.logFetchDefault}, max=${config.logFetchLimit})`)
  .description('retrieve and display Internal Flex Service logs')
  .action(logs);
