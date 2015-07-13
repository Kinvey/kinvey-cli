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
sinon = require 'sinon'

# Local modules.
command = require './fixtures/command.coffee'
config  = require '../cmd/config.coffee'
pkg     = require '../package.json'
project = require '../lib/project.coffee'
user    = require '../lib/user.coffee'

# Test suite.
describe "./#{pkg.name} config", () ->
  # Stub user.setup().
  before    'user', () -> sinon.stub(user, 'setup').callsArg 1
  afterEach 'user', () -> user.setup.reset()
  after     'user', () -> user.setup.restore()

  # Stub project.setup().
  before    'project', () -> sinon.stub(project, 'setup').callsArg 1
  afterEach 'project', () -> project.setup.reset()
  after     'project', () -> project.setup.restore()

  # Tests.
  it 'should setup the user.', (cb) ->
    config.call command, (err) ->
      expect(user.setup).to.be.calledOnce
      cb err

  it 'should setup the project.', (cb) ->
    config.call command, (err) ->
      expect(project.setup).to.be.calledOnce
      cb err