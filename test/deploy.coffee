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
deploy   = require '../cmd/deploy.js'
pkg      = require '../package.json'
project  = require '../lib/project.js'
user     = require '../lib/user.coffee'

# Test suite.
describe "./#{pkg.name} deploy", () ->
  # Stub user.setup().
  before    'user', () -> sinon.stub(user, 'setup').callsArg 1
  afterEach 'user', () -> user.setup.reset()
  after     'user', () -> user.setup.restore()

  # Stub project.restore().
  before    'project', () -> sinon.stub(project, 'restore').callsArg 0
  afterEach 'project', () -> project.restore.reset()
  after     'project', () -> project.restore.restore()

  # Stub service.validate().
  before    'validate', () -> sinon.stub(service, 'validate').callsArg 1
  afterEach 'validate', () -> service.validate.reset()
  after     'validate', () -> service.validate.restore()

  # Stub service.deploy().
  before    'deploy', () -> sinon.stub(service, 'deploy').callsArg 1
  afterEach 'deploy', () -> service.deploy.reset()
  after     'deploy', () -> service.deploy.restore()

  # Tests.
  it 'should setup the user.', (cb) ->
    deploy.call command, command, (err) ->
      expect(user.setup).to.be.calledOnce
      cb err

  it 'should restore the project.', (cb) ->
    deploy.call command, command, (err) ->
      expect(project.restore).to.be.calledOnce
      cb err

  it 'should validate the service.', (cb) ->
    deploy.call command, command, (err) ->
      expect(service.validate).to.be.calledOnce
      cb err

  it 'should deploy the service.', (cb) ->
    deploy.call command, command, (err) ->
      expect(service.deploy).to.be.calledOnce
      cb err