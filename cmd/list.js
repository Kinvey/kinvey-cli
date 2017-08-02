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
const init = require('../lib/init.js');
const logger = require('../lib/logger.js');
const program = require('commander');
const project = require('../lib/project.js');
const user = require('../lib/user.js');
const handleActionFailure = require('./../lib/util').handleActionFailure;

function list(command, cb) {
  const options = init(command);
  return async.series([
    (next) => user.setup(options, next),
    (next) => project.restore(next),
    (next) => project.list(next)
  ], (err) => {
    handleActionFailure(err, cb);
  });
}

module.exports = list;

program
  .command('list')
  .description('list Internal Flex Services for the current app')
  .action(list);
