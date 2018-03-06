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

const { AppOptions, AppOptionsName, CollectionOptions, CollectionOptionsName, CommandRequirement, EnvOptions, EnvOptionsName, Namespace } = require('./../Constants');

const cmdDefinitions = [
  {
    command: 'create <name>',
    desc: 'Create a collection',
    builder: (commandsManager) => {
      commandsManager
        .positional('name', { describe: 'Collection name' })
        .option(EnvOptionsName.ENV, EnvOptions[EnvOptionsName.ENV])
        .option(AppOptionsName.APP, AppOptions[AppOptionsName.APP]);
    },
    handlerName: 'create',
    requirements: [CommandRequirement.AUTH]
  },
  {
    command: 'list',
    desc: 'List collections per environment',
    builder: (commandsManager) => {
      commandsManager
        .option(EnvOptionsName.ENV, EnvOptions[EnvOptionsName.ENV])
        .option(AppOptionsName.APP, AppOptions[AppOptionsName.APP]);
    },
    handlerName: 'list',
    requirements: [CommandRequirement.AUTH]
  },
  {
    command: `delete <${CollectionOptionsName.COLL}>`,
    desc: 'Delete a collection',
    builder: (commandsManager) => {
      commandsManager
        .positional(CollectionOptionsName.COLL, CollectionOptions[CollectionOptionsName.COLL])
        .option(EnvOptionsName.ENV, EnvOptions[EnvOptionsName.ENV])
        .option(AppOptionsName.APP, AppOptions[AppOptionsName.APP]);
    },
    handlerName: 'deleteCollection',
    requirements: [CommandRequirement.AUTH]
  }
];

module.exports = (cliManager) => {
  const ctrl = cliManager.getController(Namespace.COLL);

  return (commandsManager) => {
    commandsManager
      .usage(`kinvey ${Namespace.COLL} <command> [args] [options]`)
      .check(options => ctrl.preProcessOptions(options));

    cliManager.applyCommandDefinitions(cmdDefinitions, commandsManager, ctrl);
  };
};
