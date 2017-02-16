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

# Package modules.
config   = require 'config'

# Local modules.
api     = require './lib/api.coffee'
logger  = require '../lib/logger.js'
project = require '../lib/project.js'
prompt  = require '../lib/prompt.js'
user    = require '../lib/user.coffee'
util    = require '../lib/util.coffee'
uuid    = require 'uuid'

# Fixtures.
fixtures =
  app       : require './fixtures/app.json'
  datalink  : require './fixtures/datalink.json'
  kinveyDlc : require './fixtures/kinvey-dlc.json'
  org       : require './fixtures/org.json'

# Test suite.
describe 'project', () ->
  # project.isConfigured()
  describe 'isConfigured', () ->
    beforeEach 'configure', () ->
      project.service = '123'
      project.schemaVersion = 2
    afterEach 'configure', () ->
      project.app = project.service = project.schemaVersion = null # Reset.

    # Tests.
    it 'should return true if the app and service were configured.', () ->
      expect(project.isConfigured()).to.be.true

    it 'should return false if the service was not configured.', () ->
      project.service = null
      expect(project.isConfigured()).to.be.false

    it 'should return false if the schema was not configured.', () ->
      project.schemaVersion = null
      expect(project.isConfigured()).to.be.false

  # project.list().
  describe 'list', () ->
    # Configure.
    beforeEach 'configure', () -> project.app = project.service = '123'
    afterEach  'configure', () -> project.app = project.service = null # Reset.

    # Stub.
    before    'stub', -> sinon.stub logger, 'info'
    afterEach 'stub', -> logger.info.reset()
    after     'stub', -> logger.info.restore()

    describe 'for v2 apps', ->
      # Configure.
      beforeEach 'configure', () -> project.schemaVersion = 2
      afterEach  'configure', () -> project.schemaVersion = null # Reset.

      # Mock the API.
      beforeEach 'api', () ->
        this.mock = api.get('/v2/apps/123/data-links')
          .reply 200, [ ]
      afterEach 'api', () ->
        this.mock.done()
        delete this.mock

      # Tests.
      it 'should list all Kinvey datalinks.', (cb) ->
        project.list (err) ->
          expect(logger.info).to.be.called
          expect(logger.info).to.be.calledWith 'The service used in this project is marked with *'
          cb err

  # project.logout().
  describe 'logout', () ->
    # Configure.
    beforeEach 'configure', () -> project.app = project.service = '123'
    afterEach  'configure', () -> project.app = project.service = null # Reset.

    # Stub.
    before    'stub', -> sinon.stub logger, 'info'
    afterEach 'stub', -> logger.info.reset()
    after     'stub', -> logger.info.restore()

    describe 'for v2 apps', ->
      # Configure.
      beforeEach 'configure', () -> project.schemaVersion = 2
      afterEach  'configure', () -> project.schemaVersion = null # Reset.

      # Tests.
      it 'should log out the user', (cb) ->
        project.logout (err) ->
          expect(logger.info).to.be.calledOnce
          cb err

  # project.restore()
  describe 'restore', () ->
    describe 'when the project file exists', () ->
      # Set app, service, and schema.
      before 'configure', () ->
        this.app = this.service = 123
        this.schemaVersion = 2
      after  'configure', () ->
        delete this.app
        delete this.service
        delete this.schemaVersion

      # Stub util.readJSON().
      before 'stub', () ->
        sinon.stub(util, 'readJSON').callsArgWith 1, null, {
          service       : this.service
          schemaVersion : this.schemaVersion
        }
      afterEach 'stub', () -> util.readJSON.reset()
      after     'stub', () -> util.readJSON.restore()

      # Tests.
      it 'should set the project app, service, and schema.', (cb) ->
        project.restore (err) =>
          expect(util.readJSON).to.be.calledOnce
          expect(util.readJSON).to.be.calledWith config.paths.project
          expect(project.service).to.equal this.service
          expect(project.schemaVersion).to.equal this.schemaVersion
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
          expect(err.name).to.equal 'ProjectNotConfigured'
          cb()

  # project.save()
  describe 'save', () ->
    describe 'with an app', () ->
      # Set app, service, and schema.
      before 'configure', () ->
        project.app = project.service = project.serviceName = uuid.v4()
        project.schemaVersion = 1
      after 'configure', () ->
        project.app = project.service = project.schemaVersion = null # Reset.

      # Stub util.writeJSON().
      before    'stub', () -> sinon.stub(util, 'writeJSON').callsArg 2
      afterEach 'stub', () -> util.writeJSON.reset()
      after     'stub', () -> util.writeJSON.restore()

      # Tests.
      it 'should write the project to file.', (cb) ->
        project.save (err) ->
          expect(util.writeJSON).to.be.calledOnce
          expect(util.writeJSON).to.be.calledWith config.paths.project, {
            app           : project.app
            lastJobId     : undefined
            org           : undefined
            schemaVersion : project.schemaVersion
            service       : project.service
            serviceName   : project.serviceName
          }
          expect(project.org).to.be.undefined
          cb err

    describe 'with an org', () ->
      # Set app, service, and schema.
      before 'configure', () ->
        project.org = project.service = project.serviceName = uuid.v4()
        project.schemaVersion = 1
      after 'configure', () ->
        project.org = project.service = project.schemaVersion = null # Reset.

      # Stub util.writeJSON().
      before    'stub', () -> sinon.stub(util, 'writeJSON').callsArg 2
      afterEach 'stub', () -> util.writeJSON.reset()
      after     'stub', () -> util.writeJSON.restore()

      # Tests.
      it 'should write the project to file.', (cb) ->
        project.save (err) ->
          expect(util.writeJSON).to.be.calledOnce
          expect(util.writeJSON).to.be.calledWith config.paths.project, {
            app           : null
            lastJobId     : undefined
            org           : project.org
            schemaVersion : project.schemaVersion
            service       : project.service
            serviceName   : project.serviceName
          }
          expect(project.app).to.be.null
          cb err

  # project.select()
  describe 'select', () ->
    afterEach 'configure', () ->
      project.app = project.service = project.schemaVersion = null # Reset.

    describe 'given invalid credentials', () ->
      # Stub user.refresh().
      before    'refresh', () -> sinon.stub(user, 'refresh').callsArg 0
      afterEach 'refresh', () -> user.refresh.reset()
      after     'refresh', () -> user.refresh.restore()

      # Stub prompt.getAppOrOrg().
      before 'getApp', () ->
        stub = sinon.stub prompt, 'getAppOrOrg'
        stub.callsArgWith 1, null, { name: 'App' }
      afterEach 'getApp', () -> prompt.getAppOrOrg.reset()
      after     'getApp', () -> prompt.getAppOrOrg.restore()

      # Mock the API.
      beforeEach 'api', () ->
        this.mocks = [
          api.get('/apps').reply 401, { code: 'InvalidCredentials' }
          api.get('/apps').reply 200, [ ]
        ]
      afterEach 'api', () ->
        mock.done() for mock in this.mocks
        delete this.mocks

      it 'should retry.', (cb) ->
        project.select (err) ->
          expect(user.refresh).to.be.calledOnce

          # The user should be authenticated, but without having any apps.
          expect(err).to.have.property 'name', 'NoAppsFound'
          cb()

    describe 'given the user has an app or org and eligible service', () ->
      # Stub project.save().
      before    'save', () -> sinon.stub(project, 'save').callsArg 0
      afterEach 'save', () -> project.save.reset()
      after     'save', () -> project.save.restore()

      # Stub prompt.getService().
      before 'getService', () ->
        stub = sinon.stub prompt, 'getService'
        stub.callsArgWith 1, null, fixtures.kinveyDlc
      afterEach 'getService', () -> prompt.getService.reset()
      after     'getService', () -> prompt.getService.restore()

      describe 'for apps', () ->
        # Stub prompt.getAppOrOrg().
        before 'getApp', () ->
          stub = sinon.stub prompt, 'getAppOrOrg'
          stub.callsArgWith 1, null, { name: 'App' }
        afterEach 'getApp', () -> prompt.getAppOrOrg.reset()
        after     'getApp', () -> prompt.getAppOrOrg.restore()

        # Stub prompt.getApp().
        before 'getApp', () ->
          stub = sinon.stub prompt, 'getApp'
          stub.callsArgWith 1, null, fixtures.app
        afterEach 'getApp', () -> prompt.getApp.reset()
        after     'getApp', () -> prompt.getApp.restore()

        # Mock the API.
        beforeEach 'api', () ->
          this.mocks = [
            api.get('/apps').reply 200, [ fixtures.app ]
            api.get('/v2/apps/123/data-links').reply 200, [ fixtures.kinveyDlc ]
          ]
        afterEach 'api', () ->
          mock.done() for mock in this.mocks
          delete this.mocks

        # Tests.
        it 'should select the app and service to use.', (cb) ->
          project.select (err) ->
            expect(prompt.getApp).to.be.calledOnce
            expect(prompt.getApp).to.be.calledWith [ fixtures.app ]
            expect(prompt.getService).to.be.calledOnce
            expect(prompt.getService).to.be.calledWith [ fixtures.kinveyDlc ]
            cb err

        it 'should save the project.', (cb) ->
          project.select (err) ->
            expect(project.save).to.be.calledOnce
            cb err

      describe 'for orgs', () ->
        before 'config', () -> project.org = fixtures.org.name
        after 'config', () -> delete project.org

        # Stub prompt.getAppOrOrg().
        before 'getAppOrOrg', () ->
          stub = sinon.stub prompt, 'getAppOrOrg'
          stub.callsArgWith 1, null, { name: 'Organization' }
        afterEach 'getApp', () -> prompt.getAppOrOrg.reset()
        after     'getApp', () -> prompt.getAppOrOrg.restore()

        # Stub prompt.getApp().
        before 'getOrg', () ->
          stub = sinon.stub prompt, 'getOrg'
          stub.callsArgWith 1, null, fixtures.org
        afterEach 'getOrg', () -> prompt.getOrg.reset()
        after     'getOrg', () -> prompt.getOrg.restore()

        # Mock the API.
        beforeEach 'api', () ->
          this.mocks = [
            api.get('/organizations').reply 200, [ fixtures.org ]
            api.get('/v2/organizations/123/data-links').reply 200, [ fixtures.kinveyDlc ]
          ]
        afterEach 'api', () ->
          mock.done() for mock in this.mocks
          delete this.mocks

        # Tests.
        it 'should select the org and service to use.', (cb) ->
          project.select (err) ->
            expect(prompt.getOrg).to.be.calledOnce
            expect(prompt.getOrg).to.be.calledWith [ fixtures.org ]
            expect(prompt.getService).to.be.calledOnce
            expect(prompt.getService).to.be.calledWith [ fixtures.kinveyDlc ]
            cb err

        it 'should save the project.', (cb) ->
          project.select (err) ->
            expect(project.save).to.be.calledOnce
            cb err

    describe 'given the user has no apps or eligible datalinks', () ->
      # Stub prompt.getAppOrOrg().
      before 'getApp', () ->
        stub = sinon.stub prompt, 'getAppOrOrg'
        stub.callsArgWith 1, null, { name: 'App' }
      afterEach 'getApp', () -> prompt.getAppOrOrg.reset()
      after     'getApp', () -> prompt.getAppOrOrg.restore()

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
          expect(err.name).to.equal 'NoAppsFound'
          cb()

    describe 'given no eligible datalinks', () ->
      # Stub prompt.getAppOrOrg().
      before 'getApp', () ->
        stub = sinon.stub prompt, 'getAppOrOrg'
        stub.callsArgWith 1, null, { name: 'App' }
      afterEach 'getApp', () -> prompt.getAppOrOrg.reset()
      after     'getApp', () -> prompt.getAppOrOrg.restore()

      # Stub prompt.getApp().
      before 'stub', () ->
        stub = sinon.stub prompt, 'getApp'
        stub.callsArgWith 1, null, { id: '123' }, { id: '456' }
      afterEach 'stub', () -> prompt.getApp.reset()
      after     'stub', () -> prompt.getApp.restore()

      # Mock the API.
      beforeEach 'api', () ->
        this.mocks = [
          api.get('/apps') # Return one app.
            .reply 200, [ fixtures.app ]
          api.get('/v2/apps/123/data-links') # Return ineligible datalink.
            .reply 200, [ fixtures.datalink ]
        ]
      afterEach 'api', () ->
        mock.done() for mock in this.mocks
        delete this.mocks

      # Tests.
      it 'should fail.', (cb) ->
        project.select (err) ->
          expect(err).to.exist
          expect(err.name).to.equal 'NoFlexServicesFound'
          cb()

  # project.setup()
  describe 'setup', () ->
    describe 'when the project is not configured', () ->
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

    describe 'when the project can not be properly restored', () ->
      # Stub project.restore().
      before 'restore', () ->
        sinon.stub(project, 'restore').callsArgWith 0, new Error 'ProjectRestoreError'
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