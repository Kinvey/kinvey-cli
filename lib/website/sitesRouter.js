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

const { CommandRequirement, CommonOptions, CommonOptionsNames, Namespace, SitesOptions, SitesOptionsNames } = require('./../Constants');

const cmdDefinitions = [
  {
    command: 'create <name>',
    desc: 'Create a website',
    builder: (commandsManager) => {
      commandsManager
        .positional('name', { describe: 'Website name' });
    },
    handlerName: 'create',
    requirements: [CommandRequirement.AUTH]
  },
  {
    command: 'list',
    desc: 'List websites',
    handlerName: 'list',
    requirements: [CommandRequirement.AUTH]
  },
  {
    command: 'show',
    desc: 'Show detailed info for the specified website',
    builder: (commandsManager) => {
      commandsManager
        .option(SitesOptionsNames.SITE, SitesOptions[SitesOptionsNames.SITE]);
    },
    handlerName: 'show',
    requirements: [CommandRequirement.AUTH]
  },
  {
    command: 'deploy',
    desc: 'Deploy your website',
    builder: (commandsManager) => {
      commandsManager
        .option(SitesOptionsNames.SITE, SitesOptions[SitesOptionsNames.SITE])
        .option('path', {
          global: false,
          type: 'string',
          description: 'Path to file or directory',
          required: true // TODO: cli-161 Decide whether to use current directory if option is not specified
        });
    },
    handlerName: 'deploy',
    requirements: [CommandRequirement.AUTH]
  },
  {
    command: 'status',
    desc: 'Status of the specified website',
    builder: (commandsManager) => {
      commandsManager
        .option(SitesOptionsNames.SITE, SitesOptions[SitesOptionsNames.SITE]);
    },
    handlerName: 'status',
    requirements: [CommandRequirement.AUTH]
  },
  {
    command: 'delete',
    desc: 'Delete the specified website',
    builder: (commandsManager) => {
      commandsManager
        .option(SitesOptionsNames.SITE, SitesOptions[SitesOptionsNames.SITE])
        .option(CommonOptionsNames.NO_PROMPT, CommonOptions[CommonOptionsNames.NO_PROMPT]);
    },
    handlerName: 'deleteSite',
    requirements: [CommandRequirement.AUTH]
  }
];

module.exports = (cliManager) => {
  const ctrl = cliManager.getController(Namespace.SITE);

  return (commandsManager) => {
    cliManager.applyCommandDefinitions(cmdDefinitions, commandsManager, ctrl);
    commandsManager.demand(1, '');
  };
};
