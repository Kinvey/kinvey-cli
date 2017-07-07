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
const list = require('../cmd/list.js');
const logger = require('../lib/logger.js');
const pkg = require('../package.json');
const project = require('../lib/project.js');
const user = require('../lib/user.js');

describe(`./${pkg.name} list`, () => {
  before('user', () => {
    sinon.stub(user, 'setup').callsArg(1);
  });
  afterEach('user', () => {
    user.setup.reset();
  });
  after('user', () => {
    user.setup.restore();
  });

  before('restore', () => {
    sinon.stub(project, 'restore').callsArg(0);
  });
  afterEach('restore', () => {
    project.restore.reset();
  });
  after('restore', () => {
    project.restore.restore();
  });

  before('list', () => {
    sinon.stub(project, 'list').callsArg(0);
  });
  afterEach('list', () => {
    project.list.reset();
  });
  after('list', () => {
    project.list.restore();
  });

  it('should setup the user.', (cb) => {
    list.call(command, command, (err) => {
      expect(user.setup).to.be.calledOnce;
      cb(err);
    });
  });
  it('should restore the project.', (cb) => {
    list.call(command, command, (err) => {
      expect(project.restore).to.be.calledOnce;
      cb(err);
    });
  });
  it('should list the Kinvey datalinks.', (cb) => {
    list.call(command, command, (err) => {
      expect(project.list).to.be.calledOnce;
      cb(err);
    });
  });
});
