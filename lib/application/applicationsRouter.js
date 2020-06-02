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

const { AppOptions, AppOptionsName, CommandRequirement, CommonOptions, CommonOptionsNames, ExportOptions, ExportOptionsNames,
  Namespace, OrgOptions, OrgOptionsName } = require('./../Constants');

const cmdDefinitions = [
  {
    command: 'create <name>',
    desc: 'Create an application',
    builder: (commandsManager) => {
      commandsManager
        .positional('name', { describe: 'App name', type: 'string' })
        .option('file', { describe: 'Path to an application configuration file' })
        .option(OrgOptionsName.ORG, OrgOptions[OrgOptionsName.ORG]);
    },
    handlerName: 'create',
    requirements: [CommandRequirement.AUTH, CommandRequirement.ORG_AVAILABLE]
  },
  {
    command: 'apply',
    desc: 'Apply an application configuration file',
    builder: (commandsManager) => {
      commandsManager
        .option('file', { describe: 'Path to an application configuration file', required: true })
        .option(AppOptionsName.APP, AppOptions[AppOptionsName.APP]);
    },
    handlerName: 'update',
    requirements: [CommandRequirement.AUTH]
  },
  {
    command: 'list',
    desc: 'List applications',
    handlerName: 'list',
    requirements: [CommandRequirement.AUTH]
  },
  {
    command: 'show',
    desc: 'Show detailed info for a specified app or for the active one',
    builder: (commandsManager) => {
      commandsManager
        .option(AppOptionsName.APP, AppOptions[AppOptionsName.APP]);
    },
    handlerName: 'show',
    requirements: [CommandRequirement.AUTH]
  },
  {
    command: `use <${AppOptionsName.APP}>`,
    desc: 'Set the active application',
    builder: (commandsManager) => {
      commandsManager
        .positional(AppOptionsName.APP, AppOptions[AppOptionsName.APP]);
    },
    handlerName: 'use',
    requirements: [CommandRequirement.PROFILE_AVAILABLE]
  },
  {
    command: 'export',
    desc: 'Export the specified app or the active one',
    builder: (commandsManager) => {
      commandsManager
        .option(ExportOptionsNames.FILE, ExportOptions[ExportOptionsNames.FILE])
        .option(AppOptionsName.APP, AppOptions[AppOptionsName.APP]);
    },
    handlerName: 'exportApp',
    requirements: [CommandRequirement.AUTH]
  },
  {
    command: 'delete',
    desc: 'Delete a specified app or the active one',
    builder: (commandsManager) => {
      commandsManager
        .option(AppOptionsName.APP, AppOptions[AppOptionsName.APP])
        .option(CommonOptionsNames.NO_PROMPT, CommonOptions[CommonOptionsNames.NO_PROMPT]);
    },
    handlerName: 'deleteApp',
    requirements: [CommandRequirement.AUTH]
  }
];

module.exports = (cliManager) => {
  const ctrl = cliManager.getController(Namespace.APP);

  return (commandsManager) => {
    cliManager.applyCommandDefinitions(cmdDefinitions, commandsManager, ctrl);
    commandsManager.demand(1, '');
  };
};
