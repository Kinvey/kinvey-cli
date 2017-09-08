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
const command = require('../fixtures/command.js');
const service = require('../../lib/service.js');
const logger = require('../../lib/logger.js');
const pkg = require('../../package.json');
const project = require('../../lib/project.js');
const job = require('../../cmd/job.js');
const user = require('../../lib/user.js');
const helper = require('../helper');

describe(`./${pkg.name} job`, () => {
  const sandbox = sinon.sandbox.create();

  after('generalCleanup', (cb) => {
    helper.setup.performGeneralCleanup(cb);
  });

  afterEach('resetStubs', () => {
    sandbox.reset();
  });

  describe('without error', () => {
    const testJobId = '123';

    before('configure', () => {
      project.app = project.service = testJobId;
      project.schemaVersion = 1;
      project.lastJobId = 'abcdef';
    });

    before('setupStubs', () => {
      sandbox.stub(user, 'setup').callsArg(1);
      sandbox.stub(project, 'restore').callsArg(0);
      sandbox.stub(service, 'jobStatus').callsArg(1);
    });

    after('cleanupConfiguration', () => {
      project.app = project.service = project.schemaVersion = null;
    });

    after('cleanupStubs', () => {
      sandbox.restore();
    });

    it('should setup the user.', (cb) => {
      job(testJobId, command, (err) => {
        expect(user.setup).to.be.calledOnce;
        cb(err);
      });
    });

    it('should restore the project.', (cb) => {
      job(testJobId, command, (err) => {
        expect(project.restore).to.be.calledOnce;
        cb(err);
      });
    });

    it('should print the current job status.', (cb) => {
      job(testJobId, command, (err) => {
        expect(service.jobStatus).to.be.calledOnce;
        expect(service.jobStatus).to.be.calledWith(testJobId);
        cb(err);
      });
    });

    it('should print the current job status when called without an id.', (cb) => {
      job(null, command, (err) => {
        expect(service.jobStatus).to.be.calledOnce;
        expect(service.jobStatus).to.be.calledWith(null);
        cb(err);
      });
    });
  });

  describe('with error', () => {
    const testErr = new Error('Test err');

    before('setupStubs', () => {
      sandbox.stub(user, 'setup').callsArg(1);
      sandbox.stub(project, 'restore').callsArgWith(0, testErr);
      sandbox.stub(process, 'exit');
      sandbox.stub(logger, 'error');
    });

    after('cleanupStubs', () => {
      sandbox.restore();
    });

    it('should pass error to callback if both are present', (cb) => {
      job(null, command, (err) => {
        helper.assertions.assertCmdCommandWithCallbackForError(err, testErr);
        cb();
      });
    });

    it('should not pass error to callback if no callback', (cb) => {
      job(null, command);

      // we don't provide a callback to the 'job' command, so we have no way of knowing when it is done
      setTimeout(() => {
        helper.assertions.assertCmdCommandWithoutCallbackForError(testErr);
        cb();
      }, 1000);
    });
  });
});
