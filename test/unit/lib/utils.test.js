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

const Request = require('../../../lib/Request');
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
});