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

# Package modules.
config   = require 'config'

# Local modules.
api     = require './lib/api.coffee'
project = require '../lib/project.coffee'
prompt  = require '../lib/prompt.coffee'
util    = require '../lib/util.coffee'

# Fixtures.
fixtures = {
  app       : require './fixtures/app.json'
  datalink  : require './fixtures/datalink.json'
  kinveyDlc : require './fixtures/kinvey-dlc.json'
}

# Test suite.
describe 'project', () ->
  # project.isConfigured()
  describe 'isConfigured', () ->
    beforeEach 'configure', () ->
      project.app = project.datalink = project.environment = '123'
    afterEach 'configure', () ->
      project.app = project.datalink = project.environment = null # Reset.

    # Tests.
    it 'should return true if the app, environment, and datalink were configured.', () ->
      expect(project.isConfigured()).to.be.true

    it 'should return false if the app was not configured.', () ->
      project.app = null
      expect(project.isConfigured()).to.be.false

    it 'should return false if the datalink was not configured.', () ->
      project.datalink = null
      expect(project.isConfigured()).to.be.false

    it 'should return false if the environment was not configured.', () ->
      project.environment = null
      expect(project.isConfigured()).to.be.false

  # project.restore()
  describe 'restore', () ->
    describe 'when the project file exists', () ->
      # Set a token.
      before 'configure', () -> this.app = this.datalink = this.environment = 123
      after  'configure', () ->
        delete this.app
        delete this.datalink
        delete this.environment

      # Stub util.readJSON().
      before 'stub', () ->
        sinon.stub(util, 'readJSON').callsArgWith 1, null, {
          app         : this.app
          datalink    : this.datalink
          environment : this.environment
        }
      afterEach 'stub', () -> util.readJSON.reset()
      after     'stub', () -> util.readJSON.restore()

      # Tests.
      it 'should set the project app, datalink, and environment.', (cb) ->
        project.restore (err) =>
          expect(util.readJSON).to.be.calledOnce
          expect(util.readJSON).to.be.calledWith config.paths.project
          expect(project.app).to.equal this.app
          expect(project.datalink).to.equal this.datalink
          expect(project.environment).to.equal this.environment
          cb err

    describe 'when the project file does not exists', () ->
      # Stub util.readJSON().
      before    'stub', () -> sinon.stub(util, 'readJSON').callsArgWith 1, null, { }
      afterEach 'stub', () -> util.readJSON.reset()
      after     'stub', () -> util.readJSON.restore()

      # Tests.
      it 'should fail.', (cb) ->
        project.restore (err) ->
          expect(err).to.exist
          expect(err.message).to.equal 'ProjectNotConfigured'
          cb()

  # project.save()
  describe 'save', () ->
    # Set app, datalink, and environment.
    before 'configure', () ->
      project.app = project.datalink = project.environment = '123'
    after 'configure', () ->
      project.app = project.datalink = project.environment = null # Reset.

    # Stub util.writeJSON().
    before    'stub', () -> sinon.stub(util, 'writeJSON').callsArg 2
    afterEach 'stub', () -> util.writeJSON.reset()
    after     'stub', () -> util.writeJSON.restore()

    # Tests.
    it 'should write the project to file.', (cb) ->
      project.save (err) ->
        expect(util.writeJSON).to.be.calledOnce
        expect(util.writeJSON).to.be.calledWith config.paths.project, {
          app         : project.app
          datalink    : project.datalink
          environment : project.environment
        }
        cb err

  # project.select()
  describe 'select', () ->
    afterEach 'configure', () ->
      project.app = project.datalink = project.environment = null # Reset.

    describe 'given the user has an app, environment, and eligible datalink', () ->
      # Stub project.save().
      before    'save', () -> sinon.stub(project, 'save').callsArg 0
      afterEach 'save', () -> project.save.reset()
      after     'save', () -> project.save.restore()

      # Stub prompt.getAppEnvironment().
      before 'getAppEnvironment', () ->
        stub = sinon.stub prompt, 'getAppEnvironment'
        stub.callsArgWith 1, null, fixtures.app, fixtures.app.environments[0]
      afterEach 'getAppEnvironment', () -> prompt.getAppEnvironment.reset()
      after     'getAppEnvironment', () -> prompt.getAppEnvironment.restore()

      # Stub prompt.getDatalink().
      before 'getDatalink', () ->
        stub = sinon.stub prompt, 'getDatalink'
        stub.callsArgWith 1, null, fixtures.kinveyDlc
      afterEach 'getDatalink', () -> prompt.getDatalink.reset()
      after     'getDatalink', () -> prompt.getDatalink.restore()

      # Mock the API.
      beforeEach 'api', () ->
        this.mocks = [
          api.get('/apps').reply 200, [ fixtures.app ]
          api.get('/apps/123/data-links').reply 200, [ fixtures.kinveyDlc ]
        ]
      afterEach 'api', () ->
        mock.done() for mock in this.mocks
        delete this.mocks

      # Tests.
      it 'should select the app, datalink, and environment to use.', (cb) ->
        project.select (err) ->
          expect(prompt.getAppEnvironment).to.be.calledOnce
          expect(prompt.getAppEnvironment).to.be.calledWith [ fixtures.app ]
          expect(prompt.getDatalink).to.be.calledOnce
          expect(prompt.getDatalink).to.be.calledWith [ fixtures.kinveyDlc ]
          cb err

      it 'should save the project.', (cb) ->
        project.select (err) ->
          expect(project.save).to.be.calledOnce
          cb err

    describe 'given the user has no apps, environments, or eligible datalinks', () ->
      # Mock the API.
      beforeEach 'api', () ->
        this.mock = api.get('/apps').reply 200, [ ]
      afterEach 'api', () ->
        this.mock.done()
        delete this.mock

      # Tests.
      it 'should fail.', (cb) ->
        project.select (err) ->
          expect(err).to.exist
          expect(err.message).to.equal 'NoAppsFound'
          cb()

    describe 'given no eligible datalinks', () ->
      # Stub prompt.getAppEnvironment().
      before 'stub', () ->
        stub = sinon.stub prompt, 'getAppEnvironment'
        stub.callsArgWith 1, null, { id: '123' }, { id: '456' }
      afterEach 'stub', () -> prompt.getAppEnvironment.reset()
      after     'stub', () -> prompt.getAppEnvironment.restore()

      # Mock the API.
      beforeEach 'api', () ->
        this.mocks = [
          api.get('/apps') # Return one app.
            .reply 200, [ fixtures.app ]
          api.get('/apps/123/data-links') # Return ineligible datalink.
            .reply 200, [ fixtures.datalink ]
        ]
      afterEach 'api', () ->
        mock.done() for mock in this.mocks
        delete this.mocks

      # Tests.
      it 'should fail.', (cb) ->
        project.select (err) ->
          expect(err).to.exist
          expect(err.message).to.equal 'NoDatalinksFound'
          cb()

  # project.setup()
  describe 'setup', () ->
    # Stub project.restore().
    before 'restore', () ->
      sinon.stub(project, 'restore').callsArgWith 0, new Error 'ProjectNotConfigured'
    afterEach 'restore', () -> project.restore.reset()
    after     'restore', () -> project.restore.restore()

    # Stub project.select().
    before    'select', () -> sinon.stub(project, 'select').callsArg 0
    afterEach 'select', () -> project.select.reset()
    after     'select', () -> project.select.restore()

    # Tests.
    it 'should restore the project.', (cb) ->
      project.setup { }, (err) ->
        expect(project.restore).to.be.calledOnce
        cb err

    # Tests.
    it 'should select the project if not configured.', (cb) ->
      project.setup { }, (err) ->
        expect(project.select).to.be.calledOnce
        cb err