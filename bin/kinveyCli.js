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

const path = require('path');
const program = require('commander');
const pkg = require('../package.json');

process.env.NODE_CONFIG_DIR = path.join(__dirname, '../config');

function cli(args) {
  program.version(pkg.version)
    .option('-e, --email <e-mail>', 'e-mail address of your Kinvey account')
    .option('--host <host>', 'set host of the Kinvey service')
    .option('-p, --password <password>', 'password of your Kinvey account')
    .option('-s, --silent', 'do not output anything')
    .option('-c, --suppress-version-check', 'do not check for package updates')
    .option('-v, --verbose', 'output debug messages');

  require('../cmd/config');
  require('../cmd/deploy.js');
  require('../cmd/list.js');
  require('../cmd/logout.js');
  require('../cmd/logs.js');
  require('../cmd/recycle.js');
  require('../cmd/status.js');
  require('../cmd/job.js');

  program.command('*').description('display usage information').action(function () {
    return program.outputHelp();
  });

  program.parse(args);

  if (!args.slice(2).length) program.outputHelp();
}

module.exports = cli;
