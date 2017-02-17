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
const init = require('../lib/init.js');
const logger = require('../lib/logger.js');
const project = require('../lib/project.js');
const user = require('../lib/user.js');
const util = require('../lib/util.js');

function initUrl(host, cb) {
  if (host != null) user.host = util.formatHost(host);
  cb();
}

function configure(host, command, cb) {
  const options = init(command);
  return async.series([
    (next) => { initUrl(host, next); },
    (next) => { user.setup(options, next); },
    (next) => { project.config(options, next); },
    (next) => { user.save(next); }
  ], (err) => {
    if (err != null) {
      logger.error('%s', err);
      if (cb == null) process.exit(-1);
    }
    if (cb != null) cb(err);
  });
}

module.exports = configure;

program
  .command('config [instance]')
  .description("set project options (including optional Kinvey instance, i.e. 'acme-us1)")
  .action(configure);
