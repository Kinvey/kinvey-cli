/**
 * Copyright (c) 2019, Kinvey, Inc. All rights reserved.
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

const BaseService = require('../../../lib/BaseService');

describe('BaseService', () => {
  describe('getEntityByName', () => {
    const entitiesList = [{ name: 'test' }, { name: 'another' }, { name: 'test' }];

    it('when no entities should return NotFound error', (done) => {
      const cliManager = { sendRequest: (x, cb) => cb(null, []) };
      const baseService = new BaseService(cliManager);
      baseService.getEntityByName('test', 'test', (err) => {
        expect(err).to.exist;
        expect(err.name).to.equal('NotFound');
        done();
      });
    });

    it('when several entities have the same name should return TooManyEntitiesFound error', (done) => {
      const cliManager = { sendRequest: (x, cb) => cb(null, entitiesList) };
      const baseService = new BaseService(cliManager);
      baseService.getEntityByName('test', 'test', (err) => {
        expect(err).to.exist;
        expect(err.name).to.equal('TooManyFound');
        done();
      });
    });

    it('when one entity have the specified name should return the entity', (done) => {
      const cliManager = { sendRequest: (x, cb) => cb(null, entitiesList) };
      const baseService = new BaseService(cliManager);
      baseService.getEntityByName('test', 'another', (err, data) => {
        expect(err).to.not.exist;
        expect(data).to.be.an('object');
        expect(data).to.have.property('name').that.equals('another');
        done();
      });
    });
  });
});
