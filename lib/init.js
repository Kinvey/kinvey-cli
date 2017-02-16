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

const lodashMerge = require('lodash.merge');
const updateNotifier = require('update-notifier');
const logger = require('./logger.js');
const pkg = require('../package.json');

function init(command) {
  const options = lodashMerge({}, command.opts(), command.parent.opts());

  if (options.silent != null) logger.config({ level: 3 });
  if (options.verbose != null) logger.config({ level: 0 });

  if (options.suppressVersionCheck == null) {
    logger.debug('Checking for package updates');
    updateNotifier({
      pkg,
      updateCheckInterval: 1000 * 60 * 30
    }).notify({
      defer: false
    });
  }
  return options;
}

module.exports = init;
