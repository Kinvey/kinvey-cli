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

module.exports = (ctrl) => {
  return (commandsManager) => {
    commandsManager
      .command({
        command: 'create <name>',
        desc: 'Create profile',
        builder: (commandsManager) => {
          commandsManager
            .positional('name', { describe: 'Profile name' });
        },
        handler: (options) => {
          ctrl.create(options);
        }
      })
      .command({
        command: 'list',
        desc: 'List saved profiles',
        handler: () => {
          ctrl.list();
        }
      })
      .command({
        command: 'show [name]',
        desc: 'Show detailed info for a specified profile or for the active one',
        builder: (commandsManager) => {
          commandsManager
            .positional('name', { describe: 'Profile name' });
        },
        handler: (options) => {
          ctrl.show(options.name);
        }
      })
      .command({
        command: 'use <name>',
        desc: 'Set the active profile',
        builder: (commandsManager) => {
          commandsManager
            .positional('name', { describe: 'Profile name' });
        },
        handler: (options) => {
          ctrl.use(options.name);
        }
      })
      .command({
        command: 'delete <name>',
        desc: 'Delete profile by name',
        builder: (commandsManager) => {
          commandsManager
            .positional('name', { describe: 'Profile name' });
        },
        handler: (options) => {
          ctrl.deleteProfile(options.name);
        }
      })
      .demand(1, '');
  };
};
