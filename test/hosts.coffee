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
datalink  = require '../lib/datalink.coffee'
hosts     = require '../cmd/hosts.coffee'
logger   = require '../lib/logger.coffee'
pkg      = require '../package.json'
project  = require '../lib/project.coffee'
user     = require '../lib/user.coffee'

# Test suite.
describe "./#{pkg.name} hosts", () ->
# Stub user.setup().
  before    'user', () -> sinon.stub(user, 'setup').callsArg 1
  afterEach 'user', () -> user.setup.reset()
  after     'user', () -> user.setup.restore()

  # Stub project.restore().
  before    'restore', () -> sinon.stub(project, 'restore').callsArg 0
  afterEach 'restore', () -> project.restore.reset()
  after     'restore', () -> project.restore.restore()

  # Stub datalink.list().
  before    'datalink', () -> sinon.stub(datalink, 'listLogHosts').callsArg 0
  afterEach 'datalink', () -> datalink.listLogHosts.reset()
  after     'datalink', () -> datalink.listLogHosts.restore()

  # Tests.
  it 'should setup the user.', (cb) ->
    hosts.call command, (err) ->
      expect(user.setup).to.be.calledOnce
      cb err

  it 'should restore the project.', (cb) ->
    hosts.call command, (err) ->
      expect(project.restore).to.be.calledOnce
      cb err

  it 'should list the Kiney DLC hosts.', (cb) ->
    hosts.call command, (err) ->
      expect(datalink.listLogHosts).to.be.calledOnce
      cb err