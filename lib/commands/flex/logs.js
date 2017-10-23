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

const { FlexOptionsNames } = require('./../../constants');

module.exports = (ctrl) => {
  const logFetchDefault = ctrl.cliManager.config.logFetchDefault;
  const logFetchLimit = ctrl.cliManager.config.logFetchLimit;

  return {
    command: 'logs',
    desc: 'Retrieve and display Internal Flex Service logs',
    builder: (commandsManager) => {
      commandsManager
        .usage(`Note:  Version 1.x [from] and [to] params have been converted to options. Use '--${FlexOptionsNames.FROM}' and '--${FlexOptionsNames.TO}' to filter by timestamp instead.`)
        .option(
          FlexOptionsNames.FROM,
          {
            global: false,
            describe: 'Fetch log entries starting from provided timestamp',
            type: 'string'
          })
        .option(
          FlexOptionsNames.TO, {
            global: false,
            describe: 'Fetch log entries up to provided timestamp',
            type: 'string'
          })
        .option(
          FlexOptionsNames.PAGE, {
            global: false,
            describe: 'Page (non-zero integer, default=1)',
            type: 'number'
          })
        .option(
          FlexOptionsNames.NUMBER, {
            global: false,
            describe: `Number of entries to fetch, i.e. page size (non-zero integer, default=${logFetchDefault}, max=${logFetchLimit})`,
            type: 'number'
          });
    },
    handler: (options) => {
      ctrl.logs(options);
    }
  }
};
