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

const { CommandRequirement, ExportOptions, ExportOptionsNames, FlexOptionsNames, Namespace,
  OrgOptions, OrgOptionsName } = require('./../Constants');

const cmdDefinitions = [
  {
    command: 'create <name>',
    desc: 'Create a service',
    builder: (commandsManager) => {
      commandsManager
        .positional('name', { describe: 'Service name', type: 'string' })
        .option('file', { describe: 'Path to a service configuration file' })
        .option(OrgOptionsName.ORG, OrgOptions[OrgOptionsName.ORG]);
    },
    handlerName: 'create',
    requirements: [CommandRequirement.AUTH, CommandRequirement.ORG_AVAILABLE]
  },
  {
    command: 'apply',
    desc: 'Apply a service configuration file',
    builder: (commandsManager) => {
      commandsManager
        .option('file', { describe: 'Path to a service configuration file', required: true })
        .option(FlexOptionsNames.SERVICE_ID, {
          global: false,
          describe: 'Service ID',
          type: 'string',
          required: true
        });
    },
    handlerName: 'update',
    requirements: [CommandRequirement.AUTH]
  },
  {
    command: 'export',
    desc: 'Export a service',
    builder: (commandsManager) => {
      commandsManager
        .option(ExportOptionsNames.FILE, ExportOptions[ExportOptionsNames.FILE])
        .option(FlexOptionsNames.SERVICE_ID, {
          global: false,
          describe: 'Service ID',
          type: 'string',
          required: true
        });
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
