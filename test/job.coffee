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
sinon = require 'sinon'

# Local modules.
command  = require './fixtures/command.coffee'
service = require '../lib/service.coffee'
logger   = require '../lib/logger.coffee'
pkg      = require '../package.json'
project  = require '../lib/project.coffee'
job      = require '../cmd/job.js'
user     = require '../lib/user.coffee'

# Test suite.
describe "./#{pkg.name} job", () ->
  # Configure.
  before 'configure', () ->
    project.app = project.service = '123'
    project.schemaVersion = 1
    project.lastJobId = 'abcdef'
  after  'configure', () ->
  project.app = project.service = project.schemaVersion = null # Reset.

  # Stub user.setup().
  before    'user', () -> sinon.stub(user, 'setup').callsArg 1
  afterEach 'user', () -> user.setup.reset()
  after     'user', () -> user.setup.restore()

  # Stub project.restore().
  before    'project', () -> sinon.stub(project, 'restore').callsArg 0
  afterEach 'project', () -> project.restore.reset()
  after     'project', () -> project.restore.restore()

  # Stub service.jobStatus().
  before    'service', () -> sinon.stub(service, 'jobStatus').callsArg 1
  afterEach 'service', () -> service.jobStatus.reset()
  after     'service', () -> service.jobStatus.restore()

  # Tests.
  it 'should setup the user.', (cb) ->
    job '123', command, (err) ->
      expect(user.setup).to.be.calledOnce
      cb err

  it 'should restore the project.', (cb) ->
    job '123', command, (err) ->
      expect(project.restore).to.be.calledOnce
      cb err

  it 'should print the current job status.', (cb) ->
    jobId = '123'
    job jobId, command, (err) ->
      expect(service.jobStatus).to.be.calledOnce
      expect(service.jobStatus).to.be.calledWith jobId
      cb err

  it 'should print the current job status when called without an id.', (cb) ->
    job null, command, (err) ->
      expect(service.jobStatus).to.be.calledOnce
      expect(service.jobStatus).to.be.calledWith null
      cb err
