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

const { AppOptions, AppOptionsName, CommandRequirement, CommonOptions, CommonOptionsNames, EnvOptions, EnvOptionsName, Namespace } = require('./../Constants');

const cmdDefinitions = [
  {
    command: 'create <name> [file]',
    desc: 'Create an environment',
    builder: (commandsManager) => {
      commandsManager
        .positional('name', { describe: 'Env name' })
        .positional('file', { describe: 'Path to an environment configuration file' })
        .option(AppOptionsName.APP, AppOptions[AppOptionsName.APP]);
    },
    handlerName: 'create',
    requirements: [CommandRequirement.AUTH]
  },
  {
    command: `push <file> [${EnvOptionsName.ENV}]`,
    desc: 'Update an environment',
    builder: (commandsManager) => {
      commandsManager
        .positional('file', { describe: 'Path to an environment configuration file' })
        .positional(EnvOptionsName.ENV, EnvOptions[EnvOptionsName.ENV])
        .option(AppOptionsName.APP, AppOptions[AppOptionsName.APP]);
    },
    handlerName: 'update',
    requirements: [CommandRequirement.AUTH]
  },
  {
    command: 'list',
    desc: 'List environments per app',
    builder: (commandsManager) => {
      commandsManager
        .option(AppOptionsName.APP, AppOptions[AppOptionsName.APP]);
    },
    handlerName: 'list',
    requirements: [CommandRequirement.AUTH]
  },
  {
    command: `show [${EnvOptionsName.ENV}]`,
    desc: 'Show detailed info for a specified environment or for the active one',
    builder: (commandsManager) => {
      commandsManager
        .positional(EnvOptionsName.ENV, EnvOptions[EnvOptionsName.ENV])
        .option(AppOptionsName.APP, AppOptions[AppOptionsName.APP]);
    },
    handlerName: 'show',
    requirements: [CommandRequirement.AUTH]
  },
  {
    command: `use <${EnvOptionsName.ENV}>`,
    desc: 'Set the active environment',
    builder: (commandsManager) => {
      commandsManager
        .positional(EnvOptionsName.ENV, EnvOptions[EnvOptionsName.ENV])
        .option(AppOptionsName.APP, AppOptions[AppOptionsName.APP]);
    },
    handlerName: 'use',
    requirements: [CommandRequirement.PROFILE_AVAILABLE]
  },
  {
    command: `delete [${EnvOptionsName.ENV}]`,
    desc: 'Delete a specified environment or the active one',
    builder: (commandsManager) => {
      commandsManager
        .positional(EnvOptionsName.ENV, EnvOptions[EnvOptionsName.ENV])
        .option(AppOptionsName.APP, AppOptions[AppOptionsName.APP])
        .option(CommonOptionsNames.NO_PROMPT, CommonOptions[CommonOptionsNames.NO_PROMPT]);
    },
    handlerName: 'deleteEnv',
    requirements: [CommandRequirement.AUTH]
  },
  {
    command: `export <file> [${EnvOptionsName.ENV}]`,
    desc: 'Export environment configuration to a file',
    builder: (commandsManager) => {
      commandsManager
        .positional('file', { describe: 'Path to an environment configuration file' })
        .positional(EnvOptionsName.ENV, EnvOptions[EnvOptionsName.ENV])
        .option(AppOptionsName.APP, AppOptions[AppOptionsName.APP])
        .option(CommonOptionsNames.NO_PROMPT, CommonOptions[CommonOptionsNames.NO_PROMPT]);
    },
    handlerName: 'export',
    requirements: [CommandRequirement.AUTH]
  }
];

module.exports = (cliManager) => {
  const ctrl = cliManager.getController(Namespace.ENV);

  return (commandsManager) => {
    commandsManager
      .usage(`kinvey ${Namespace.ENV} <command> [args] [options]`)
      .check(options => ctrl.preProcessOptions(options));

    cliManager.applyCommandDefinitions(cmdDefinitions, commandsManager, ctrl);
  };
};
