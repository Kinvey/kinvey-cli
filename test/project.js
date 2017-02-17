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
const api = require('./lib/api.js');
const logger = require('../lib/logger.js');
const project = require('../lib/project.js');
const prompt = require('../lib/prompt.js');
const user = require('../lib/user.js');
const util = require('../lib/util.js');
const uuid = require('uuid');

const fixtures = {
  app: require('./fixtures/app.json'),
  datalink: require('./fixtures/datalink.json'),
  kinveyDlc: require('./fixtures/kinvey-dlc.json'),
  org: require('./fixtures/org.json')
};

describe('project', () => {
  describe('isConfigured', () => {
    beforeEach('configure', () => {
      project.service = '123';
      return project.schemaVersion = 2;
    });
    afterEach('configure', () => {
      return project.app = project.service = project.schemaVersion = null;
    });
    it('should return true if the app and service were configured.', () => {
      return expect(project.isConfigured()).to.be.true;
    });
    it('should return false if the service was not configured.', () => {
      project.service = null;
      return expect(project.isConfigured()).to.be.false;
    });
    return it('should return false if the schema was not configured.', () => {
      project.schemaVersion = null;
      return expect(project.isConfigured()).to.be.false;
    });
  });
  describe('list', () => {
    beforeEach('configure', () => {
      return project.app = project.service = '123';
    });
    afterEach('configure', () => {
      return project.app = project.service = null;
    });

    before('stub', () => {
      return sinon.stub(logger, 'info');
    });
    afterEach('stub', () => {
      return logger.info.reset();
    });
    after('stub', () => {
      return logger.info.restore();
    });

    return describe('for v2 apps', () => {
      beforeEach('configure', () => {
        return project.schemaVersion = 2;
      });
      afterEach('configure', () => {
        return project.schemaVersion = null;
      });

      beforeEach('api', () => {
        return this.mock = api.get('/v2/apps/123/data-links').reply(200, []);
      });
      afterEach('api', () => {
        this.mock.done();
        return delete this.mock;
      });

      return it('should list all Kinvey datalinks.', (cb) => {
        return project.list((err) => {
          expect(logger.info).to.be.called;
          expect(logger.info).to.be.calledWith('The service used in this project is marked with *');
          return cb(err);
        });
      });
    });
  });
  describe('logout', () => {
    beforeEach('configure', () => {
      return project.app = project.service = '123';
    });
    afterEach('configure', () => {
      return project.app = project.service = null;
    });

    before('stub', () => {
      return sinon.stub(logger, 'info');
    });
    afterEach('stub', () => {
      return logger.info.reset();
    });
    after('stub', () => {
      return logger.info.restore();
    });

    return describe('for v2 apps', () => {
      beforeEach('configure', () => {
        return project.schemaVersion = 2;
      });
      afterEach('configure', () => {
        return project.schemaVersion = null;
      });

      return it('should log out the user', (cb) => {
        return project.logout((err) => {
          expect(logger.info).to.be.calledOnce;
          return cb(err);
        });
      });
    });
  });
  describe('restore', () => {
    describe('when the project file exists', () => {
      before('configure', () => {
        this.app = this.service = 123;
        return this.schemaVersion = 2;
      });
      after('configure', () => {
        delete this.app;
        delete this.service;
        return delete this.schemaVersion;
      });

      before('stub', () => {
        return sinon.stub(util, 'readJSON').callsArgWith(1, null, {
          service: this.service,
          schemaVersion: this.schemaVersion
        });
      });
      afterEach('stub', () => {
        return util.readJSON.reset();
      });
      after('stub', () => {
        return util.readJSON.restore();
      });

      return it('should set the project app, service, and schema.', (cb) => {
        return project.restore((err) => {
          expect(util.readJSON).to.be.calledOnce;
          expect(util.readJSON).to.be.calledWith(config.paths.project);
          expect(project.service).to.equal(this.service);
          expect(project.schemaVersion).to.equal(this.schemaVersion);
          return cb(err);
        });
      });
    });
    return describe('when the project file does not exists', () => {
      before('stub', () => {
        return sinon.stub(util, 'readJSON').callsArgWith(1, null, {});
      });
      afterEach('stub', () => {
        return util.readJSON.reset();
      });
      after('stub', () => {
        return util.readJSON.restore();
      });

      return it('should fail.', (cb) => {
        return project.restore((err) => {
          expect(err).to.exist;
          expect(err.name).to.equal('ProjectNotConfigured');
          return cb();
        });
      });
    });
  });
  describe('save', () => {
    describe('with an app', () => {
      before('configure', () => {
        project.app = project.service = project.serviceName = uuid.v4();
        return project.schemaVersion = 1;
      });
      after('configure', () => {
        return project.app = project.service = project.schemaVersion = null;
      });

      before('stub', () => {
        return sinon.stub(util, 'writeJSON').callsArg(2);
      });
      afterEach('stub', () => {
        return util.writeJSON.reset();
      });
      after('stub', () => {
        return util.writeJSON.restore();
      });

      return it('should write the project to file.', (cb) => {
        return project.save((err) => {
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
          return cb(err);
        });
      });
    });
    return describe('with an org', () => {
      before('configure', () => {
        project.org = project.service = project.serviceName = uuid.v4();
        return project.schemaVersion = 1;
      });
      after('configure', () => {
        return project.org = project.service = project.schemaVersion = null;
      });

      before('stub', () => {
        return sinon.stub(util, 'writeJSON').callsArg(2);
      });
      afterEach('stub', () => {
        return util.writeJSON.reset();
      });
      after('stub', () => {
        return util.writeJSON.restore();
      });

      return it('should write the project to file.', (cb) => {
        return project.save((err) => {
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
          return cb(err);
        });
      });
    });
  });
  describe('select', () => {
    afterEach('configure', () => {
      return project.app = project.service = project.schemaVersion = null;
    });
    describe('given invalid credentials', () => {
      before('refresh', () => {
        return sinon.stub(user, 'refresh').callsArg(0);
      });
      afterEach('refresh', () => {
        return user.refresh.reset();
      });
      after('refresh', () => {
        return user.refresh.restore();
      });

      before('getApp', () => {
        const stub = sinon.stub(prompt, 'getAppOrOrg');
        return stub.callsArgWith(1, null, {
          name: 'App'
        });
      });
      afterEach('getApp', () => {
        return prompt.getAppOrOrg.reset();
      });
      after('getApp', () => {
        return prompt.getAppOrOrg.restore();
      });

      beforeEach('api', () => {
        return this.mocks = [
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
        return delete this.mocks;
      });

      return it('should retry.', (cb) => {
        return project.select((err) => {
          expect(user.refresh).to.be.calledOnce;
          expect(err).to.have.property('name', 'NoAppsFound');
          return cb();
        });
      });
    });
    describe('given the user has an app or org and eligible service', () => {
      before('save', () => {
        return sinon.stub(project, 'save').callsArg(0);
      });
      afterEach('save', () => {
        return project.save.reset();
      });
      after('save', () => {
        return project.save.restore();
      });

      before('getService', () => {
        const stub = sinon.stub(prompt, 'getService');
        return stub.callsArgWith(1, null, fixtures.kinveyDlc);
      });
      afterEach('getService', () => {
        return prompt.getService.reset();
      });
      after('getService', () => {
        return prompt.getService.restore();
      });

      describe('for apps', () => {
        before('getAppOrOrg', () => {
          const stub = sinon.stub(prompt, 'getAppOrOrg');
          return stub.callsArgWith(1, null, {
            name: 'App'
          });
        });
        afterEach('getAppOrOrg', () => {
          return prompt.getAppOrOrg.reset();
        });
        after('getAppOrOrg', () => {
          return prompt.getAppOrOrg.restore();
        });

        before('getApp', () => {
          const stub = sinon.stub(prompt, 'getApp');
          return stub.callsArgWith(1, null, fixtures.app);
        });
        afterEach('getApp', () => {
          return prompt.getApp.reset();
        });
        after('getApp', () => {
          return prompt.getApp.restore();
        });

        beforeEach('api', () => {
          return this.mocks = [api.get('/apps').reply(200, [fixtures.app]), api.get('/v2/apps/123/data-links').reply(200, [fixtures.kinveyDlc])];
        });
        afterEach('api', () => {
          for (let i = 0; i < this.mocks; i++) {
            const mock = this.mocks[i];
            mock.done();
          }
          return delete this.mocks;
        });

        it('should select the app and service to use.', (cb) => {
          return project.select((err) => {
            expect(prompt.getApp).to.be.calledOnce;
            expect(prompt.getApp).to.be.calledWith([fixtures.app]);
            expect(prompt.getService).to.be.calledOnce;
            expect(prompt.getService).to.be.calledWith([fixtures.kinveyDlc]);
            return cb(err);
          });
        });
        return it('should save the project.', (cb) => {
          return project.select((err) => {
            expect(project.save).to.be.calledOnce;
            return cb(err);
          });
        });
      });
      return describe('for orgs', () => {
        before('config', () => {
          return project.org = fixtures.org.name;
        });
        after('config', () => {
          return delete project.org;
        });

        before('getAppOrOrg', () => {
          const stub = sinon.stub(prompt, 'getAppOrOrg');
          return stub.callsArgWith(1, null, {
            name: 'Organization'
          });
        });
        afterEach('getAppOrOrg', () => {
          return prompt.getAppOrOrg.reset();
        });
        after('getAppOrOrg', () => {
          return prompt.getAppOrOrg.restore();
        });

        before('getOrg', () => {
          const stub = sinon.stub(prompt, 'getOrg');
          return stub.callsArgWith(1, null, fixtures.org);
        });
        afterEach('getOrg', () => {
          return prompt.getOrg.reset();
        });
        after('getOrg', () => {
          return prompt.getOrg.restore();
        });

        beforeEach('api', () => {
          return this.mocks = [api.get('/organizations').reply(200, [fixtures.org]), api.get('/v2/organizations/123/data-links').reply(200, [fixtures.kinveyDlc])];
        });
        afterEach('api', () => {
          for (let i = 0; i < this.mocks; i++) {
            const mock = this.mocks[i];
            mock.done();
          }
          return delete this.mocks;
        });

        it('should select the org and service to use.', (cb) => {
          return project.select((err) => {
            expect(prompt.getOrg).to.be.calledOnce;
            expect(prompt.getOrg).to.be.calledWith([fixtures.org]);
            expect(prompt.getService).to.be.calledOnce;
            expect(prompt.getService).to.be.calledWith([fixtures.kinveyDlc]);
            return cb(err);
          });
        });
        return it('should save the project.', (cb) => {
          return project.select((err) => {
            expect(project.save).to.be.calledOnce;
            return cb(err);
          });
        });
      });
    });
    describe('given the user has no apps or eligible datalinks', () => {
      before('getAppOrOrg', () => {
        const stub = sinon.stub(prompt, 'getAppOrOrg');
        return stub.callsArgWith(1, null, {
          name: 'App'
        });
      });
      afterEach('getAppOrOrg', () => {
        return prompt.getAppOrOrg.reset();
      });
      after('getAppOrOrg', () => {
        return prompt.getAppOrOrg.restore();
      });

      beforeEach('api', () => {
        return this.mock = api.get('/apps').reply(200, []);
      });
      afterEach('api', () => {
        this.mock.done();
        return delete this.mock;
      });

      return it('should fail.', (cb) => {
        return project.select((err) => {
          expect(err).to.exist;
          expect(err.name).to.equal('NoAppsFound');
          return cb();
        });
      });
    });
    return describe('given no eligible datalinks', () => {
      before('getAppOrOrg', () => {
        const stub = sinon.stub(prompt, 'getAppOrOrg');
        return stub.callsArgWith(1, null, {
          name: 'App'
        });
      });
      afterEach('getAppOrOrg', () => {
        return prompt.getAppOrOrg.reset();
      });
      after('getAppOrOrg', () => {
        return prompt.getAppOrOrg.restore();
      });

      before('stub', () => {
        const stub = sinon.stub(prompt, 'getApp');
        return stub.callsArgWith(1, null, {
          id: '123'
        }, {
          id: '456'
        });
      });
      afterEach('stub', () => {
        return prompt.getApp.reset();
      });
      after('stub', () => {
        return prompt.getApp.restore();
      });

      beforeEach('api', () => {
        return this.mocks = [api.get('/apps').reply(200, [fixtures.app]), api.get('/v2/apps/123/data-links').reply(200, [fixtures.datalink])];
      });
      afterEach('api', () => {
        for (let i = 0; i < this.mocks; i++) {
          const mock = this.mocks[i];
          mock.done();
        }
        return delete this.mocks;
      });

      return it('should fail.', (cb) => {
        return project.select((err) => {
          expect(err).to.exist;
          expect(err.name).to.equal('NoFlexServicesFound');
          return cb();
        });
      });
    });
  });
  return describe('setup', () => {
    describe('when the project is not configured', () => {
      before('restore', () => {
        return sinon.stub(project, 'restore').callsArgWith(0, new Error('ProjectNotConfigured'));
      });
      afterEach('restore', () => {
        return project.restore.reset();
      });
      after('restore', () => {
        return project.restore.restore();
      });

      before('select', () => {
        return sinon.stub(project, 'select').callsArg(0);
      });
      afterEach('select', () => {
        return project.select.reset();
      });
      after('select', () => {
        return project.select.restore();
      });

      it('should restore the project.', (cb) => {
        return project.setup({}, (err) => {
          expect(project.restore).to.be.calledOnce;
          return cb(err);
        });
      });
      return it('should select the project if not configured.', (cb) => {
        return project.setup({}, (err) => {
          expect(project.select).to.be.calledOnce;
          return cb(err);
        });
      });
    });
    return describe('when the project can not be properly restored', () => {
      before('restore', () => {
        return sinon.stub(project, 'restore').callsArgWith(0, new Error('ProjectRestoreError'));
      });
      afterEach('restore', () => {
        return project.restore.reset();
      });
      after('restore', () => {
        return project.restore.restore();
      });

      before('select', () => {
        return sinon.stub(project, 'select').callsArg(0);
      });
      afterEach('select', () => {
        return project.select.reset();
      });
      after('select', () => {
        return project.select.restore();
      });

      it('should restore the project.', (cb) => {
        return project.setup({}, (err) => {
          expect(project.restore).to.be.calledOnce;
          return cb(err);
        });
      });
      return it('should select the project if not configured.', (cb) => {
        return project.setup({}, (err) => {
          expect(project.select).to.be.calledOnce;
          return cb(err);
        });
      });
    });
  });
});
