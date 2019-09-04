/**
 * Copyright (c) 2018, Kinvey, Inc. All rights reserved.
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

const yargs = require('yargs');

const path = require('path');
// advisable to happen before any other require
process.env.NODE_CONFIG_DIR = path.join(__dirname, 'config');

const updateNotifier = require('update-notifier');

const config = require('config');
const CLIManager = require('./lib/CLIManager');
const logger = require('./lib/logger.js');
const pkg = require('./package.json');
const Setup = require('./lib/Setup');

const setup = new Setup(config.paths.session);
const notifier = updateNotifier({
  pkg,
  updateCheckInterval: 1000 * 60 * 60
});
const cliVersion = pkg.version;
const Prompter = require('./lib/Prompter');

const kinveyCLIManager = new CLIManager({ setup, config, logger, notifier, cliVersion, prompter: Prompter, commandsManager: yargs });
kinveyCLIManager.init();
