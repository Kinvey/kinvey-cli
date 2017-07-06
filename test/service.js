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

const uuid = require('uuid');
const path = require('path');
const api = require('./lib/api.js');
const stdout = require('test-console').stdout;
const logger = require('../lib/logger');
const project = require('../lib/project.js');
const service = require('../lib/service.js');
const util = require('../lib/util.js');

const fixtures = {
  invalid: path.join(__dirname, 'fixtures/deploy'),
  valid: path.join(__dirname, 'lib')
};

describe('service', () => {
  beforeEach('configure', () => {
    project.app = project.service = '123';
    project.lastJobId = 'abcdef';
  });
  afterEach('configure', () => {
    project.app = project.service = null;
    project.lastJobId = null;
  });

  describe('deploy', () => {
    describe('for v2 apps', () => {
      beforeEach('configure', () => {
        project.schemaVersion = 2;
        this.jobId = uuid.v4();
      });
      afterEach('configure', () => {
        project.schemaVersion = null;
      });

      beforeEach('api', () => {
        this.subject = null;
        this.mock = api.post('/v2/jobs').reply(202, {
          job: this.jobId
        });
      });
      afterEach('api', () => {
        this.mock.done();
        delete this.mock;
        delete this.subject;
      });

      it('should package and deploy the project and cache the last job ID.', (cb) => {
        service.deploy(fixtures.valid, '0.1.0', (err) => {
          expect(project.lastJobId).to.equal(this.jobId);
          cb(err);
        });
      });
      it('should fail when the project is too big.', (cb) => {
        service.deploy(fixtures.invalid, '0.1.0', (err) => {
          expect(err).to.exist;
          expect(err.name).to.equal('ProjectMaxFileSizeExceeded');
          cb();
        });
      });
    });
  });
  describe('recycle', () => {
    beforeEach('configure', () => {
      project.app = project.service = '123';
    });
    afterEach('configure', () => {
      project.app = project.service = null;
    });

    describe('for v2 apps', () => {
      beforeEach('configure', () => {
        project.schemaVersion = 2;
        this.jobId = uuid.v4();
      });
      afterEach('configure', () => {
        project.schemaVersion = null;
      });

      beforeEach('api', () => {
        this.mock = api.post('/v2/jobs').reply(202, {
          job: this.jobId
        });
      });
      afterEach('api', () => {
        this.mock.done();
        delete this.mock;
      });

      it('should recycle.', (cb) => {
        service.recycle((err) => {
          expect(project.lastJobId).to.equal(this.jobId);
          cb(err);
        });
      });
    });
  });
  describe('job', () => {
    beforeEach('configure', () => {
      project.app = project.service = '123';
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

      describe('with a non-null job id value', () => {
        beforeEach('api', () => {
          this.mock = api.get('/v2/jobs/123').reply(200, {
            status: 'COMPLETE'
          });
        });
        afterEach('api', () => {
          this.mock.done();
          delete this.mock;
        });

        it('should the job status.', (cb) => {
          service.jobStatus('123', (err, status) => {
            expect(status).to.equal('COMPLETE');
            cb(err);
          });
        });
      });
      describe('with a null job id value', () => {
        beforeEach('api', () => {
          this.mock = api.get('/v2/jobs/abcdef').reply(200, {
            status: 'COMPLETE'
          });
        });
        afterEach('api', () => {
          if (this.mock != null) {
            this.mock.done();
            delete this.mock;
          }
        });

        it('should the job status for a cached job ID.', (cb) => {
          service.jobStatus(null, (err, status) => {
            expect(status).to.equal('COMPLETE');
            cb(err);
          });
        });
      });
      it('should fail with a null param and no cached job ID', (cb) => {
        project.lastJobId = null;
        delete this.mock;
        service.jobStatus(null, (err) => {
          expect(err).to.exist;
          expect(err.message).to.equal('No previous job stored. Please provide a job ID.');
          cb();
        });
      });
      it('should cache the updated job ID', (cb) => {
        delete this.mock;
        this.mock = api.get('/v2/jobs/testjob').reply(200, {
          status: 'COMPLETE'
        });
        let deployMock = api.post('/v2/jobs').reply(202, {
          job: 'testjob'
        });
        service.deploy(fixtures.valid, '0.1.0', (err) => {
          expect(err).to.be.undefined;
          service.jobStatus(null, (err, status) => {
            expect(status).to.equal('COMPLETE');
            deployMock.done();
            deployMock = null;
            cb(err);
          });
        });
      });
    });
  });
  describe('status', () => {
    beforeEach('configure', () => {
      project.app = project.service = '123';
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

      beforeEach('api', () => {
        this.mock = api.get(`/v${project.schemaVersion}/data-links/${project.service}/status`).reply(200, {
          status: 'ONLINE'
        });
      });
      afterEach('api', () => {
        this.mock.done();
        delete this.mock;
      });

      it('should the service status.', (cb) => {
        service.serviceStatus((err, status) => {
          expect(status).to.equal('ONLINE');
          cb(err);
        });
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
          service.logs(null, null, (err, logs) => {
            expect(logs[0].threshold).to.equal('info');
            expect(logs[0].message).to.equal(this.message);
            expect(logs[0].containerId).to.equal(this.containerId);
            cb(err);
          });
        });
      });
      describe('with a logs \'to\' filter', () => {
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
          service.logs(this.from, null, (err, logs) => {
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
          service.logs(null, this.to, (err, logs) => {
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
          service.logs(this.from, this.to, (err, logs) => {
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
          service.logs(null, null, (err, logs) => {
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
          service.logs(null, null, (err, logs) => {
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
          expect(err).to.exist;
          expect(err.name).to.equal('InvalidProject');
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
          expect(err).to.exist;
          expect(err.name).to.equal('ProjectNotConfigured');
          cb();
        });
      });
    });
  });
});
