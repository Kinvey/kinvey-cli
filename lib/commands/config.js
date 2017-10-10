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
const init = require('../init.js');
const project = require('../project.js');
const user = require('../user.js');
const util = require('../util.js');
const handleActionFailure = require('../util').handleCommandFailure;

function initUrl(host, cb) {
  if (host != null) user.host = util.formatHost(host);
  cb();
}

function configure(argv, cb) {
  init(argv);
  return async.series([
    (next) => initUrl(argv.instance, next),
    (next) => user.setup(argv, next),
    (next) => project.config(argv, next),
    (next) => user.save(next)
  ], (err) => {
    handleActionFailure(err, cb);
  });
}

module.exports = {
  command: 'config [instance]',
  desc: "set project options (including optional Kinvey instance, e.g. 'acme-us1')",
  handler: configure
};
