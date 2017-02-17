###
Copyright 2016 Kinvey, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
###

# Third party.
uuid = require 'uuid'

# Standard lib.
path = require 'path'

# Local modules.
api      = require './lib/api.coffee'
stdout   = require('test-console').stdout
logger   = require '../lib/logger'
project  = require '../lib/project.js'
service  = require '../lib/service.js'
util     = require '../lib/util.js'

# Configure.
fixtures =
  invalid : path.join __dirname, 'fixtures/deploy' # Big directory.
  valid   : path.join __dirname, 'lib' # Just a small directory.

# Test suite.
describe 'service', () ->
  # Configure.
  beforeEach 'configure', () ->
    project.app       = project.service = '123'
    project.lastJobId = 'abcdef'

  afterEach  'configure', () ->
    project.app       = project.service = null # Reset.
    project.lastJobId = null

  # service.deploy().
  describe 'deploy', () ->
    # Test v2 apps.
    describe 'for v2 apps', ->
      # Configure.
      beforeEach 'configure', () ->
        project.schemaVersion = 2
        this.jobId = uuid.v4()
      afterEach  'configure', () -> project.schemaVersion = null # Reset.

      # Mock the API.
      beforeEach 'api', () ->
        this.subject = null
        this.mock = api
          .post '/v2/jobs'
          .reply 202, { job: this.jobId }

      afterEach 'api', () ->
        this.mock.done()
        delete this.mock
        delete this.subject

      # Tests.
      it 'should package and deploy the project and cache the last job ID.', (cb) ->
        # Deploy and test.
        service.deploy fixtures.valid, '0.1.0', (err) =>
          expect(project.lastJobId).to.equal this.jobId
          cb err

      it 'should fail when the project is too big.', (cb) ->
        service.deploy fixtures.invalid, '0.1.0', (err) ->
          expect(err).to.exist
          expect(err.name).to.equal 'ProjectMaxFileSizeExceeded'
          cb()

  # service.recycle().
  describe 'recycle', () ->
    # Configure.
    beforeEach 'configure', () -> project.app = project.service = '123'
    afterEach  'configure', () -> project.app = project.service = null # Reset.

    # Test v2 apps.
    describe 'for v2 apps', ->
      beforeEach 'configure', () ->
        project.schemaVersion = 2
        this.jobId = uuid.v4()
      afterEach  'configure', () -> project.schemaVersion = null # Reset.

      # Mock the API.
      beforeEach 'api', () ->
        this.mock = api.post '/v2/jobs'
          .reply 202, { job: this.jobId }
      afterEach 'api', () ->
        this.mock.done()
        delete this.mock

      # Tests.
      it 'should recycle.', (cb) ->
        service.recycle (err) =>
          expect(project.lastJobId).to.equal this.jobId
          cb err

  describe 'job', () ->
    # Configure.
    beforeEach 'configure', () -> project.app = project.service = '123'
    afterEach  'configure', () -> project.app = project.service = null # Reset.

    # Test v2 apps.
    describe 'for v2 apps', ->
      # Configure.
      beforeEach 'configure', () -> project.schemaVersion = 2
      afterEach  'configure', () -> project.schemaVersion = null # Reset.

      describe 'with a non-null job id value', () ->
        # Mock the API.
        beforeEach 'api', () ->
          this.mock = api.get '/v2/jobs/123'
          .reply 200, { status: 'COMPLETE' }
        afterEach 'api', () ->
          this.mock.done()
          delete this.mock

        # Tests.
        it 'should return the job status.', (cb) ->
          service.jobStatus '123', (err, status) ->
            expect(status).to.equal 'COMPLETE'
            cb err

      describe 'with a null job id value', () ->
        # Mock the API.
        beforeEach 'api', () ->
          this.mock = api.get '/v2/jobs/abcdef'
          .reply 200, { status: 'COMPLETE' }
        afterEach 'api', () ->
          if this.mock?
            this.mock.done()
            delete this.mock

        it 'should return the job status for a cached job ID.', (cb) ->
          service.jobStatus null, (err, status) ->
            expect(status).to.equal 'COMPLETE'
            cb err

      it 'should fail with a null param and no cached job ID', (cb) ->
        project.lastJobId = null
        delete this.mock
        service.jobStatus null, (err) ->
          expect(err).to.exist
          expect(err.message).to.equal 'No previous job stored. Please provide a job ID.'
          cb()

      it 'should cache the updated job ID', (cb) ->
        delete this.mock
        this.mock = api.get '/v2/jobs/testjob'
        .reply 200, { status: 'COMPLETE' }
        deployMock = api
        .post '/v2/jobs'
        .reply 202, { job: 'testjob' }

        service.deploy fixtures.valid, '0.1.0', (err) ->
          expect(err).to.be.undefined
          service.jobStatus null, (err, status) ->
            expect(status).to.equal 'COMPLETE'
            deployMock.done()
            deployMock = null
            cb err

  describe 'status', () ->
    # Configure.
    beforeEach 'configure', () -> project.app = project.service = '123'
    afterEach  'configure', () -> project.app = project.service = null # Reset.

    # Test v2 apps.
    describe 'for v2 apps', ->
      # Configure.
      beforeEach 'configure', () -> project.schemaVersion = 2
      afterEach  'configure', () -> project.schemaVersion = null # Reset.

      # Mock the API.
      beforeEach 'api', () ->
        this.mock = api.get "/v#{project.schemaVersion}/data-links/#{project.service}/status"
        .reply 200, { status: 'ONLINE' }
      afterEach 'api', () ->
        this.mock.done()
        delete this.mock

      # Tests.
      it 'should return the service status.', (cb) ->
        service.serviceStatus (err, status) ->
          expect(status).to.equal 'ONLINE'
          cb err

  describe 'logs', () ->
    # Configure.
    beforeEach 'configure', () ->
      project.app = project.service = '123'
      this.message     = uuid.v4()
      this.containerId = uuid.v4()
      this.from        = uuid.v4()
      this.to          = uuid.v4()
    afterEach  'configure', () -> project.app = project.service = null # Reset.

    # Test v2 apps.
    describe 'for v2 apps', ->
      # Configure.
      beforeEach 'configure', () -> project.schemaVersion = 2
      afterEach  'configure', () -> project.schemaVersion = null # Reset.

      describe 'without any request filtering', () ->
        # Mock the API.
        beforeEach 'api', () ->
          this.mock = api.get "/v#{project.schemaVersion}/data-links/#{project.service}/logs"
          .reply 200, [
            {
              threshold: 'info'
              message: this.message
              timestamp: new Date().toISOString()
              containerId: this.containerId
            }
          ]
        afterEach 'api', () ->
          this.mock.done()
          delete this.mock

        # Tests.
        it 'should return the service logs.', (cb) ->
          service.logs null, null, (err, logs) =>
            expect(logs[0].threshold).to.equal 'info'
            expect(logs[0].message).to.equal this.message
            expect(logs[0].containerId).to.equal this.containerId
            cb err

      describe 'with a logs \'to\' filter', () ->
        # Mock the API.
        beforeEach 'api', () ->
          this.mock = api.get "/v#{project.schemaVersion}/data-links/#{project.service}/logs?from=#{this.from}"
          .reply 200, [
            {
              threshold: 'info'
              message: this.message
              timestamp: new Date().toISOString()
              containerId: this.containerId
            }
          ]
        afterEach 'api', () ->
          this.mock.done()
          delete this.mock

        # Tests.
        it 'should return the service logs.', (cb) ->
          service.logs this.from, null, (err, logs) =>
            expect(logs[0].threshold).to.equal 'info'
            expect(logs[0].message).to.equal this.message
            expect(logs[0].containerId).to.equal this.containerId
            cb err

      describe 'with a logs \'to\' filter', () ->
        # Mock the API.
        beforeEach 'api', () ->
          this.mock = api.get "/v#{project.schemaVersion}/data-links/#{project.service}/logs?to=#{this.to}"
          .reply 200, [
            {
              threshold: 'info'
              message: this.message
              timestamp: new Date().toISOString()
              containerId: this.containerId
            }
          ]
        afterEach 'api', () ->
          this.mock.done()
          delete this.mock

        # Tests.
        it 'should return the service logs.', (cb) ->
          service.logs null, this.to, (err, logs) =>
            expect(logs[0].threshold).to.equal 'info'
            expect(logs[0].message).to.equal this.message
            expect(logs[0].containerId).to.equal this.containerId
            cb err

      describe 'with a logs \'from\' and \'to\' filter', () ->
        # Mock the API.
        beforeEach 'api', () ->
          this.mock = api.get "/v#{project.schemaVersion}/data-links/#{project.service}/logs?from=#{this.from}&to=#{this.to}"
          .reply 200, [
            {
              threshold: 'info'
              message: this.message
              timestamp: new Date().toISOString()
              containerId: this.containerId
            }
          ]
        afterEach 'api', () ->
          this.mock.done()
          delete this.mock

        # Tests.
        it 'should return the service logs.', (cb) ->
          service.logs this.from, this.to, (err, logs) =>
            expect(logs[0].threshold).to.equal 'info'
            expect(logs[0].message).to.equal this.message
            expect(logs[0].containerId).to.equal this.containerId
            cb err

      describe 'with an undefined message in a result object', () ->
        before 'log level', () ->
          logger.config { level: 0 } # Verbose for this test

        after 'log level', () ->
          logger.config { level: 3 } # Silent afterward

        # Mock the API.
        beforeEach 'api', () ->
          this.mock = api.get "/v#{project.schemaVersion}/data-links/#{project.service}/logs"
            .reply 200, [
              {
                threshold: 'info'
                timestamp: new Date().toISOString()
                containerId: this.containerId
              }
            ]
        afterEach 'api', () ->
          this.mock.done()
          delete this.mock

        # Tests.
        it 'should not return any logs.', (cb) ->
          service.logs null, null, (err, logs) =>
            expect(logs[0].threshold).to.equal 'info'
            expect(logs[0].message).not.to.exist
            expect(logs[0].containerId).to.equal this.containerId
            expect(logs[0].skipped).to.equal true # entry was skipped due to lack of valid `message` property
            cb err

      describe 'with a non-string message body', () ->
        # Mock the API.
        beforeEach 'api', () ->
          this.mock = api.get "/v#{project.schemaVersion}/data-links/#{project.service}/logs"
            .reply 200, [
              {
                threshold: 'info'
                message: [this.message]
                timestamp: new Date().toISOString()
                containerId: this.containerId
              }
            ]
        afterEach 'api', () ->
          this.mock.done()
          delete this.mock

        # Tests.
        it 'should return a stringified message.', (cb) ->
          inspect = stdout.inspect() # hook into STDOUT to verify that message is actually printed
          service.logs null, null, (err, logs) =>
            inspect.restore()
            stdoutResult = inspect.output
            expect(stdoutResult[0]).to.contain this.message
            expect(logs[0].threshold).to.equal 'info'
            expect(logs[0].containerId).to.equal this.containerId
            cb err

  # service.validate().
  describe 'validate', () ->
    # Configure.
    beforeEach 'configure', () ->
      project.app = project.service = '123'
      project.schemaVersion = 1
    afterEach 'configure', () ->
    project.app = project.service = project.schemaVersion = null # Reset.

    # Helper which stubs a valid package.json.
    pkgVersion = '1.2.3'
    createPackage = () ->
      before 'stub', () ->
        sinon.stub(util, 'readJSON').callsArgWith 1, null, {
          dependencies: { 'kinvey-flex-sdk': '*' }
          version: pkgVersion
        }
      afterEach 'stub', () -> util.readJSON.reset()
      after     'stub', () -> util.readJSON.restore()

    # Test suite.
    describe 'when the project includes the kinvey-flex-sdk dependency', () ->
      createPackage()

      # Tests.
      it 'should succeed.', (cb) ->
        service.validate '*', (err, version) ->
          expect(version).to.equal pkgVersion
          cb err

    describe 'when the project does not include the flex-sdk dependency', () ->
      # Tests.
      it 'should fail.', (cb) ->
        service.validate '*', (err) ->
          expect(err).to.exist
          expect(err.name).to.equal 'InvalidProject'
          cb()

    describe 'when the project is configured', () ->
      createPackage()

      # Tests.
      it 'should succeed.', (cb) ->
        service.validate '*', (err, version) ->
          expect(version).to.equal pkgVersion
          cb err

    describe 'when the project was not configured', () ->
      createPackage()

      # Configure.
      beforeEach 'configure', () ->
        project.app = project.service = project.schemaVersion = null # Reset.

      # Tests.
      it 'should fail.', (cb) ->
        service.validate '*', (err) ->
          expect(err).to.exist
          expect(err.name).to.equal 'ProjectNotConfigured'
          cb()