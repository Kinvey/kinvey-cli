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
const service = require('../lib/service.js');
const init = require('../lib/init.js');
const project = require('../lib/project.js');
const user = require('../lib/user.js');
const handleActionFailure = require('./../lib/util').handleCommandFailure;

function status(job, command, cb) {
  const options = init(command);
  return async.series([
    (next) => user.setup(options, next),
    (next) => project.restore(next),
    (next) => service.jobStatus(job, next)
  ], (err) => {
    // TODO: cb should receive result from tasks
    handleActionFailure(err, cb);
  });
}

module.exports = status;

program
  .command('job [id]')
  .description('return the job status of a deploy command')
  .action(status);
