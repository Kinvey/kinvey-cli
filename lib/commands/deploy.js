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
const service = require('../service.js');
const init = require('../init.js');
const project = require('../project.js');
const user = require('../user.js');
const handleActionFailure = require('../util').handleCommandFailure;

function deploy(argv, cb) {
  init(argv);
  return async.waterfall([
    (next) => user.setup(argv, next),
    (next) => project.restore(next),
    (next) => service.validate(config.paths.package, next),
    (version, next) => service.deploy(config.paths.package, version, next)
  ], (err) => {
    handleActionFailure(err, cb);
  });
}

module.exports = {
  command: 'deploy',
  desc: 'deploy the current project to the Kinvey FlexService Runtime',
  handler: deploy
};
