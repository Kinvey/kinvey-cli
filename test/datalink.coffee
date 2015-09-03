###
Copyright 2015 Kinvey, Inc.

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
    project.app = project.datalink = '123'
  afterEach 'configure', () ->
    project.app = project.datalink = null # Reset.

  # datalink.deploy().
  describe 'deploy', () ->
    # Mock the API.
    beforeEach 'api', () ->
      this.subject = null
      this.mock = api
        .post "/apps/#{project.app}/data-links/#{project.datalink}/deploy"
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
    # Mock the API.
    beforeEach 'api', () ->
      this.mock = api.post "/apps/#{project.app}/data-links/#{project.datalink}/recycle"
        .reply 202, { job: 123 }
    afterEach 'api', () ->
      this.mock.done()
      delete this.mock

    # Tests.
    it 'should recycle.', (cb) ->
      datalink.recycle cb

  describe 'status', () ->
    # Mock the API.
    beforeEach 'api', () ->
      this.mock = api.get "/apps/#{project.app}/data-links/#{project.datalink}/deploy?job=123"
        .reply 200, { status: 'COMPLETE' }
    afterEach 'api', () ->
      this.mock.done()
      delete this.mock

    # Tests.
    it 'should return the job status.', (cb) ->
      datalink.status '123', (err, status) ->
        expect(status).to.equal 'COMPLETE'
        cb err

    # datalink.validate().
  describe 'validate', () ->
    # Helper which stubs a valid package.json.
    pkgVersion = '1.2.3'
    createPackage = () ->
      before 'stub', () -> sinon.stub(util, 'readJSON').callsArgWith 1, null, {
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
        project.app = project.datalink = null # Reset.

      # Tests.
      it 'should fail.', (cb) ->
        datalink.validate '*', (err) ->
          expect(err).to.exist
          expect(err.name).to.equal 'ProjectNotConfigured'
          cb()