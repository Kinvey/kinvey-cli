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

# Standard lib.
path = require 'path'

# Local modules.
api      = require './lib/api.coffee'
datalink = require '../lib/datalink.coffee'
project  = require '../lib/project.coffee'
util     = require '../lib/util.coffee'

# Configure.
fixtures =
  invalid : path.join __dirname, 'fixtures/deploy' # Big directory.
  valid   : path.join __dirname, 'lib' # Just a small directory.

# Test suite.
describe 'datalink', () ->
  # Configure.
  beforeEach 'configure', () ->
    project.app       = project.datalink = '123'
    project.lastJobId = 'abcdef'

  afterEach  'configure', () ->
    project.app       = project.datalink = null # Reset.
    project.lastJobId = null

  # datalink.deploy().
  describe 'deploy', () ->
    # Test v1 apps.
    describe 'for v1 apps', ->
      # Configure.
      beforeEach 'configure', () -> project.schemaVersion = 1
      afterEach  'configure', () -> project.schemaVersion = null # Reset.

      # Mock the API.
      beforeEach 'api', () ->
        this.subject = null
        this.mock = api
          .post '/v1/jobs'
          .reply 202, (uri, requestBody) =>
            this.subject = requestBody

      afterEach 'api', () ->
        this.mock.done()
        delete this.mock
        delete this.subject

      # Tests.
      it 'should package the project.', (cb) ->
        # Deploy and test.
        datalink.deploy fixtures.valid, '0.1.0', (err) =>
          expect(this.subject).to.exist
          expect(this.subject).to.have.length.above 1
          cb err

      it 'should fail when the project is too big.', (cb) ->
        datalink.deploy fixtures.invalid, '0.1.0', (err) ->
          expect(err).to.exist
          expect(err.name).to.equal 'ProjectMaxFileSizeExceeded'
          cb()

      it 'should upload.', (cb) ->
        datalink.deploy fixtures.valid, '0.1.0', cb

    # Test v2 apps.
    describe 'for v2 apps', ->
      # Configure.
      beforeEach 'configure', () -> project.schemaVersion = 2
      afterEach  'configure', () -> project.schemaVersion = null # Reset.

      # Mock the API.
      beforeEach 'api', () ->
        this.subject = null
        this.mock = api
          .post '/v2/jobs'
          .reply 202, (uri, requestBody) =>
            this.subject = requestBody

      afterEach 'api', () ->
        this.mock.done()
        delete this.mock
        delete this.subject

      # Tests.
      it 'should package the project.', (cb) ->
        # Deploy and test.
        datalink.deploy fixtures.valid, '0.1.0', (err) =>
          expect(this.subject).to.exist
          expect(this.subject).to.have.length.above 1
          cb err

      it 'should fail when the project is too big.', (cb) ->
        datalink.deploy fixtures.invalid, '0.1.0', (err) ->
          expect(err).to.exist
          expect(err.name).to.equal 'ProjectMaxFileSizeExceeded'
          cb()

      it 'should upload.', (cb) ->
        datalink.deploy fixtures.valid, '0.1.0', cb

  # datalink.recycle().
  describe 'recycle', () ->
    # Configure.
    beforeEach 'configure', () -> project.app = project.datalink = '123'
    afterEach  'configure', () -> project.app = project.datalink = null # Reset.

    # Test v1 apps.
    describe 'for v1 apps', ->
      # Configure.
      beforeEach 'configure', () -> project.schemaVersion = 1
      afterEach  'configure', () -> project.schemaVersion = null # Reset.

      # Mock the API.
      beforeEach 'api', () ->
        this.mock = api.post '/v1/jobs'
          .reply 202, { job: 123 }
      afterEach 'api', () ->
        this.mock.done()
        delete this.mock

      # Tests.
      it 'should recycle.', (cb) ->
        datalink.recycle cb

    # Test v2 apps.
    describe 'for v2 apps', ->
      beforeEach 'configure', () -> project.schemaVersion = 2
      afterEach  'configure', () -> project.schemaVersion = null # Reset.

      # Mock the API.
      beforeEach 'api', () ->
        this.mock = api.post '/v2/jobs'
          .reply 202, { job: 123 }
      afterEach 'api', () ->
        this.mock.done()
        delete this.mock

      # Tests.
      it 'should recycle.', (cb) ->
        datalink.recycle cb

  describe 'job', () ->
    # Configure.
    beforeEach 'configure', () -> project.app = project.datalink = '123'
    afterEach  'configure', () -> project.app = project.datalink = null # Reset.

    # Test v1 apps.
    describe 'for v1 apps', ->
      # Configure.
      beforeEach 'configure', () -> project.schemaVersion = 1
      afterEach  'configure', () -> project.schemaVersion = null # Reset.

      # Mock the API.
      beforeEach 'api', () ->
        this.mock = api.get '/v1/jobs/123'
          .reply 200, { status: 'COMPLETE' }
      afterEach 'api', () ->
        this.mock.done()
        delete this.mock

      # Tests.
      it 'should return the job status.', (cb) ->
        datalink.jobStatus '123', (err, status) ->
          expect(status).to.equal 'COMPLETE'
          cb err

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
          datalink.jobStatus '123', (err, status) ->
            expect(status).to.equal 'COMPLETE'
            cb err

      describe 'with a null job id value', () ->
        # Mock the API.
        beforeEach 'api', () ->
          this.mock = api.get '/v2/jobs/abcdef'
          .reply 200, { status: 'COMPLETE' }
        afterEach 'api', () ->
          if this.mock? then this.mock.done()
          delete this.mock

        it 'should return the job status for a cached job ID.', (cb) ->
          datalink.jobStatus null, (err, status) ->
            expect(status).to.equal 'COMPLETE'
            cb err

        it 'should return the job status for a cached job ID.', (cb) ->
          project.lastJobId = null
          delete this.mock
          datalink.jobStatus null, (err) ->
            expect(err).to.exist
            expect(err.message).to.equal 'No previous job stored. Please provide a job ID.'
            cb()

  describe 'status', () ->
    # Configure.
    beforeEach 'configure', () -> project.app = project.datalink = '123'
    afterEach  'configure', () -> project.app = project.datalink = null # Reset.

    # Test v2 apps.
    describe.only 'for v2 apps', ->
      # Configure.
      beforeEach 'configure', () -> project.schemaVersion = 2
      afterEach  'configure', () -> project.schemaVersion = null # Reset.

      # Mock the API.
      beforeEach 'api', () ->
        this.mock = api.get "/v#{project.schemaVersion}/data-links/#{project.datalink}/status"
        .reply 200, { status: 'ONLINE' }
      afterEach 'api', () ->
        this.mock.done()
        delete this.mock

      # Tests.
      it 'should return the service status.', (cb) ->
        datalink.serviceStatus (err, status) ->
          expect(status).to.equal 'ONLINE'
          cb err

  # datalink.validate().
  describe 'validate', () ->
    # Configure.
    beforeEach 'configure', () ->
      project.app = project.datalink = '123'
      project.schemaVersion = 1
    afterEach 'configure', () ->
    project.app = project.datalink = project.schemaVersion = null # Reset.

    # Helper which stubs a valid package.json.
    pkgVersion = '1.2.3'
    createPackage = () ->
      before 'stub', () ->
        sinon.stub(util, 'readJSON').callsArgWith 1, null, {
          dependencies: { 'kinvey-backend-sdk': '*' }
          version: pkgVersion
        }
      afterEach 'stub', () -> util.readJSON.reset()
      after     'stub', () -> util.readJSON.restore()

    # Test suite.
    describe 'when the project includes the kinvey-backend-sdk dependency', () ->
      createPackage()

      # Tests.
      it 'should succeed.', (cb) ->
        datalink.validate '*', (err, version) ->
          expect(version).to.equal pkgVersion
          cb err

    describe 'when the project does not include the backend-sdk dependency', () ->
      # Tests.
      it 'should fail.', (cb) ->
        datalink.validate '*', (err) ->
          expect(err).to.exist
          expect(err.name).to.equal 'InvalidProject'
          cb()

    describe 'when the project is configured', () ->
      createPackage()

      # Tests.
      it 'should succeed.', (cb) ->
        datalink.validate '*', (err, version) ->
          expect(version).to.equal pkgVersion
          cb err

    describe 'when the project was not configured', () ->
      createPackage()

      # Configure.
      beforeEach 'configure', () ->
        project.app = project.datalink = project.schemaVersion = null # Reset.

      # Tests.
      it 'should fail.', (cb) ->
        datalink.validate '*', (err) ->
          expect(err).to.exist
          expect(err.name).to.equal 'ProjectNotConfigured'
          cb()