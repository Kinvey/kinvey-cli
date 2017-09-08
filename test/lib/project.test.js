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

const chalk = require('chalk');
const config = require('config');
const api = require('../api.js');
const logger = require('../../lib/logger.js');
const project = require('../../lib/project.js');
const prompt = require('../../lib/prompt.js');
const user = require('../../lib/user.js');
const util = require('../../lib/util.js');
const uuid = require('uuid');
const Errors = require('./../../lib/constants').Errors;
const helper = require('./../helper');

const fixtures = {
  app: require('../fixtures/app.json'),
  datalink: require('../fixtures/datalink.json'),
  kinveyDlc: require('../fixtures/kinvey-dlc.json'),
  org: require('../fixtures/org.json')
};

const getStubCallArg = require('./../helper').mocks.getStubCallArg;

describe('project', () => {
  after('generalCleanup', (cb) => {
    helper.setup.performGeneralCleanup(cb);
  });

  describe('isConfigured', () => {
    beforeEach('configure', () => {
      project.service = '123';
      project.schemaVersion = 2;
    });

    afterEach('configure', () => {
      project.app = project.service = project.schemaVersion = null;
    });

    it('should true if the app and service were configured.', () => {
      expect(project.isConfigured()).to.be.true;
    });

    it('should false if the service was not configured.', () => {
      project.service = null;
      expect(project.isConfigured()).to.be.false;
    });

    it('should false if the schema was not configured.', () => {
      project.schemaVersion = null;
      expect(project.isConfigured()).to.be.false;
    });
  });

  // list for v2 apps
  describe('list', () => {
    const sandbox = sinon.sandbox.create();
    const testAppId = '123';
    let loggerInfoStub;

    beforeEach('configure', () => {
      project.app = project.service = testAppId;
      project.schemaVersion = 2;
    });

    after('configure', () => {
      project.app = project.service = null;
      project.schemaVersion = null;
    });

    beforeEach('setupStubs', () => {
      loggerInfoStub = sandbox.stub(logger, 'info');
    });

    afterEach('cleanupStubs', () => {
      sandbox.restore();
    });

    it('should list all Kinvey (internal) datalinks sorted when no error', (cb) => {
      const fakeDbDataLinks = [
        { type: 'internal', name: 'someName' },
        { type: 'internal', name: 'zero' },
        { type: 'shouldNotShow', name: 'y' },
        { type: 'internal', name: '2d2r' },
      ];

      sandbox.stub(util, 'makeRequest').callsArgWith(1, null, { body: fakeDbDataLinks });

      project.list((err) => {
        expect(err).to.not.exist;
        expect(loggerInfoStub).to.be.called;

        const loggerCalls = loggerInfoStub.getCalls();
        const expectedLoggerCallsCount = 5;
        expect(loggerCalls.length).to.be.at.least(expectedLoggerCallsCount);

        const actualDataLinksCount = getStubCallArg(loggerCalls, 0, 1);
        expect(actualDataLinksCount).to.equal(chalk.cyan(3));

        expect(getStubCallArg(loggerCalls, 1, 2)).to.equal(chalk.cyan('2d2r'));
        expect(getStubCallArg(loggerCalls, 2, 2)).to.equal(chalk.cyan('someName'));
        expect(getStubCallArg(loggerCalls, 3, 2)).to.equal(chalk.cyan('zero'));

        expect(loggerInfoStub).to.be.calledWith('The service used in this project is marked with *');
        cb();
      });
    });

    it('should pass error when one occurs', (cb) => {
      const fakeErr = new Error('Some err');
      sandbox.stub(util, 'makeRequest').callsArgWith(1, fakeErr);

      project.list((err) => {
        expect(err).to.exist.and.to.equal(fakeErr);
        expect(loggerInfoStub).to.not.be.called;
        cb();
      });
    });
  });

  describe('logout', () => {
    beforeEach('configure', () => {
      project.app = project.service = '123';
    });
    afterEach('configure', () => {
      project.app = project.service = null;
    });

    before('stub', () => {
      sinon.stub(logger, 'info');
    });
    afterEach('stub', () => {
      logger.info.reset();
    });
    after('stub', () => {
      logger.info.restore();
    });

    describe('for v2 apps', () => {
      beforeEach('configure', () => {
        project.schemaVersion = 2;
      });
      afterEach('configure', () => {
        project.schemaVersion = null;
      });

      it('should log out the user', (cb) => {
        project.logout((err) => {
          expect(logger.info).to.be.calledOnce;
          cb(err);
        });
      });
    });
  });

  describe('restore', () => {
    describe('when the project file exists', () => {
      before('configure', () => {
        this.app = this.service = 123;
        this.schemaVersion = 2;
      });
      after('configure', () => {
        delete this.app;
        delete this.service;
        delete this.schemaVersion;
      });

      before('stub', () => {
        sinon.stub(util, 'readJSON').callsArgWith(1, null, {
          service: this.service,
          schemaVersion: this.schemaVersion
        });
      });
      afterEach('stub', () => {
        util.readJSON.reset();
      });
      after('stub', () => {
        util.readJSON.restore();
      });

      it('should set the project app, service, and schema.', (cb) => {
        project.restore((err) => {
          expect(util.readJSON).to.be.calledOnce;
          expect(util.readJSON).to.be.calledWith(config.paths.project);
          expect(project.service).to.equal(this.service);
          expect(project.schemaVersion).to.equal(this.schemaVersion);
          cb(err);
        });
      });
    });

    describe('when the project file does not exists', () => {
      before('stub', () => {
        sinon.stub(util, 'readJSON').callsArgWith(1, null, {});
      });
      afterEach('stub', () => {
        util.readJSON.reset();
      });
      after('stub', () => {
        util.readJSON.restore();
      });

      it('should fail.', (cb) => {
        project.restore((err) => {
          expect(err).to.exist;
          expect(err.name).to.equal(Errors.ProjectNotConfigured.name);
          cb();
        });
      });
    });
  });

  describe('save', () => {
    describe('with an app', () => {
      before('configure', () => {
        project.app = project.service = project.serviceName = uuid.v4();
        project.schemaVersion = 1;
      });
      after('configure', () => {
        project.app = project.service = project.schemaVersion = null;
      });

      before('stub', () => {
        sinon.stub(util, 'writeJSON').callsArg(2);
      });
      afterEach('stub', () => {
        util.writeJSON.reset();
      });
      after('stub', () => {
        util.writeJSON.restore();
      });

      it('should write the project to file.', (cb) => {
        project.save((err) => {
          expect(util.writeJSON).to.be.calledOnce;
          expect(util.writeJSON).to.be.calledWith(config.paths.project, {
            app: project.app,
            lastJobId: undefined,
            org: undefined,
            schemaVersion: project.schemaVersion,
            service: project.service,
            serviceName: project.serviceName
          });
          expect(project.org).to.be.undefined;
          cb(err);
        });
      });
    });

    describe('with an org', () => {
      before('configure', () => {
        project.org = project.service = project.serviceName = uuid.v4();
        project.schemaVersion = 1;
      });
      after('configure', () => {
        project.org = project.service = project.schemaVersion = null;
      });

      before('stub', () => {
        sinon.stub(util, 'writeJSON').callsArg(2);
      });
      afterEach('stub', () => {
        util.writeJSON.reset();
      });
      after('stub', () => {
        util.writeJSON.restore();
      });

      it('should write the project to file.', (cb) => {
        project.save((err) => {
          expect(util.writeJSON).to.be.calledOnce;
          expect(util.writeJSON).to.be.calledWith(config.paths.project, {
            app: null,
            lastJobId: undefined,
            org: project.org,
            schemaVersion: project.schemaVersion,
            service: project.service,
            serviceName: project.serviceName
          });
          expect(project.app).to.be.null;
          cb(err);
        });
      });
    });
  });
  describe('select', () => {
    afterEach('configure', () => {
      project.app = project.service = project.schemaVersion = null;
    });
    describe('given invalid credentials', () => {
      before('refresh', () => {
        sinon.stub(user, 'refresh').callsArg(0);
      });
      afterEach('refresh', () => {
        user.refresh.reset();
      });
      after('refresh', () => {
        user.refresh.restore();
      });

      before('getApp', () => {
        const stub = sinon.stub(prompt, 'getAppOrOrg');
        stub.callsArgWith(1, null, {
          name: 'App'
        });
      });
      afterEach('getApp', () => {
        prompt.getAppOrOrg.reset();
      });
      after('getApp', () => {
        prompt.getAppOrOrg.restore();
      });

      beforeEach('api', () => {
        this.mocks = [
          api.get('/apps').reply(401, {
            code: 'InvalidCredentials'
          }), api.get('/apps').reply(200, [])
        ];
      });
      afterEach('api', () => {
        for (let i = 0; i < this.mocks; i++) {
          const mock = this.mocks[i];
          mock.done();
        }
        delete this.mocks;
      });

      it('should retry.', (cb) => {
        project.select((err) => {
          expect(user.refresh).to.be.calledOnce;
          expect(err).to.have.property('name', Errors.NoAppsFound.name);
          cb();
        });
      });
    });
    describe('given the user has an app or org and eligible service', () => {
      before('save', () => {
        sinon.stub(project, 'save').callsArg(0);
      });
      afterEach('save', () => {
        project.save.reset();
      });
      after('save', () => {
        project.save.restore();
      });

      before('getService', () => {
        const stub = sinon.stub(prompt, 'getService');
        stub.callsArgWith(1, null, fixtures.kinveyDlc);
      });
      afterEach('getService', () => {
        prompt.getService.reset();
      });
      after('getService', () => {
        prompt.getService.restore();
      });

      describe('for apps', () => {
        before('getAppOrOrg', () => {
          const stub = sinon.stub(prompt, 'getAppOrOrg');
          stub.callsArgWith(1, null, {
            name: 'App'
          });
        });
        afterEach('getAppOrOrg', () => {
          prompt.getAppOrOrg.reset();
        });
        after('getAppOrOrg', () => {
          prompt.getAppOrOrg.restore();
        });

        before('getApp', () => {
          const stub = sinon.stub(prompt, 'getApp');
          stub.callsArgWith(1, null, fixtures.app);
        });
        afterEach('getApp', () => {
          prompt.getApp.reset();
        });
        after('getApp', () => {
          prompt.getApp.restore();
        });

        beforeEach('api', () => {
          this.mocks = [api.get('/apps').reply(200, [fixtures.app]), api.get('/v2/apps/123/data-links').reply(200, [fixtures.kinveyDlc])];
        });
        afterEach('api', () => {
          for (let i = 0; i < this.mocks; i++) {
            const mock = this.mocks[i];
            mock.done();
          }
          delete this.mocks;
        });

        it('should select the app and service to use.', (cb) => {
          project.select((err) => {
            expect(prompt.getApp).to.be.calledOnce;
            expect(prompt.getApp).to.be.calledWith([fixtures.app]);
            expect(prompt.getService).to.be.calledOnce;
            expect(prompt.getService).to.be.calledWith([fixtures.kinveyDlc]);
            cb(err);
          });
        });
        it('should save the project.', (cb) => {
          project.select((err) => {
            expect(project.save).to.be.calledOnce;
            cb(err);
          });
        });
      });

      describe('for orgs', () => {
        before('config', () => {
          project.org = fixtures.org.name;
        });
        after('config', () => {
          delete project.org;
        });

        before('getAppOrOrg', () => {
          const stub = sinon.stub(prompt, 'getAppOrOrg');
          stub.callsArgWith(1, null, {
            name: 'Organization'
          });
        });
        afterEach('getAppOrOrg', () => {
          prompt.getAppOrOrg.reset();
        });
        after('getAppOrOrg', () => {
          prompt.getAppOrOrg.restore();
        });

        before('getOrg', () => {
          const stub = sinon.stub(prompt, 'getOrg');
          stub.callsArgWith(1, null, fixtures.org);
        });
        afterEach('getOrg', () => {
          prompt.getOrg.reset();
        });
        after('getOrg', () => {
          prompt.getOrg.restore();
        });

        beforeEach('api', () => {
          this.mocks = [api.get('/organizations').reply(200, [fixtures.org]), api.get('/v2/organizations/123/data-links').reply(200, [fixtures.kinveyDlc])];
        });
        afterEach('api', () => {
          for (let i = 0; i < this.mocks; i++) {
            const mock = this.mocks[i];
            mock.done();
          }
          delete this.mocks;
        });

        it('should select the org and service to use.', (cb) => {
          project.select((err) => {
            expect(prompt.getOrg).to.be.calledOnce;
            expect(prompt.getOrg).to.be.calledWith([fixtures.org]);
            expect(prompt.getService).to.be.calledOnce;
            expect(prompt.getService).to.be.calledWith([fixtures.kinveyDlc]);
            cb(err);
          });
        });
        it('should save the project.', (cb) => {
          project.select((err) => {
            expect(project.save).to.be.calledOnce;
            cb(err);
          });
        });
      });
    });
    describe('given the user has no apps or eligible datalinks', () => {
      before('getAppOrOrg', () => {
        const stub = sinon.stub(prompt, 'getAppOrOrg');
        stub.callsArgWith(1, null, {
          name: 'App'
        });
      });
      afterEach('getAppOrOrg', () => {
        prompt.getAppOrOrg.reset();
      });
      after('getAppOrOrg', () => {
        prompt.getAppOrOrg.restore();
      });

      beforeEach('api', () => {
        this.mock = api.get('/apps').reply(200, []);
      });
      afterEach('api', () => {
        this.mock.done();
        delete this.mock;
      });

      it('should fail.', (cb) => {
        project.select((err) => {
          expect(err).to.exist;
          expect(err.name).to.equal(Errors.NoAppsFound.name);
          cb();
        });
      });
    });
    describe('given no eligible datalinks', () => {
      before('getAppOrOrg', () => {
        const stub = sinon.stub(prompt, 'getAppOrOrg');
        stub.callsArgWith(1, null, {
          name: 'App'
        });
      });
      afterEach('getAppOrOrg', () => {
        prompt.getAppOrOrg.reset();
      });
      after('getAppOrOrg', () => {
        prompt.getAppOrOrg.restore();
      });

      before('stub', () => {
        const stub = sinon.stub(prompt, 'getApp');
        stub.callsArgWith(1, null, {
          id: '123'
        }, {
          id: '456'
        });
      });
      afterEach('stub', () => {
        prompt.getApp.reset();
      });
      after('stub', () => {
        prompt.getApp.restore();
      });

      beforeEach('api', () => {
        this.mocks = [api.get('/apps').reply(200, [fixtures.app]), api.get('/v2/apps/123/data-links').reply(200, [fixtures.datalink])];
      });
      afterEach('api', () => {
        for (let i = 0; i < this.mocks; i++) {
          const mock = this.mocks[i];
          mock.done();
        }
        delete this.mocks;
      });

      it('should fail.', (cb) => {
        project.select((err) => {
          expect(err).to.exist;
          expect(err.name).to.equal(Errors.NoFlexServicesFound.name);
          cb();
        });
      });
    });
  });
  describe('setup', () => {
    describe('when the project is not configured', () => {
      before('restore', () => {
        sinon.stub(project, 'restore').callsArgWith(0, new Error(Errors.ProjectNotConfigured.name));
      });
      afterEach('restore', () => {
        project.restore.reset();
      });
      after('restore', () => {
        project.restore.restore();
      });

      before('select', () => {
        sinon.stub(project, 'select').callsArg(0);
      });
      afterEach('select', () => {
        project.select.reset();
      });
      after('select', () => {
        project.select.restore();
      });

      it('should restore the project.', (cb) => {
        project.setup({}, (err) => {
          expect(project.restore).to.be.calledOnce;
          cb(err);
        });
      });
      it('should select the project if not configured.', (cb) => {
        project.setup({}, (err) => {
          expect(project.select).to.be.calledOnce;
          cb(err);
        });
      });
    });
    describe('when the project can not be properly restored', () => {
      before('restore', () => {
        sinon.stub(project, 'restore').callsArgWith(0, new Error(Errors.ProjectRestoreError.name));
      });
      afterEach('restore', () => {
        project.restore.reset();
      });
      after('restore', () => {
        project.restore.restore();
      });

      before('select', () => {
        sinon.stub(project, 'select').callsArg(0);
      });
      afterEach('select', () => {
        project.select.reset();
      });
      after('select', () => {
        project.select.restore();
      });

      it('should restore the project.', (cb) => {
        project.setup({}, (err) => {
          expect(project.restore).to.be.calledOnce;
          cb(err);
        });
      });
      it('should select the project if not configured.', (cb) => {
        project.setup({}, (err) => {
          expect(project.select).to.be.calledOnce;
          cb(err);
        });
      });
    });
  });
});
