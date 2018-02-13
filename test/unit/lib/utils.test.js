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

const Utils = require('../../../lib/Utils');

const fixtureServices = require('./../../fixtures/datalinks.json');
const fixtureNotInternalService = require('./../../fixtures/datalink.json');

function assertAreOnlyInternalServices(actualServices) {
  expect(actualServices).to.be.an('array');
  actualServices.forEach((service) => {
    expect(service.type).to.equal('internal');
  });
}

describe('Utils', () => {
  describe('findAndSortInternalServices', () => {
    it('multiple services when there is one internal should return only internal', () => {
      const actual = Utils.findAndSortInternalServices(fixtureServices);
      assertAreOnlyInternalServices(actual);
    });

    it('multiple services when there are no internal should return empty array', () => {
      const services = [];
      for (let i = 0; i < 3; i += 1) {
        services.push(fixtureNotInternalService);
      }

      const actual = Utils.findAndSortInternalServices(services);
      expect(actual).to.be.an('array').that.is.empty;
    });

    it('no services should return empty array', () => {
      const actual = Utils.findAndSortInternalServices([]);
      expect(actual).to.be.an('array').that.is.empty;
    });

    it('multiple services when there are internal should return only internal sorted', () => {
      const fakeServices = [
        { type: 'internal', name: 'someName' },
        { type: 'internal', name: 'zero' },
        { type: 'shouldNotShow', name: 'y' },
        { type: 'internal', name: '2d2r' },
      ];

      const actual = Utils.findAndSortInternalServices(fakeServices);
      expect(actual).to.be.an('array');
      expect(actual.length).to.equal(3);
      expect(actual[0].name).to.equal('2d2r');
      expect(actual[1].name).to.equal('someName');
      expect(actual[2].name).to.equal('zero');
    });
  });

  describe('formatHost', () => {
    it('should add a trailing backslash if one is not supplied', () => {
      const host = 'http://host:123';
      const actual = Utils.formatHost(host);
      expect(actual).to.equal(`${host}/`);
    });

    it('should not alter already formatted custom HTTPS host', () => {
      const host = 'https://host:123/';
      const actual = Utils.formatHost(host);
      expect(actual).to.equal(host);
    });

    it('should return correct host when only an instance', () => {
      const instance = '123';
      const actual = Utils.formatHost(instance);
      expect(actual).to.equal(`https://${instance}-manage.kinvey.com/`);
    });
  });

  describe('isValidMFAToken', () => {
    const failureResult = false;
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
        const actualResult = Utils.isValidMFAToken(x.value);
        expect(actualResult).to.eql(x.expectedResult);
      });
    });
  });

  describe('isValidEmail', () => {
    const failureResult = false;
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
        const actualResult = Utils.isValidEmail(x.value);
        expect(actualResult).to.eql(x.expectedResult);
      });
    });
  });

  describe('isValidNonZeroInteger', () => {
    const testCases = [
      { value: 5, expectedResult: true },
      { value: 0, expectedResult: false },
      { value: '0', expectedResult: false },
      { value: -1, expectedResult: false },
      { value: 5.5, expectedResult: false },
      { value: Number.MAX_SAFE_INTEGER, expectedResult: true },
      { value: undefined, expectedResult: false },
      { value: 'textHere', expectedResult: false }
    ];

    testCases.forEach((x) => {
      it(`should return '${x.expectedResult}' when ${x.value}`, () => {
        const actualResult = Utils.isValidNonZeroInteger(x.value);
        expect(actualResult).to.eql(x.expectedResult);
      });
    });
  });
});
