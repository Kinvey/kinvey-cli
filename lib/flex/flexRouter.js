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

const { AppOptions, AppOptionsName, CommandRequirement, CommonOptions, CommonOptionsNames, FlexOptions, FlexOptionsNames, Namespace, OrgOptions, OrgOptionsName, SubCommand } = require('../Constants');

const cmdDefinitions = [
  {
    command: 'init',
    desc: 'Set project options',
    handlerName: 'init'
  },
  {
    command: 'create <name>',
    desc: 'Create a Flex service',
    builder: (commandsManager) => {
      commandsManager
        .positional('name', { describe: 'Flex service name' })
        .option(AppOptionsName.APP, AppOptions[AppOptionsName.APP])
        .option(OrgOptionsName.ORG, OrgOptions[OrgOptionsName.ORG])
        .option(FlexOptionsNames.SERVICE_SECRET, FlexOptions[FlexOptionsNames.SERVICE_SECRET])
        .option(FlexOptionsNames.ENV_VARS, FlexOptions[FlexOptionsNames.ENV_VARS])
        .conflicts(AppOptionsName.APP, OrgOptionsName.ORG);
    },
    handlerName: 'create',
    requirements: [CommandRequirement.AUTH]
  },
  {
    command: 'deploy',
    desc: 'Deploy the current project to the Kinvey FlexService Runtime',
    builder: (commandsManager) => {
      commandsManager
        .option(FlexOptionsNames.SERVICE_ID, FlexOptions[FlexOptionsNames.SERVICE_ID])
        .option(FlexOptionsNames.ENV_VARS_REPLACE, FlexOptions[FlexOptionsNames.ENV_VARS_REPLACE])
        .option(FlexOptionsNames.ENV_VARS_SET, FlexOptions[FlexOptionsNames.ENV_VARS_SET])
        .conflicts(FlexOptionsNames.ENV_VARS_REPLACE, FlexOptionsNames.ENV_VARS_SET);
    },
    handlerName: 'deploy',
    requirements: [CommandRequirement.AUTH]
  },
  {
    command: `job [${FlexOptionsNames.JOB_ID}]`,
    desc: 'Get the job status of a deploy/recycle command',
    builder: (commandsManager) => {
      commandsManager
        .positional('id', { describe: 'Job ID' });
    },
    handlerName: 'job',
    requirements: [CommandRequirement.AUTH]
  },
  {
    command: 'status',
    desc: 'Return the health of a Flex Service cluster',
    builder: (commandsManager) => {
      commandsManager
        .option(FlexOptionsNames.SERVICE_ID, FlexOptions[FlexOptionsNames.SERVICE_ID]);
    },
    handlerName: 'status',
    requirements: [CommandRequirement.AUTH]
  },
  {
    command: SubCommand[Namespace.FLEX].SHOW,
    desc: 'Show info for a service',
    builder: (commandsManager) => {
      commandsManager
        .option(FlexOptionsNames.SERVICE_ID, FlexOptions[FlexOptionsNames.SERVICE_ID]);
    },
    handlerName: 'show',
    requirements: [CommandRequirement.AUTH]
  },
  {
    command: 'list',
    desc: 'List Internal Flex Services for an app or org',
    builder: (commandsManager) => {
      commandsManager
        .option(FlexOptionsNames.DOMAIN_TYPE, FlexOptions[FlexOptionsNames.DOMAIN_TYPE])
        .option(FlexOptionsNames.DOMAIN_ID, FlexOptions[FlexOptionsNames.DOMAIN_ID]);
    },
    handlerName: 'list',
    requirements: [CommandRequirement.AUTH]
  },
  {
    command: 'logs',
    desc: 'Retrieve and display Internal Flex Service logs',
    builder: (commandsManager, cliManager) => {
      const logFetchDefault = cliManager.config.logFetchDefault;
      const logFetchLimit = cliManager.config.logFetchLimit;

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
            type: 'number',
            alias: 'n'
          });
    },
    handlerName: 'logs',
    requirements: [CommandRequirement.AUTH]
  },
  {
    command: SubCommand[Namespace.FLEX].UPDATE,
    desc: 'Update environment variables',
    builder: (commandsManager) => {
      commandsManager
        .option(FlexOptionsNames.SERVICE_ID, FlexOptions[FlexOptionsNames.SERVICE_ID])
        .option(FlexOptionsNames.ENV_VARS_REPLACE, FlexOptions[FlexOptionsNames.ENV_VARS_REPLACE])
        .option(FlexOptionsNames.ENV_VARS_SET, FlexOptions[FlexOptionsNames.ENV_VARS_SET])
        .conflicts(FlexOptionsNames.ENV_VARS_REPLACE, FlexOptionsNames.ENV_VARS_SET);
    },
    handlerName: 'update',
    requirements: [CommandRequirement.AUTH]
  },
  {
    command: 'recycle',
    desc: 'Recycle the Service',
    builder: (commandsManager) => {
      commandsManager
        .option(FlexOptionsNames.SERVICE_ID, FlexOptions[FlexOptionsNames.SERVICE_ID]);
    },
    handlerName: 'recycle',
    requirements: [CommandRequirement.AUTH]
  },
  {
    command: 'delete',
    desc: 'Delete service',
    builder: (commandsManager) => {
      commandsManager
        .option(FlexOptionsNames.SERVICE_ID, FlexOptions[FlexOptionsNames.SERVICE_ID])
        .option(CommonOptionsNames.NO_PROMPT, CommonOptions[CommonOptionsNames.NO_PROMPT]);
    },
    handlerName: 'deleteService',
    requirements: [CommandRequirement.AUTH]
  },
  {
    command: SubCommand[Namespace.FLEX].CLEAR,
    desc: 'Clear project settings',
    handlerName: 'deleteProjectSetup'
  }
];

module.exports = (cliManager) => {
  const ctrl = cliManager.getController(Namespace.FLEX);

  return (commandsManager) => {
    commandsManager
      .usage('kinvey flex <command> [args] [options]')
      .check(options => ctrl.preProcessOptions(options));

    cliManager.applyCommandDefinitions(cmdDefinitions, commandsManager, ctrl);

    commandsManager.demand(1, '');
  };
};
