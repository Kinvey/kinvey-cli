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
const pkg = require('../../package.json');
const project = require('../../lib/project.js');
const user = require('../../lib/user.js');
const config = require('../../cmd/config.js');

describe(`./${pkg.name} config`, () => {
  const sandbox = sinon.sandbox.create();

  before('setupStubs', () => {
    sandbox.stub(user, 'setup').callsArg(1);
    sandbox.stub(project, 'config').callsArg(1);
  });

  afterEach('resetStubs', () => {
    sandbox.reset();
  });

  after('cleanupStubs', () => {
    sandbox.restore();
  });

  it('should setup the user.', (cb) => {
    config(null, command, (err) => {
      expect(user.setup).to.be.calledOnce;
      cb(err);
    });
  });

  it('configure the project with the default host.', (cb) => {
    config(null, command, (err) => {
      expect(project.config).to.be.calledOnce;
      expect(user.host).to.equal(null);
      cb(err);
    });
  });

  describe('with a custom HTTP host', () => {
    it('should configure the project.', (cb) => {
      const host = 'http://host:123/';
      config(host, command, (err) => {
        expect(project.config).to.be.calledOnce;
        expect(user.host).to.equal(host);
        cb(err);
      });
    });

    it('should add a trailing backslash if one is not supplied.', (cb) => {
      const host = 'http://host:123';
      config(host, command, (err) => {
        expect(project.config).to.be.calledOnce;
        expect(user.host).to.equal(`${host}/`);
        cb(err);
      });
    });
  });

  describe('with a custom HTTPS host', () => {
    it('should configure the project with a custom HTTPS host.', (cb) => {
      const host = 'https://host:123/';
      config(host, command, (err) => {
        expect(project.config).to.be.calledOnce;
        expect(user.host).to.equal(host);
        cb(err);
      });
    });

    it('should add a trailing backslash if one is not supplied.', (cb) => {
      const host = 'https://host:123';
      config(host, command, (err) => {
        expect(project.config).to.be.calledOnce;
        expect(user.host).to.equal(`${host}/`);
        cb(err);
      });
    });
  });

  it('configure the project with a custom host.', (cb) => {
    const host = '123';
    config(host, command, (err) => {
      expect(project.config).to.be.calledOnce;
      expect(user.host).to.equal(`https://${host}-manage.kinvey.com/`);
      cb(err);
    });
  });
});
