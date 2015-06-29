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
cmd    = require '../cmd/config.coffee'
logger = require '../lib/logger.coffee'

# Test suite.
describe 'config', ->
  # Stub the logger.
  [ 'debug', 'info', 'warn', 'error' ].forEach (level) ->
    beforeEach "stub::#{level}", -> sinon.stub logger, level, () -> null
    afterEach  "stub::#{level}", -> logger[level].restore()

  # Options.
  describe '-e, --email <e-mail>', () ->
    it 'should set the e-mail address of the Kinvey account.'

  describe '--host <host>', () ->
    it 'should set the host of the Kinvey service.'

  describe '-p, --password <password>', () ->
    it 'should set the password of the Kinvey account.'

  describe '-s, --silent', () ->
    it 'should not output anything.'

  describe '-c, --suppress-version-check', () ->
    it 'should not check for package updates.'

  describe '-v, --verbose', () ->
    it 'should output debug messages.'

  # Tests.
  it 'should establish a user session.'
  it 'should establish a project file.'