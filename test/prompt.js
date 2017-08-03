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

const sinon = require('sinon');
const inquirer = require('inquirer');

const prompt = require('../lib/prompt');
const logger = require('./../lib/logger');
const PromptMessages = require('./../lib/constants').PromptMessages;
const InfoMessages = require('./../lib/constants').InfoMessages;

function getInquirerPromptStub(sandbox, answers) {
  return sandbox.stub(inquirer, 'prompt', (questions, cb) => {
    setTimeout(() => {
      cb(answers);
    }, 0);
  });
}

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

  describe('get', () => {
    const sandbox = sinon.sandbox.create();
    const dataValue = 'someAnswerValue';
    let loggerDebugStub;

    before('setupCommonStubs', () => {
      loggerDebugStub = sandbox.stub(logger, 'debug');
    });

    afterEach(() => {
      loggerDebugStub.reset();
    });

    after(() => {
      sandbox.restore();
    });

    const testCases = [
      {
        msg: 'should provide an app',
        methodName: 'getApp',
        expectedInfoMsg: InfoMessages.APP_PROMPTING,
        nameForPrompt: 'app'
      },
      {
        msg: 'should provide app or org',
        methodName: 'getAppOrOrg',
        expectedInfoMsg: InfoMessages.APP_OR_ORG_PROMPTING,
        nameForPrompt: 'option'
      },
      {
        msg: 'should provide an org',
        methodName: 'getOrg',
        expectedInfoMsg: InfoMessages.ORG_PROMPTING,
        nameForPrompt: 'org'
      },
      {
        msg: 'should provide a service',
        methodName: 'getService',
        expectedInfoMsg: InfoMessages.SERVICE_PROMPTING,
        nameForPrompt: 'service'
      },
      {
        msg: 'should provide 2FA token',
        methodName: 'getTwoFactorToken',
        expectedInfoMsg: InfoMessages.TWO_FACTOR_TOKEN_PROMPTING,
        nameForPrompt: 'mfaToken'
      },
    ];

    testCases.forEach((x) => {
      describe(x.methodName, () => {
        let inquirerPromptStub;

        before(() => {
          inquirerPromptStub = getInquirerPromptStub(sandbox, { [x.nameForPrompt]: dataValue });
        });

        afterEach(() => {
          inquirerPromptStub.reset();
        });

        after(() => {
          inquirerPromptStub.restore();
        });

        it(x.msg, (cb) => {
          prompt[x.methodName]([], (err, actualData) => {
            expect(err).to.not.exist;
            expect(loggerDebugStub).to.be.calledOnce.and.to.be.calledWith(x.expectedInfoMsg);
            expect(inquirerPromptStub).to.be.calledOnce;
            expect(actualData).to.exist.and.to.equal(dataValue);
            cb();
          });
        });
      });
    });

    describe('get e-mail and password', () => {
      let inquirerPromptStub;

      afterEach(() => {
        inquirerPromptStub.restore();
      });

      it('should return the already provided ones if no answers from prompt', (cb) => {
        inquirerPromptStub = getInquirerPromptStub(sandbox, {});

        const expectedEmail = 'janeDoe@email.com';
        const expectedPassword = 'youShallNotPass';
        prompt.getEmailPassword(expectedEmail, expectedPassword, (err, actualEmail, actualPassword) => {
          expect(err).to.not.exist;
          expect(loggerDebugStub).to.be.calledOnce.and.to.be.calledWith(InfoMessages.EMAIL_PASSWORD_PROMPTING);
          expect(inquirerPromptStub).to.be.calledOnce;
          expect(actualEmail).to.equal(expectedEmail);
          expect(actualPassword).to.equal(expectedPassword);
          cb();
        });
      });

      it('should return email and password if answers from prompt', (cb) => {
        const expectedEmail = 'janeDoe@email.com';
        const expectedPassword = 'youShallNotPass';
        inquirerPromptStub = getInquirerPromptStub(sandbox, { email: expectedEmail, password: expectedPassword });

        prompt.getEmailPassword(null, null, (err, actualEmail, actualPassword) => {
          expect(err).to.not.exist;
          expect(loggerDebugStub).to.be.calledOnce.and.to.be.calledWith(InfoMessages.EMAIL_PASSWORD_PROMPTING);
          expect(inquirerPromptStub).to.be.calledOnce;
          expect(actualEmail).to.equal(expectedEmail);
          expect(actualPassword).to.equal(expectedPassword);
          cb();
        });
      });
    });
  });
});
