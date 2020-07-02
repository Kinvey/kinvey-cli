/**
 * Copyright (c) 2020, Kinvey, Inc. All rights reserved.
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

const request = require('request');
const sinon = require('sinon');

const Authentication = require('../../../lib/Authentication');
const Utils = require('../../../lib/Utils');

describe('Authentication', () => {
  describe('login', () => {
    describe('with external identity provider', () => {
      const sandbox = sinon.sandbox.create();

      afterEach('resetStubs', () => {
        sandbox.reset();
      });

      after('cleanupStubs', () => {
        sandbox.restore();
      });

      it('when login to idp succeeds should return the token', (done) => {
        const cliManager = {
          log: () => {},
          config: {
            defaultSchemaVersion: '4',
            redirectServerPort: 5000
          }
        };

        const options = {
          identityProvider: {
            id: '1234567890',
            name: 'ExternalTest'
          },
          host: 'test.com/'
        };

        const sessionValue = 'testSession';

        const expectedUrl = 'test.com/v4/identity-providers/1234567890/authenticate?redirect=http://localhost:5000/';
        const openBrowserStub = sandbox.stub(Utils, 'openBrowser')
          .withArgs(expectedUrl)
          .callsFake(() => {
            request({ url: `http://localhost:5000/?session=${sessionValue}` }, () => {
              Promise.resolve();
            });
          });

        const auth = new Authentication(cliManager);

        auth.login(options, (err, result) => {
          expect(err).to.not.exist;

          expect(result).to.be.an('object').that.is.not.empty;
          expect(result.token).to.equal(sessionValue);
          expect(openBrowserStub).to.be.called.once;

          done();
        });
      });
    });
  });
});
