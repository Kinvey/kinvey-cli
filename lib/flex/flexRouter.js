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

const { FlexOptions, FlexOptionsNames } = require('../Constants');

module.exports = (ctrl) => {
  return (commandsManager) => {
    commandsManager
      .usage('kinvey flex <command> [args] [options]')
      .check((options) => {
        return ctrl.preProcessOptions(options);
      })
      .command({
        command: 'init',
        desc: 'Set project options',
        handler: (options) => {
          ctrl.init(options);
        }
      })
      .command({
        command: 'deploy',
        desc: 'Deploy the current project to the Kinvey FlexService Runtime',
        handler: (options) => {
          ctrl.deploy(options);
        }
      })
      .command({
        command: `job [${FlexOptionsNames.JOB_ID}]`,
        desc: 'Get the job status of a deploy/recycle command',
        builder: (commandsManager) => {
          commandsManager
            .positional('id', { describe: 'Job ID' });
        },
        handler: (options) => {
          ctrl.job(options);
        }
      })
      .command({
        command: 'status',
        desc: 'Return the health of a Flex Service cluster',
        builder: (commandsManager) => {
          commandsManager
            .option(FlexOptionsNames.SERVICE_ID, FlexOptions[FlexOptionsNames.SERVICE_ID]);
        },
        handler: (options) => {
          ctrl.status(options);
        }
      })
      .command({
        command: 'list',
        desc: 'List Internal Flex Services for an app or org',
        builder: (commandsManager) => {
          commandsManager
            .option(FlexOptionsNames.DOMAIN_TYPE, FlexOptions[FlexOptionsNames.DOMAIN_TYPE])
            .option(FlexOptionsNames.DOMAIN_ID, FlexOptions[FlexOptionsNames.DOMAIN_ID]);
        },
        handler: (options) => {
          ctrl.list(options);
        }
      })
      .command({
        command: 'logs',
        desc: 'Retrieve and display Internal Flex Service logs',
        builder: (commandsManager) => {
          const logFetchDefault = ctrl.cliManager.config.logFetchDefault;
          const logFetchLimit = ctrl.cliManager.config.logFetchLimit;

          commandsManager
            .option(FlexOptionsNames.SERVICE_ID, FlexOptions[FlexOptionsNames.SERVICE_ID])
            .option(
              FlexOptionsNames.FROM, {
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
              })
            .demandCommand(0, 0);
        },
        handler: (options) => {
          ctrl.logs(options);
        }
      })
      .command({
        command: 'recycle',
        desc: 'Recycle the Service',
        builder: (commandsManager) => {
          commandsManager
            .option(FlexOptionsNames.SERVICE_ID, FlexOptions[FlexOptionsNames.SERVICE_ID]);
        },
        handler: (options) => {
          ctrl.recycle(options);
        }
      })
      .command({
        command: 'delete',
        desc: 'Delete project settings',
        handler: () => {
          ctrl.deleteProjectSetup();
        }
      })
      .demand(1, '');
  };
};
