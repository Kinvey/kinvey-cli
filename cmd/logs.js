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
const chalk = require('chalk');
const config = require('config');
const KinveyError = require('../lib/kinvey-error');
const moment = require('moment');
const program = require('commander');
const service = require('../lib/service.js');
const init = require('../lib/init.js');
const project = require('../lib/project.js');
const user = require('../lib/user.js');
const handleActionFailure = require('./../lib/util').handleCommandFailure;
const LogErrorMessages = require('../lib/constants').LogErrorMessages;

function isValidTimestamp(ts) {
  if (ts == null) return true;
  return moment(ts, moment.ISO_8601, true).isValid();
}

function isValidNonZeroInteger(number) {
  if (number == null) return true;
  if (number === 0 || number === '0') return false;
  return /^\d+$/.test(number);
}

function logs(argsArray, command, cb) {
  const options = init(command);

  // Handle deprecated logs command params
  if (argsArray != null && argsArray.length > 0) {
    return handleActionFailure(new KinveyError('DeprecationError', `Version 1.x ${chalk.whiteBright('[from]')} and ${chalk.whiteBright('[to]')} params have been converted to options. Use ${chalk.blueBright('--from')} and ${chalk.blueBright('--to')} to filter by timestamp instead.`), cb);
  }

  // Validate input parameters
  if (!isValidTimestamp(options.from)) {
    return handleActionFailure(new KinveyError('InvalidParameter', `Logs \'from\' flag ${LogErrorMessages.INVALID_TIMESTAMP}`), cb);
  } else if (!isValidTimestamp(options.to)) {
    return handleActionFailure(new KinveyError('InvalidParameter', `Logs \'to\' flag ${LogErrorMessages.INVALID_TIMESTAMP}`), cb);
  } else if (!isValidNonZeroInteger(options.number)) {
    return handleActionFailure(new KinveyError('InvalidParameter', `Logs \'number\' flag ${LogErrorMessages.INVALID_NONZEROINT}`), cb);
  } else if (!isValidNonZeroInteger(options.page)) {
    return handleActionFailure(new KinveyError('InvalidParameter', `Logs \'page\' flag ${LogErrorMessages.INVALID_NONZEROINT}`), cb);
  }

  return async.series([
    (next) => user.setup(options, next),
    (next) => project.restore(next),
    (next) => service.logs(options.from, options.to, options.number, options.page, next)
  ], (err) => {
    handleActionFailure(err, cb);
  });
}

module.exports = logs;

program
  .command('logs [params...]')
  .option('--from <string>', 'fetch log entries starting from provided timestamp')
  .option('--to <string>', 'fetch log entries up to provided timestamp')
  .option('--page <number>', 'page (non-zero integer, default=1)')
  .option('-n, --number <number>', `number of entries to fetch, i.e. page size (non-zero integer, default=${config.logFetchDefault}, max=${config.logFetchLimit})`)
  .description('retrieve and display Internal Flex Service logs')
  .action(logs)
    .on('--help', () => {
      console.log('    Note:  Version 1.x [from] and [to] params have been converted to options. Use \'--from\' and \'--to\' to filter by timestamp instead.\n');
    });
