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

const { Namespace } = require('./../Constants');

const cmdDefinitions = [
  {
    command: 'create <name>',
    desc: 'Create profile',
    builder: (commandsManager) => {
      commandsManager
        .positional('name', { describe: 'Profile name' });
    },
    handlerName: 'create'
  },
  {
    command: 'list',
    desc: 'List saved profiles',
    handlerName: 'list'
  },
  {
    command: 'show [name]',
    desc: 'View detailed info for a profile. If no profile is specified, the active profile is used.',
    builder: (commandsManager) => {
      commandsManager
        .positional('name', { describe: 'Profile name' });
    },
    handlerName: 'show'
  },
  {
    command: 'use <name>',
    desc: 'Set the active profile',
    builder: (commandsManager) => {
      commandsManager
        .positional('name', { describe: 'Profile name' });
    },
    handlerName: 'use'
  },
  {
    command: 'delete [name]',
    desc: 'Delete a specified profile or the active one',
    builder: (commandsManager) => {
      commandsManager
        .positional('name', { describe: 'Profile name' });
    },
    handlerName: 'deleteProfile'
  },
  {
    command: 'login [name]',
    desc: 'Re-authenticate a profile. If no profile is specified, the active profile is used.',
    builder: (commandsManager) => {
      commandsManager
        .positional('name', { describe: 'Profile name' });
    },
    handlerName: 'login'
  }
];

module.exports = (cliManager) => {
  const ctrl = cliManager.getController(Namespace.PROFILE);

  return (commandsManager) => {
    cliManager.applyCommandDefinitions(cmdDefinitions, commandsManager, ctrl);
    commandsManager.demand(1, '');
  };
};
