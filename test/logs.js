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
const logs = require('../cmd/logs.js');
const pkg = require('../package.json');
const project = require('../lib/project.js');
const user = require('../lib/user.js');

describe(`./${pkg.name} logs`, () => {
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

  before('logs', () => {
    return sinon.stub(service, 'logs').callsArg(2);
  });
  afterEach('logs', () => {
    return service.logs.reset();
  });
  after('logs', () => {
    return service.logs.restore();
  });

  it('should setup the user.', (cb) => {
    return logs(null, null, command, (err) => {
      expect(user.setup).to.be.calledOnce;
      return cb(err);
    });
  });
  it('should restore the project.', (cb) => {
    return logs(null, null, command, (err) => {
      expect(project.restore).to.be.calledOnce;
      return cb(err);
    });
  });
  it('should retrieve log entries based on query', (cb) => {
    return logs(null, null, command, (err) => {
      expect(service.logs).to.be.calledOnce;
      return cb(err);
    });
  });
  it('should fail with an invalid \'from\' timestamp', (done) => {
    return logs('abc', null, command, (err) => {
      expect(err).to.exist;
      expect(err.message).to.equal("Logs \'from\' timestamp invalid (ISO-8601 required)");
      return done();
    });
  });
  return it('should fail with an invalid \'to\' timestamp', (done) => {
    return logs(null, 'abc', command, (err) => {
      expect(err).to.exist;
      expect(err.message).to.equal("Logs \'to\' timestamp invalid (ISO-8601 required)");
      return done();
    });
  });
});
