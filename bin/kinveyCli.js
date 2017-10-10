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
// Make sure config path is set before requiring anything
process.env.NODE_CONFIG_DIR = path.join(__dirname, '../config');

const yargs = require('yargs');

const cmdConfig = require('./../lib/commands/config');
const cmdLogout = require('./../lib/commands/logout');
const cmdDeploy = require('./../lib/commands/deploy');
const cmdJob = require('./../lib/commands/job');
const cmdRecycle = require('./../lib/commands/recycle');
const cmdStatus = require('./../lib/commands/status');
const cmdList = require('./../lib/commands/list');
const cmdLogs = require('./../lib/commands/logs');

function cli(args) {
  // for testing purposes
  if (args) {
    yargs(args);
  }

  const argv = yargs
    .usage('kinvey <command> [args] [options]')
    .option(
      'email', {
        alias: 'e',
        global: true,
        describe: 'e-mail address of your Kinvey account',
        type: 'string'
      }
    )
    .option(
      'password', {
        alias: 'p',
        global: true,
        describe: 'password of your Kinvey account',
        type: 'string'
      }
    )
    .option(
      'silent', {
        alias: 's',
        global: true,
        describe: 'do not output anything',
        type: 'boolean'
      }
    )
    .option(
      'suppress-version-check', {
        alias: 'c',
        global: true,
        describe: 'do not check for package updates',
        type: 'boolean'
      }
    )
    .option('verbose', {
      alias: 'v',
      global: true,
      describe: 'output debug messages',
      type: 'boolean'
    })
    .command(cmdConfig)
    .command(cmdLogout)
    .command(cmdDeploy)
    .command(cmdJob)
    .command(cmdRecycle)
    .command(cmdStatus)
    .command(cmdList)
    .command(cmdLogs)
    .demand(1, '')
    .strict(true)
    .help('h')
    .alias('h', 'help')
    .showHelpOnFail(true)
    .argv;
}

module.exports = cli;
