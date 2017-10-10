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

const service = require('./../../../lib/service.js');
const deploy = require('../../../lib/commands/deploy.js').handler;
const pkg = require('./../../../package.json');
const project = require('./../../../lib/project.js');
const user = require('./../../../lib/user.js');
const logger = require('./../../../lib/logger');
const helper = require('../../tests-helper');

describe(`./${pkg.name} deploy`, () => {
  after('generalCleanup', (cb) => {
    helper.setup.performGeneralCleanup(cb);
  });

  describe('without error', () => {
    const sandbox = sinon.sandbox.create();

    before(() => {
      sandbox.stub(user, 'setup').callsArgWith(1);
      sandbox.stub(project, 'restore').callsArgWith(0);
      sandbox.stub(service, 'validate').callsArgWith(1);
      sandbox.stub(service, 'deploy').callsArgWith(1);
    });

    afterEach(() => {
      sandbox.reset();
    });

    after(() => {
      sandbox.restore();
    });

    it('should setup the user.', (cb) => {
      deploy({}, (err) => {
        expect(user.setup).to.be.calledOnce;
        cb(err);
      });
    });

    it('should restore the project.', (cb) => {
      deploy({}, (err) => {
        expect(project.restore).to.be.calledOnce;
        cb(err);
      });
    });

    it('should validate the service.', (cb) => {
      deploy({}, (err) => {
        expect(service.validate).to.be.calledOnce;
        cb(err);
      });
    });

    it('should deploy the service.', (cb) => {
      deploy({}, (err) => {
        expect(service.deploy).to.be.calledOnce;
        cb(err);
      });
    });
  });

  describe('with error', () => {
    const sandbox = sinon.sandbox.create();
    const testErr = new Error('Test err');

    before(() => {
      sandbox.stub(process, 'exit');
      sandbox.stub(logger, 'error');
      sandbox.stub(user, 'setup').callsArg(1);
      sandbox.stub(project, 'restore').callsArg(0);

      // let's produce error here
      sandbox.stub(service, 'validate').callsArgWith(1, testErr);
    });

    afterEach(() => {
      sandbox.reset();
    });

    after(() => {
      sandbox.restore();
    });

    it('should pass error to callback if both are present', (cb) => {
      deploy({}, (err) => {
        helper.assertions.assertCmdCommandWithCallbackForError(err, testErr);
        cb();
      });
    });

    it('should not pass error to callback if no callback', (cb) => {
      deploy({});

      // we don't provide a callback to the 'deploy' command, so we have no way of knowing when it is done
      setTimeout(() => {
        helper.assertions.assertCmdCommandWithoutCallbackForError(testErr);
        cb();
      }, 1000);
    });
  });
});
