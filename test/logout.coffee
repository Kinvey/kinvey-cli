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
command = require './fixtures/command.coffee'
logout  = require '../cmd/logout.js'
pkg     = require '../package.json'
project = require '../lib/project.js'
user    = require '../lib/user.js'

# Test suite.
describe "./#{pkg.name} logout", () ->
  # Stub user.setup().
  before    'user', () -> sinon.stub(user, 'logout').callsArg 0
  afterEach 'user', () -> user.logout.reset()
  after     'user', () -> user.logout.restore()

  # Stub project.logout().
  before    'project', () -> sinon.stub(project, 'logout').callsArg 0
  afterEach 'project', () -> project.logout.reset()
  after     'project', () -> project.logout.restore()

  # Tests.
  it 'should logout the user.', (cb) ->
    logout.call command, command, (err) ->
      expect(user.logout).to.be.calledOnce
      cb err

  it 'should logout the project.', (cb) ->
    logout.call command, command, (err) ->
      expect(project.logout).to.be.calledOnce
      cb err
