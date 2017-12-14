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

const { Errors, HTTPMethod } = require('../../../lib/Constants');
const Request = require('../../../lib/Request');
const Utils = require('../../../lib/Utils');
const { assertions } = require('../../TestsHelper');

const defaultHost = 'https://defaultHost.com/';
const cliVersion = '1.0.1';
const deviceInfoHeader = 'X-Kinvey-Device-Information';
const sandbox = sinon.createSandbox({});

describe('Request', () => {
  describe('create', () => {
    beforeEach(() => {
      sandbox.stub(Utils, 'getDeviceInformation').returns(cliVersion);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('with endpoint, host and timeout without user should build correct options', () => {
      const user = null;
      const host = defaultHost;
      const endpoint = Utils.Endpoints.session();
      const options = {
        host,
        endpoint,
        cliVersion
      };

      const expectedReqObj = {
        options: {
          headers: {
            [deviceInfoHeader]: cliVersion
          },
          json: true,
          method: HTTPMethod.GET,
          url: `${host}${endpoint}`
        }
      };
      const actualReqObj = new Request(user, options);
      expect(actualReqObj).to.deep.equal(expectedReqObj);
    });

    it('with endpoint, host and timeout with user should build correct options', () => {
      const user = {
        token: 'userToken',
        host: 'someOtherHost.manage.kinvey.com'
      };
      const host = defaultHost;
      const endpoint = Utils.Endpoints.session();
      const options = {
        host,
        endpoint
      };

      const expectedReqObj = {
        options: {
          headers: {
            Authorization: `Kinvey ${user.token}`,
            [deviceInfoHeader]: cliVersion
          },
          json: true,
          method: HTTPMethod.GET,
          url: `${user.host}${endpoint}`
        }
      };
      const actualReqObj = new Request(user, options);
      expect(actualReqObj).to.deep.equal(expectedReqObj);
    });

    it('with endpoint and skipAuth with user should build correct options', () => {
      const user = {
        token: 'userToken',
        host: 'someOtherHost.manage.kinvey.com'
      };

      const endpoint = Utils.Endpoints.apps();
      const options = { endpoint, skipAuth: true };

      const expectedReqObj = {
        options: {
          headers: { [deviceInfoHeader]: cliVersion },
          json: true,
          method: HTTPMethod.GET,
          url: `${user.host}${endpoint}`
        }
      };
      const actualReqObj = new Request(user, options);
      expect(actualReqObj).to.deep.equal(expectedReqObj);
    });

    it('with endpoint, method, timeout, data with user should build correct options', () => {
      const user = {
        token: 'userToken',
        host: 'someOtherHost.manage.kinvey.com'
      };

      const endpoint = Utils.Endpoints.apps();
      const data = {
        firstName: 'Anakin',
        lastName: 'Skywalker'
      };
      const options = {
        endpoint,
        data,
        method: HTTPMethod.POST,
        timeout: 15000
      };

      const expectedReqObj = {
        options: {
          headers: {
            Authorization: `Kinvey ${user.token}`,
            [deviceInfoHeader]: cliVersion
          },
          json: true,
          method: HTTPMethod.POST,
          body: data,
          url: `${user.host}${endpoint}`,
          timeout: 15000
        }
      };
      const actualReqObj = new Request(user, options);
      expect(actualReqObj).to.deep.equal(expectedReqObj);
    });
  });

  describe('send', () => {
    const reqObj = new Request(null, {
      host: defaultHost,
      endpoint: Utils.Endpoints.apps(2)
    });
    const sandbox = sinon.sandbox.create();
    const reqStub = sandbox.stub(reqObj, '_send');
    const successResWithBody = {
      statusCode: 200,
      body: {
        id: '1234560'
      }
    };

    after(() => {
      sandbox.restore();
    });

    afterEach('resetStubs', () => {
      sandbox.reset();
    });

    it('when response is 200 should return response and no error', (done) => {
      reqStub.yields(null, successResWithBody);
      reqObj.send((err, res) => {
        expect(err).to.not.exist;
        expect(res).to.deep.equal(successResWithBody);
        done();
      });
    });

    it('when response is 400 should return response and error', (done) => {
      const noSuccessRes = {
        statusCode: 401,
        statusMessage: 'Unauthorized',
        rawTrailers: [],
        upgrade: false
      };
      reqStub.yields(null, noSuccessRes);
      reqObj.send((err, res) => {
        assertions.assertError(err, Errors.InvalidCredentials);
        expect(res).to.deep.equal(noSuccessRes);
        done();
      });
    });

    it('when a connection error occurs should return empty response and error', (done) => {
      const connErr = new Error('ETIMEDOUT');
      reqStub.yields(connErr);
      reqObj.send((err, res) => {
        assertions.assertError(err, Errors.ConnectionError);
        expect(res).to.be.an.empty.object;
        done();
      });
    });

    it('when a NotFound error occurs should return empty response and error', (done) => {
      const err = new Error('ENOTFOUND');
      reqStub.yields(err);
      reqObj.send((err, res) => {
        assertions.assertError(err, Errors.InvalidConfigUrl);
        expect(res).to.be.an.empty.object;
        done();
      });
    });
  });
});
