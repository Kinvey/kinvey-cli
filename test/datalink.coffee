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

# Imports.
api      = require './lib/api.coffee'
datalink = require '../lib/datalink.coffee'
project  = datalink.project

# Test suite.
describe 'datalink', () ->
  # Configure.
  beforeEach 'configure', () ->
    project.app = project.environment = project.datalink = '123'
  afterEach 'configure', () ->
    project.app = project.environment = project.datalink = null # Reset.

  # datalink.deploy().
  describe 'deploy', () ->
    # Tests.
    it 'should package the project.'
    it 'should upload the project package.'
    it 'should fail when the project is too big.'

    # datalink.restart().
  describe 'restart', () ->
    # Mock the API.
    beforeEach 'api', () ->
      this.mock = api.post "/apps/#{project.app}/data-links/#{project.datalink}/restart"
        .reply 202
    afterEach 'api', () ->
      this.mock.done()
      delete this.mock

    # Tests.
    it 'should restart.', (cb) ->
      datalink.restart cb

    # datalink.validate().
  describe 'validate', () ->
    # Tests.
    it 'should succeed when the backend-sdk dependency was met and project was configured.', (cb) ->
      datalink.validate cb

    it 'should fail when the backend-sdk dependency was not met.', (cb) ->
      datalink.validate (err) ->
        expect(err).to.exist
        expect(err.message).to.equal 'InvalidProject'
        cb()

    it 'should fail when the project was not configured.', (cb) ->
      datalink.validate (err) ->
        expect(err).to.exist
        expect(err.message).to.equal 'ProjectNotConfigured'
        cb()