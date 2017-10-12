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
const moment = require('moment');

const config = require('config');
const KinveyError = require('../../kinvey-error');
const service = require('../../service.js');
const init = require('../../init.js');
const project = require('../../project.js');
const user = require('../../user.js');
const handleActionFailure = require('../../util').handleCommandFailure;
const LogErrorMessages = require('../../constants').LogErrorMessages;

function isValidTimestamp(ts) {
  if (ts == null) return true;
  return moment(ts, moment.ISO_8601, true).isValid();
}

function isValidNonZeroInteger(number) {
  if (number == null) return true;
  if (number === 0 || number === '0') return false;
  return /^\d+$/.test(number);
}

function logs(argv, cb) {
  init(argv);

  // FIXME: Stop handling them before #BACK-2775 is merged into master
  // Handle deprecated logs command params
  if (argv._.includes('from') || argv._.includes('to')) {
    return handleActionFailure(new KinveyError('DeprecationError', `Version 1.x ${chalk.whiteBright('[from]')} and ${chalk.whiteBright('[to]')} params have been converted to options. Use ${chalk.blueBright('--from')} and ${chalk.blueBright('--to')} to filter by timestamp instead.`), cb);
  }

  // Validate input parameters
  if (!isValidTimestamp(argv.from)) {
    return handleActionFailure(new KinveyError('InvalidParameter', `Logs \'from\' flag ${LogErrorMessages.INVALID_TIMESTAMP}`), cb);
  } else if (!isValidTimestamp(argv.to)) {
    return handleActionFailure(new KinveyError('InvalidParameter', `Logs \'to\' flag ${LogErrorMessages.INVALID_TIMESTAMP}`), cb);
  } else if (!isValidNonZeroInteger(argv.number)) {
    return handleActionFailure(new KinveyError('InvalidParameter', `Logs \'number\' flag ${LogErrorMessages.INVALID_NONZEROINT}`), cb);
  } else if (!isValidNonZeroInteger(argv.page)) {
    return handleActionFailure(new KinveyError('InvalidParameter', `Logs \'page\' flag ${LogErrorMessages.INVALID_NONZEROINT}`), cb);
  }

  return async.series([
    (next) => user.setup(argv, next),
    (next) => project.restore(next),
    (next) => service.logs(argv.from, argv.to, argv.number, argv.page, next)
  ], (err) => {
    handleActionFailure(err, cb);
  });
}

module.exports = {
  command: 'logs',
  desc: 'retrieve and display Internal Flex Service logs',
  builder: (yargs) => {
    yargs
      .usage('Note:  Version 1.x [from] and [to] params have been converted to options. Use \'--from\' and \'--to\' to filter by timestamp instead.')
      .option(
      'from',
      {
        global: false,
        describe: 'fetch log entries starting from provided timestamp',
        type: 'string'
      })
      .option(
        'to', {
          global: false,
          describe: 'fetch log entries up to provided timestamp',
          type: 'string'
        })
      .option(
        'page', {
          global: false,
          describe: 'page (non-zero integer, default=1)',
          type: 'number'
        })
      .option(
        'number', {
          alias: 'n',
          global: false,
          describe: `number of entries to fetch, i.e. page size (non-zero integer, default=${config.logFetchDefault}, max=${config.logFetchLimit})`,
          type: 'number'
        });
  },
  handler: logs
};
