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

describe('prompt', () => {
  it('should validate an email address', () => {
    let result = prompt.validateEmail('abc');
    expect(result).to.eql('Please enter a valid e-mail address.');
    result = prompt.validateEmail('');
    expect(result).to.eql('Please enter a valid e-mail address.');
    result = prompt.validateEmail('abc@email.com');
    expect(result).to.eql(true);
  });
  it('should validate a 2FA token', () => {
    let result = prompt.validateMfaToken('abc');
    expect(result).to.eql('Please enter a valid 2FA token (6 digits).');
    result = prompt.validateMfaToken('abcdef');
    expect(result).to.eql('Please enter a valid 2FA token (6 digits).');
    result = prompt.validateMfaToken('123');
    expect(result).to.eql('Please enter a valid 2FA token (6 digits).');
    result = prompt.validateMfaToken('1234567');
    expect(result).to.eql('Please enter a valid 2FA token (6 digits).');
    result = prompt.validateMfaToken('_asdfaih#%$@NUG@A');
    expect(result).to.eql('Please enter a valid 2FA token (6 digits).');
    result = prompt.validateMfaToken('');
    expect(result).to.eql('Please enter a valid 2FA token (6 digits).');
    result = prompt.validateMfaToken('123456');
    expect(result).to.eql(true);
  });
});
