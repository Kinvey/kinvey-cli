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

const config = require('config');

const sinon = require('sinon');
const updateNotifier = require('update-notifier').UpdateNotifier;
const cli = require('./../../bin/kinveyCli.js');
const init = require('./../../lib/init.js');
const logger = require('./../../lib/logger.js');
const pkg = require('./../../package.json');
const request = require('../../lib/Request.js');

// TODO: Ensure global options are tested before #BACK-2775 is merged into master
describe.skip(`./${pkg.name}`, () => {
  before('command', () => {
    program.command('test').action(init);
  });
  after('command', () => {
    logger.config({
      level: 3
    });
    request.Request = request.Request.defaults({
      baseUrl: config.host
    });
  });
  before('stub', () => {
    sinon.stub(logger, 'config');
  });
  afterEach('stub', () => {
    logger.config.reset();
  });
  after('stub', () => {
    logger.config.restore();
  });
  describe('-s, --silent', () => {
    it('should not output anything.', () => {
      cli(['node', pkg.name, 'test', '--silent']);
      expect(logger.config).to.be.calledWith({
        level: 3
      });
    });
  });
  describe('-c, --suppress-version-check', () => {
    before('stub', () => {
      sinon.stub(updateNotifier.prototype, 'notify');
    });
    afterEach('stub', () => {
      updateNotifier.prototype.notify.reset();
    });
    after('stub', () => {
      updateNotifier.prototype.notify.restore();
    });
    it('should not check for package updates.', () => {
      cli(['node', pkg.name, 'test', '--suppress-version-check']);
      expect(updateNotifier.prototype.notify).not.to.be.called;
    });
  });
  describe('-v, --verbose', () => {
    it('should output debug messages.', () => {
      cli(['node', pkg.name, 'test', '--verbose']);
      expect(logger.config).to.be.calledWith({
        level: 0
      });
    });
  });
});
