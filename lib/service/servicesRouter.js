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

const { AppOptions, AppOptionsName, CommandRequirement, FlexOptionsNames, FlexOptions, Namespace, OrgOptions, OrgOptionsName } = require('./../Constants');

const cmdDefinitions = [
  {
    command: 'create <name> <file>',
    desc: 'Create a service',
    builder: (commandsManager) => {
      commandsManager
        .positional('name', { describe: 'Service name' })
        .positional('file', { describe: 'Path to a service configuration file' })
        .option(AppOptionsName.APP, AppOptions[AppOptionsName.APP])
        .option(OrgOptionsName.ORG, OrgOptions[OrgOptionsName.ORG])
        .conflicts(AppOptionsName.APP, OrgOptionsName.ORG);
    },
    handlerName: 'create',
    requirements: [CommandRequirement.AUTH]
  },
  {
    command: `push <${FlexOptionsNames.SERVICE_ID}> <file>`,
    desc: 'Update a service',
    builder: (commandsManager) => {
      commandsManager
        .positional(FlexOptionsNames.SERVICE_ID, FlexOptions[FlexOptionsNames.SERVICE_ID])
        .positional('file', { describe: 'Path to a service configuration file' });
    },
    handlerName: 'update',
    requirements: [CommandRequirement.AUTH]
  },
  {
    command: `export <file> <${FlexOptionsNames.SERVICE_ID}>`,
    desc: 'Export a service',
    builder: (commandsManager) => {
      commandsManager
        .positional('file', { describe: 'Path to file' })
        .positional(FlexOptionsNames.SERVICE_ID, FlexOptions[FlexOptionsNames.SERVICE_ID]);
    },
    handlerName: 'exportService',
    requirements: [CommandRequirement.AUTH]
  }
];

module.exports = (cliManager) => {
  const ctrl = cliManager.getController(Namespace.SERVICE);

  return (commandsManager) => {
    cliManager.applyCommandDefinitions(cmdDefinitions, commandsManager, ctrl);
    commandsManager.demand(1, '');
  };
};
