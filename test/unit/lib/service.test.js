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
const uuid = require('uuid');
const path = require('path');
const api = require('./../../api.js');
const stdout = require('test-console').stdout;
const logger = require('./../../../lib/logger');
const project = require('./../../../lib/project.js');
const service = require('./../../../lib/service.js');
const util = require('../../../lib/Utils.js');
const JobStatus = require('../../../lib/Constants').JobStatus;
const Errors = require('../../../lib/Constants').Errors;
const ServiceStatus = require('../../../lib/Constants').ServiceStatus;
const helper = require('../../tests-helper');

const fixtures = {
  invalid: path.resolve('./test/fixtures/deploy'),
  valid: path.resolve('./test/commands')
};

describe('service', () => {
  after('generalCleanup', (cb) => {
    helper.setup.performGeneralCleanup(cb);
  });

  beforeEach('configure', () => {
    project.app = project.service = '123';
    project.lastJobId = 'abcdef';
  });

  after('configure', () => {
    project.app = project.service = null;
    project.lastJobId = null;
  });

  describe('deploy', () => {
    describe('for v2 apps', () => {
      before('lower deploy request timeout', () => {
        this.oldConfigValue = config.uploadTimeout;
        config.uploadTimeout = 500;
      });
      after('lower deploy request timeout', () => {
        config.uploadTimeout = this.oldConfigValue;
      });

      beforeEach('configure', () => {
        project.schemaVersion = 2;
        this.jobId = uuid.v4();
      });

      after('configure', () => {
        project.schemaVersion = null;
      });

      it('should package and deploy the project and cache the last job ID.', (cb) => {
        let mock = api.post('/v2/jobs').reply(202, {
          job: this.jobId
        });
        service.deploy(fixtures.valid, '0.1.0', (err) => {
          expect(project.lastJobId).to.equal(this.jobId);
          mock.done();
          mock = null;
          cb();
        });
      });
      it('should fail when the project is too big.', (cb) => {
        service.deploy(fixtures.invalid, '0.1.0', (err) => {
          helper.assertions.assertError(err, Errors.ProjectMaxFileSizeExceeded);
          cb();
        });
      });
    });
  });

  describe('recycle', () => {
    beforeEach('configure', () => {
      project.app = project.service = '123';
    });

    after('configure', () => {
      project.app = project.service = null;
    });

    describe('for v2 apps', () => {
      beforeEach('configure', () => {
        project.schemaVersion = 2;
        this.jobId = uuid.v4();
      });

      after('configure', () => {
        project.schemaVersion = null;
      });

      beforeEach('api', () => {
        sinon.stub(util, 'makeRequest').callsArgWith(1, null, { body: { job: this.jobId } });
      });

      afterEach('api', () => {
        util.makeRequest.restore();
      });

      it('should recycle.', (cb) => {
        service.recycle((err) => {
          expect(project.lastJobId).to.equal(this.jobId);
          cb(err);
        });
      });
    });
  });


  describe('job status (v2 apps)', () => {
    const sandbox = sinon.sandbox.create();
    const testJobId = '123';

    beforeEach('configure', () => {
      project.app = project.service = testJobId;
      project.schemaVersion = 2;
    });

    after('configure', () => {
      project.app = project.service = null;
    });

    beforeEach(() => {
      sandbox.restore();
    });

    it('should fail with a null param and no cached job ID', (cb) => {
      project.lastJobId = null;

      service.jobStatus(null, (err) => {
        expect(err).to.exist;
        expect(err.message).to.equal('No previous job stored. Please provide a job ID.');
        cb();
      });
    });

    it(`should be ${JobStatus.COMPLETE} when job exists and is complete`, (cb) => {
      sandbox.stub(util, 'makeRequest')
        .withArgs({ url: `/v${project.schemaVersion}/jobs/${testJobId}` })
        .callsArgWith(1, null, { body: { status: JobStatus.COMPLETE } });

      service.jobStatus(testJobId, (err, status) => {
        expect(err).to.not.exist;
        expect(status).to.equal(JobStatus.COMPLETE);
        cb();
      });
    });

    it('should cache the updated job ID', (cb) => {
      const someJobId = 'someJobId';

      this.mock = api.get(`/v2/jobs/${someJobId}`).reply(200, {
        status: JobStatus.COMPLETE
      });
      const deployMock = api.post('/v2/jobs').reply(202, {
        job: someJobId
      });

      service.deploy(fixtures.valid, '0.1.0', (err) => {
        expect(err).to.not.exist;

        service.jobStatus(null, (err, status) => {
          expect(err).to.not.exist;
          expect(status).to.equal(JobStatus.COMPLETE);
          cb();
        });
      });
    });
  });

  describe('status (for v2 apps)', () => {
    const sandbox = sinon.sandbox.create();

    beforeEach('configure', () => {
      project.app = project.service = '123';
      project.schemaVersion = 2;
    });

    after('configure', () => {
      project.app = project.service = null;
      project.schemaVersion = null;
    });

    after(() => {
      sandbox.restore();
    });

    it('should retrieve the service status.', (cb) => {
      sandbox.stub(util, 'makeRequest')
        .withArgs({ url: `/v${project.schemaVersion}/data-links/${project.service}/status` })
        .callsArgWith(1, null, { body: { status: ServiceStatus.ONLINE } });

      service.serviceStatus((err, result) => {
        expect(result.status).to.equal(ServiceStatus.ONLINE);
        cb(err);
      });
    });

    it('should retrieve the service status and version.', (cb) => {
      sandbox.restore();
      sandbox.stub(util, 'makeRequest')
        .withArgs({ url: `/v${project.schemaVersion}/data-links/${project.service}/status` })
        .callsArgWith(1, null, { body: { status: ServiceStatus.ONLINE, version: '0.0.1' } });

      service.serviceStatus((err, result) => {
        expect(result.status).to.equal(ServiceStatus.ONLINE);
        expect(result.version).to.equal('0.0.1');
        cb(err);
      });
    });

    it('should retrieve the service status, version, deploy time, and deployer email address.', (cb) => {
      sandbox.restore();
      const requestedAt = new Date().toISOString();
      const testEmailAddress = uuid.v4();
      sandbox.stub(util, 'makeRequest')
        .withArgs({ url: `/v${project.schemaVersion}/data-links/${project.service}/status` })
        .callsArgWith(1, null, { body: {
          status: ServiceStatus.ONLINE,
          version: '0.0.1',
          requestedAt,
          deployUserInfo: {
            email: testEmailAddress
          }
        } });

      service.serviceStatus((err, result) => {
        expect(result.status).to.equal(ServiceStatus.ONLINE);
        expect(result.version).to.equal('0.0.1');
        expect(result.requestedAt).to.equal(requestedAt);
        expect(result.deployUserInfo.email).to.equal(testEmailAddress);
        cb(err);
      });
    });

    it('should retrieve the service status, version, deploy time, deployer email address, and deployer first/last name.', (cb) => {
      sandbox.restore();
      const requestedAt = new Date().toISOString();
      const testEmailAddress = uuid.v4();
      const testFirstName = uuid.v4();
      const testLastName = uuid.v4();
      sandbox.stub(util, 'makeRequest')
        .withArgs({ url: `/v${project.schemaVersion}/data-links/${project.service}/status` })
        .callsArgWith(1, null, {
          body: {
            status: ServiceStatus.ONLINE,
            version: '0.0.1',
            requestedAt,
            deployUserInfo: {
              email: testEmailAddress,
              firstName: testFirstName,
              lastName: testLastName
            }
          }
        });

      service.serviceStatus((err, result) => {
        expect(result.status).to.equal(ServiceStatus.ONLINE);
        expect(result.version).to.equal('0.0.1');
        expect(result.requestedAt).to.equal(requestedAt);
        expect(result.deployUserInfo.email).to.equal(testEmailAddress);
        expect(result.deployUserInfo.firstName).to.equal(testFirstName);
        expect(result.deployUserInfo.lastName).to.equal(testLastName);
        cb(err);
      });
    });
  });

  describe('logs', () => {
    beforeEach('configure', () => {
      project.app = project.service = '123';
      this.message = uuid.v4();
      this.containerId = uuid.v4();
      this.from = uuid.v4();
      this.to = uuid.v4();
      this.page = Math.floor(Math.random() * 10) + 1;
      this.limit = Math.floor(Math.random() * 10) + 1;
    });
    afterEach('configure', () => {
      project.app = project.service = null;
    });

    describe('for v2 apps', () => {
      beforeEach('configure', () => {
        project.schemaVersion = 2;
      });
      afterEach('configure', () => {
        project.schemaVersion = null;
      });

      describe('without any request filtering', () => {
        beforeEach('api', () => {
          this.mock = api.get(`/v${project.schemaVersion}/data-links/${project.service}/logs`).reply(200, [
            {
              threshold: 'info',
              message: this.message,
              timestamp: new Date().toISOString(),
              containerId: this.containerId
            }
          ]);
        });
        afterEach('api', () => {
          this.mock.done();
          delete this.mock;
        });

        it('should the service logs.', (cb) => {
          service.logs(null, null, null, null, (err, logs) => {
            expect(logs[0].threshold).to.equal('info');
            expect(logs[0].message).to.equal(this.message);
            expect(logs[0].containerId).to.equal(this.containerId);
            cb(err);
          });
        });
      });
      describe('with a logs \'from\' filter', () => {
        beforeEach('api', () => {
          this.mock = api.get(`/v${project.schemaVersion}/data-links/${project.service}/logs?from=${this.from}`).reply(200, [
            {
              threshold: 'info',
              message: this.message,
              timestamp: new Date().toISOString(),
              containerId: this.containerId
            }
          ]);
        });
        afterEach('api', () => {
          this.mock.done();
          delete this.mock;
        });

        it('should the service logs.', (cb) => {
          service.logs(this.from, null, null, null, (err, logs) => {
            expect(logs[0].threshold).to.equal('info');
            expect(logs[0].message).to.equal(this.message);
            expect(logs[0].containerId).to.equal(this.containerId);
            cb(err);
          });
        });
      });
      describe('with a logs \'to\' filter', () => {
        beforeEach('api', () => {
          this.mock = api.get(`/v${project.schemaVersion}/data-links/${project.service}/logs?to=${this.to}`).reply(200, [
            {
              threshold: 'info',
              message: this.message,
              timestamp: new Date().toISOString(),
              containerId: this.containerId
            }
          ]);
        });
        afterEach('api', () => {
          this.mock.done();
          delete this.mock;
        });

        it('should the service logs.', (cb) => {
          service.logs(null, this.to, null, null, (err, logs) => {
            expect(logs[0].threshold).to.equal('info');
            expect(logs[0].message).to.equal(this.message);
            expect(logs[0].containerId).to.equal(this.containerId);
            cb(err);
          });
        });
      });
      describe('with a logs \'from\' and \'to\' filter', () => {
        beforeEach('api', () => {
          this.mock = api.get(`/v${project.schemaVersion}/data-links/${project.service}/logs?from=${this.from}&to=${this.to}`).reply(200, [
            {
              threshold: 'info',
              message: this.message,
              timestamp: new Date().toISOString(),
              containerId: this.containerId
            }
          ]);
        });
        afterEach('api', () => {
          this.mock.done();
          delete this.mock;
        });

        it('should the service logs.', (cb) => {
          service.logs(this.from, this.to, null, null, (err, logs) => {
            expect(logs[0].threshold).to.equal('info');
            expect(logs[0].message).to.equal(this.message);
            expect(logs[0].containerId).to.equal(this.containerId);
            cb(err);
          });
        });
      });
      describe('with a logs \'page\' filter', () => {
        beforeEach('api', () => {
          this.mock = api.get(`/v${project.schemaVersion}/data-links/${project.service}/logs?page=${this.page}`).reply(200, [
            {
              threshold: 'info',
              message: this.message,
              timestamp: new Date().toISOString(),
              containerId: this.containerId
            }
          ]);
        });
        afterEach('api', () => {
          this.mock.done();
          delete this.mock;
        });

        it('should retrieve the service logs.', (cb) => {
          service.logs(null, null, null, this.page, (err, logs) => {
            expect(logs[0].threshold).to.equal('info');
            expect(logs[0].message).to.equal(this.message);
            expect(logs[0].containerId).to.equal(this.containerId);
            cb(err);
          });
        });
      });
      describe('with a logs \'number\' filter', () => {
        beforeEach('api', () => {
          this.mock = api.get(`/v${project.schemaVersion}/data-links/${project.service}/logs?limit=${this.limit}`).reply(200, [
            {
              threshold: 'info',
              message: this.message,
              timestamp: new Date().toISOString(),
              containerId: this.containerId
            }
          ]);
        });
        afterEach('api', () => {
          this.mock.done();
          delete this.mock;
        });

        it('should retrieve the service logs.', (cb) => {
          service.logs(null, null, this.limit, null, (err, logs) => {
            expect(logs[0].threshold).to.equal('info');
            expect(logs[0].message).to.equal(this.message);
            expect(logs[0].containerId).to.equal(this.containerId);
            cb(err);
          });
        });
      });
      describe('with logs \'number\' and \'page\' filters', () => {
        beforeEach('api', () => {
          this.mock = api.get(`/v${project.schemaVersion}/data-links/${project.service}/logs?limit=${this.limit}&page=${this.page}`).reply(200, [
            {
              threshold: 'info',
              message: this.message,
              timestamp: new Date().toISOString(),
              containerId: this.containerId
            }
          ]);
        });
        afterEach('api', () => {
          this.mock.done();
          delete this.mock;
        });

        it('should retrieve the service logs.', (cb) => {
          service.logs(null, null, this.limit, this.page, (err, logs) => {
            expect(logs[0].threshold).to.equal('info');
            expect(logs[0].message).to.equal(this.message);
            expect(logs[0].containerId).to.equal(this.containerId);
            cb(err);
          });
        });
      });
      describe('with all filters', () => {
        beforeEach('api', () => {
          this.mock = api.get(`/v${project.schemaVersion}/data-links/${project.service}/logs?from=${this.from}&to=${this.to}&limit=${this.limit}&page=${this.page}`).reply(200, [
            {
              threshold: 'info',
              message: this.message,
              timestamp: new Date().toISOString(),
              containerId: this.containerId
            }
          ]);
        });
        afterEach('api', () => {
          this.mock.done();
          delete this.mock;
        });

        it('should retrieve the service logs.', (cb) => {
          service.logs(this.from, this.to, this.limit, this.page, (err, logs) => {
            expect(logs[0].threshold).to.equal('info');
            expect(logs[0].message).to.equal(this.message);
            expect(logs[0].containerId).to.equal(this.containerId);
            cb(err);
          });
        });
      });
      describe('with an undefined message in a result object', () => {
        before('log level', () => {
          logger.config({
            level: 0
          });
        });
        after('log level', () => {
          logger.config({
            level: 3
          });
        });

        beforeEach('api', () => {
          this.mock = api.get(`/v${project.schemaVersion}/data-links/${project.service}/logs`).reply(200, [
            {
              threshold: 'info',
              timestamp: new Date().toISOString(),
              containerId: this.containerId
            }
          ]);
        });
        afterEach('api', () => {
          this.mock.done();
          delete this.mock;
        });

        it('should not any logs.', (cb) => {
          service.logs(null, null, null, null, (err, logs) => {
            expect(logs[0].threshold).to.equal('info');
            expect(logs[0].message).not.to.exist;
            expect(logs[0].containerId).to.equal(this.containerId);
            expect(logs[0].skipped).to.equal(true);
            cb(err);
          });
        });
      });
      describe('with a non-string message body', () => {
        beforeEach('api', () => {
          this.mock = api.get(`/v${project.schemaVersion}/data-links/${project.service}/logs`).reply(200, [
            {
              threshold: 'info',
              message: [this.message],
              timestamp: new Date().toISOString(),
              containerId: this.containerId
            }
          ]);
        });
        afterEach('api', () => {
          this.mock.done();
          delete this.mock;
        });

        it('should a stringified message.', (cb) => {
          const inspect = stdout.inspect();
          service.logs(null, null, null, null, (err, logs) => {
            inspect.restore();
            const stdoutResult = inspect.output;
            expect(stdoutResult[0]).to.contain(this.message);
            expect(logs[0].threshold).to.equal('info');
            expect(logs[0].containerId).to.equal(this.containerId);
            cb(err);
          });
        });
      });
    });
  });
  describe('validate', () => {
    beforeEach('configure', () => {
      project.app = project.service = '123';
      project.schemaVersion = 1;
    });
    afterEach('configure', () => {
      project.app = project.service = project.schemaVersion = null;
    });

    const pkgVersion = '1.2.3';
    createPackage = () => {
      before('stub', () => {
        sinon.stub(util, 'readJSON').callsArgWith(1, null, {
          dependencies: {
            'kinvey-flex-sdk': '*'
          },
          version: pkgVersion
        });
      });
      afterEach('stub', () => {
        util.readJSON.reset();
      });
      after('stub', () => {
        util.readJSON.restore();
      });
    };

    describe('when the project includes the kinvey-flex-sdk dependency', () => {
      createPackage();
      it('should succeed.', (cb) => {
        service.validate('*', (err, version) => {
          expect(version).to.equal(pkgVersion);
          cb(err);
        });
      });
    });
    describe('when the project does not include the flex-sdk dependency', () => {
      it('should fail.', (cb) => {
        service.validate('*', (err) => {
          helper.assertions.assertError(err, Errors.InvalidProject);
          cb();
        });
      });
    });
    describe('when the project is configured', () => {
      createPackage();
      it('should succeed.', (cb) => {
        service.validate('*', (err, version) => {
          expect(version).to.equal(pkgVersion);
          cb(err);
        });
      });
    });
    describe('when the project was not configured', () => {
      createPackage();
      beforeEach('configure', () => {
        project.app = project.service = project.schemaVersion = null;
      });
      it('should fail.', (cb) => {
        service.validate('*', (err) => {
          helper.assertions.assertError(err, Errors.ProjectNotConfigured);
          cb();
        });
      });
    });
  });
});
