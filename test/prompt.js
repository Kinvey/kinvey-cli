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

const prompt = require('../lib/prompt');
const PromptMessages = require('./../lib/constants').PromptMessages;

describe('prompt', () => {
  describe('validate e-mail address', () => {
    const failureResult = PromptMessages.INVALID_EMAIL_ADDRESS;
    const testCases = [
      { value: 'abc@email.com', expectedResult: true },
      { value: 'jane+doe@domain.com', expectedResult: true },
      { value: 'email@domain.co.jp', expectedResult: true },
      { value: 'email@123.123.123.123', expectedResult: true },
      { value: 'abc', expectedResult: failureResult },
      { value: '', expectedResult: failureResult },
      { value: '#@%^%#$@#$@#.com', expectedResult: failureResult },
      { value: '@domain.com', expectedResult: failureResult },
    ];

    testCases.forEach((x) => {
      it(`should return '${x.expectedResult}' when ${x.value}`, () => {
        const actualResult = prompt.validateEmail(x.value);
        expect(actualResult).to.eql(x.expectedResult);
      });
    });
  });

  describe('validate 2FA token', () => {
    const failureResult = PromptMessages.INVALID_MFA_TOKEN;
    const testCases = [
      { value: '012345', expectedResult: true },
      { value: '000000', expectedResult: true },
      { value: '      ', expectedResult: failureResult },
      { value: '123456 ', expectedResult: failureResult },
      { value: ' 123456', expectedResult: failureResult },
      { value: 'abc', expectedResult: failureResult },
      { value: '', expectedResult: failureResult },
      { value: 'abcdef', expectedResult: failureResult },
      { value: '12345', expectedResult: failureResult },
      { value: '1234567', expectedResult: failureResult },
      { value: '_asdfaih#%$@NUG@A', expectedResult: failureResult },
      { value: null, expectedResult: failureResult },
    ];

    testCases.forEach((x) => {
      it(`should return '${x.expectedResult}' when ${x.value}`, () => {
        const actualResult = prompt.validateMfaToken(x.value);
        expect(actualResult).to.eql(x.expectedResult);
      });
    });
  });
});
