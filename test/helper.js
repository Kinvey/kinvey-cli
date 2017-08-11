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

const logger = require('../lib/logger');

const helper = {};

helper.assertions = {
  assertCmdCommandWithoutCallbackForError(expectedErr) {
    expect(process.exit).to.be.calledOnce;
    expect(process.exit).to.be.calledWith(-1);
    expect(logger.error).to.be.calledOnce;
    expect(logger.error).to.be.calledWith('%s', expectedErr);
  },
  assertCmdCommandWithCallbackForError(actualErr, expectedErr) {
    expect(actualErr).to.exist;
    expect(logger.error).to.be.calledOnce;
    expect(logger.error).to.be.calledWith('%s', expectedErr);
    expect(actualErr).to.equal(expectedErr);
  }
};

module.exports = helper;
