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
datalink = require '../lib/datalink.coffee'
logger   = require '../lib/logger.coffee'
pkg      = require '../package.json'
project  = require '../lib/project.coffee'
job      = require '../cmd/job.coffee'
user     = require '../lib/user.coffee'

# Test suite.
describe "./#{pkg.name} job", () ->
  # Configure.
  before 'configure', () ->
    project.app = project.datalink = '123'
    project.schemaVersion = 1
  after  'configure', () ->
  project.app = project.datalink = project.schemaVersion = null # Reset.

  # Stub user.setup().
  before    'user', () -> sinon.stub(user, 'setup').callsArg 1
  afterEach 'user', () -> user.setup.reset()
  after     'user', () -> user.setup.restore()

  # Stub project.restore().
  before    'project', () -> sinon.stub(project, 'restore').callsArg 0
  afterEach 'project', () -> project.restore.reset()
  after     'project', () -> project.restore.restore()

  # Stub datalink.jobStatus().
  before    'datalink', () -> sinon.stub(datalink, 'jobStatus').callsArg 1
  afterEach 'datalink', () -> datalink.jobStatus.reset()
  after     'datalink', () -> datalink.jobStatus.restore()

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
      expect(datalink.jobStatus).to.be.calledOnce
      expect(datalink.jobStatus).to.be.calledWith jobId
      cb err