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
const logout = require('../cmd/logout.js');
const pkg = require('../package.json');
const project = require('../lib/project.js');
const user = require('../lib/user.js');

describe(`./${pkg.name} logout`, () => {
  before('user', () => {
    return sinon.stub(user, 'logout').callsArg(0);
  });
  afterEach('user', () => {
    return user.logout.reset();
  });
  after('user', () => {
    return user.logout.restore();
  });

  before('project', () => {
    return sinon.stub(project, 'logout').callsArg(0);
  });
  afterEach('project', () => {
    return project.logout.reset();
  });
  after('project', () => {
    return project.logout.restore();
  });

  it('should logout the user.', (cb) => {
    return logout.call(command, command, (err) => {
      expect(user.logout).to.be.calledOnce;
      return cb(err);
    });
  });
  return it('should logout the project.', (cb) => {
    return logout.call(command, command, (err) => {
      expect(project.logout).to.be.calledOnce;
      return cb(err);
    });
  });
});
