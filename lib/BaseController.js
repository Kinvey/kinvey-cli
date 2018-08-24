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

const { PromptTypes } = require('./Constants');

class BaseController {
  constructor({ cliManager, exporter }) {
    this.cliManager = cliManager;
    this.exporter = exporter;
  }

  confirmDeleteOperation(noPrompt, entityType, identifier, done) {
    if (noPrompt) {
      return setImmediate(done);
    }

    const msg = `Are you sure you want to delete ${entityType} with identifier '${identifier}'?`;
    const q = this.cliManager.prompter.buildQuestion(msg, 'confirmDelete', PromptTypes.CONFIRM, true);
    this.cliManager.prompter.prompt(q, (err, data) => {
      if (err) {
        return done(err);
      }

      if (!data.confirmDelete) {
        return done(new Error('Delete cancelled by user.'));
      }

      done();
    });
  }
}

module.exports = BaseController;
