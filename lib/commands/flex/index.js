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

const { getCommandNameFromOptions } = require('./../../utils');

module.exports = (ctrl) => {
  return (commandsManager) => {
    commandsManager
      .usage('kinvey flex <command> [args] [options]')
      .check((options) => {
        return ctrl.preProcessOptions(options);
      })
      .command(require('./init')(ctrl))
      .command(require('./deploy')(ctrl))
      .command(require('./job')(ctrl))
      .command(require('./status')(ctrl))
      .command(require('./list')(ctrl))
      .command(require('./logs')(ctrl))
      .command(require('./recycle')(ctrl))
      .command(require('./delete')(ctrl))
      .demand(1, '');
  };
};
