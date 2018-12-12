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

const { CommandRequirement, Namespace, OrgOptions, OrgOptionsName } = require('./../Constants');

const cmdDefinitions = [
  {
    command: 'push <file>',
    desc: 'Update an organization',
    builder: (commandsManager) => {
      commandsManager
        .positional('file', { describe: 'Path to an organization configuration file' })
        .option(OrgOptionsName.ORG, OrgOptions[OrgOptionsName.ORG]);
    },
    handlerName: 'update',
    requirements: [CommandRequirement.AUTH]
  },
  {
    command: 'list',
    desc: 'List organizations',
    handlerName: 'list',
    requirements: [CommandRequirement.AUTH]
  },
  {
    command: 'show',
    desc: 'Show detailed info for a specified org or for the active one',
    builder: (commandsManager) => {
      commandsManager
        .option(OrgOptionsName.ORG, OrgOptions[OrgOptionsName.ORG]);
    },
    handlerName: 'show',
    requirements: [CommandRequirement.AUTH]
  },
  {
    command: `use <${OrgOptionsName.ORG}>`,
    desc: 'Set the active organization',
    builder: (commandsManager) => {
      commandsManager
        .positional(OrgOptionsName.ORG, OrgOptions[OrgOptionsName.ORG]);
    },
    handlerName: 'use',
    requirements: [CommandRequirement.PROFILE_AVAILABLE]
  },
  {
    command: 'export <file>',
    desc: 'Export the specified org or the active one',
    builder: (commandsManager) => {
      commandsManager
        .positional('file', { describe: 'Path to file' })
        .option(OrgOptionsName.ORG, OrgOptions[OrgOptionsName.ORG]);
    },
    handlerName: 'exportOrg',
    requirements: [CommandRequirement.AUTH]
  }
];

module.exports = (cliManager) => {
  const ctrl = cliManager.getController(Namespace.ORG);

  return (commandsManager) => {
    cliManager.applyCommandDefinitions(cmdDefinitions, commandsManager, ctrl);
    commandsManager.demand(1, '');
  };
};
