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
logs     = require '../cmd/logs.coffee'
pkg      = require '../package.json'
project  = require '../lib/project.coffee'
user     = require '../lib/user.coffee'

# Test suite.
describe "./#{pkg.name} logs", () ->
# Stub user.setup().
  before    'user', () -> sinon.stub(user, 'setup').callsArg 1
  afterEach 'user', () -> user.setup.reset()
  after     'user', () -> user.setup.restore()

  # Stub project.restore().
  before    'project', () -> sinon.stub(project, 'restore').callsArg 0
  afterEach 'project', () -> project.restore.reset()
  after     'project', () -> project.restore.restore()

  # Stub service.listLogHosts().
  before    'getAndSetLogRequestParams', () -> sinon.stub(service, 'getAndSetLogRequestParams').callsArg 0
  afterEach 'getAndSetLogRequestParams', () -> service.getAndSetLogRequestParams.reset()
  after     'getAndSetLogRequestParams', () -> service.getAndSetLogRequestParams.restore()

  # Stub service.logs().
  before    'logs', () -> sinon.stub(service, 'logs').callsArg 0
  afterEach 'logs', () -> service.logs.reset()
  after     'logs', () -> service.logs.restore()

  # Tests.
  it 'should setup the user.', (cb) ->
    logs.call command, (err) ->
      expect(user.setup).to.be.calledOnce
      cb err

  it 'should restore the project.', (cb) ->
    logs.call command, (err) ->
      expect(project.restore).to.be.calledOnce
      cb err

  it 'should gather log query input params.', (cb) ->
    logs.call command, (err) ->
      expect(service.getAndSetLogRequestParams).to.be.calledOnce
      cb err

  it 'should retrieve log entries based on query', (cb) ->
    logs.call command, (err) ->
      expect(service.logs).to.be.calledOnce
      cb err