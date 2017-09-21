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

const KinveyError = require('./../../../lib/kinvey-error');
const Errors = require('./../../../lib/constants').Errors;
const helper = require('./../../tests-helper');

function assertKinveyErr(actualErr, expectedErr) {
  helper.assertions.assertError(actualErr, expectedErr);
  expect(actualErr.stack).to.exist;
  expect(actualErr instanceof Error).to.be.true;
}

describe('kinvey error', () => {
  it('from error constants should create', () => {
    const expectedErr = Errors.ProjectNotConfigured;
    const actualErr = new KinveyError(expectedErr);
    assertKinveyErr(actualErr, expectedErr);
  });

  it('from error constants and different message should create', () => {
    const expectedErr = {
      name: Errors.InvalidConfigUrl.NAME,
      message: 500
    };

    const actualErr = new KinveyError(Errors.InvalidConfigUrl, expectedErr.message);
    assertKinveyErr(actualErr, expectedErr);
  });

  it('from custom name/message object should create', () => {
    const expectedErr = {
      name: 'ErrorName',
      message: 'ErrorMsg.'
    };

    const actualErr = new KinveyError(expectedErr);
    assertKinveyErr(actualErr, expectedErr);
  });

  it('from null should create general error', () => {
    const expectedErr = {
      name: 'GeneralError',
      message: undefined
    };

    const actualErr = new KinveyError();
    assertKinveyErr(actualErr, expectedErr);
  });

  it('from undefined should create general error', () => {
    const expectedErr = {
      name: 'GeneralError',
      message: undefined
    };

    let errName;
    const actualErr = new KinveyError(errName);
    assertKinveyErr(actualErr, expectedErr);
  });
});
