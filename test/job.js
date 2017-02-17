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
const command = require('./fixtures/command.js');
const service = require('../lib/service.js');
const logger = require('../lib/logger.js');
const pkg = require('../package.json');
const project = require('../lib/project.js');
const job = require('../cmd/job.js');
const user = require('../lib/user.js');

describe(`./${pkg.name} job`, () => {
  before('configure', () => {
    project.app = project.service = '123';
    project.schemaVersion = 1;
    return project.lastJobId = 'abcdef';
  });
  after('configure', () => {
    project.app = project.service = project.schemaVersion = null;
  });

  before('user', () => {
    return sinon.stub(user, 'setup').callsArg(1);
  });
  afterEach('user', () => {
    return user.setup.reset();
  });
  after('user', () => {
    return user.setup.restore();
  });
  before('project', () => {
    return sinon.stub(project, 'restore').callsArg(0);
  });
  afterEach('project', () => {
    return project.restore.reset();
  });
  after('project', () => {
    return project.restore.restore();
  });
  before('service', () => {
    return sinon.stub(service, 'jobStatus').callsArg(1);
  });
  afterEach('service', () => {
    return service.jobStatus.reset();
  });
  after('service', () => {
    return service.jobStatus.restore();
  });
  it('should setup the user.', (cb) => {
    return job('123', command, (err) => {
      expect(user.setup).to.be.calledOnce;
      return cb(err);
    });
  });
  it('should restore the project.', (cb) => {
    return job('123', command, (err) => {
      expect(project.restore).to.be.calledOnce;
      return cb(err);
    });
  });
  it('should print the current job status.', (cb) => {
    const jobId = '123';
    return job(jobId, command, (err) => {
      expect(service.jobStatus).to.be.calledOnce;
      expect(service.jobStatus).to.be.calledWith(jobId);
      return cb(err);
    });
  });
  return it('should print the current job status when called without an id.', (cb) => {
    return job(null, command, (err) => {
      expect(service.jobStatus).to.be.calledOnce;
      expect(service.jobStatus).to.be.calledWith(null);
      return cb(err);
    });
  });
});
