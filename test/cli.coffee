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
cli     = require '../bin/cli.coffee'
pkg     = require '../package.json'
request = require '../lib/request.coffee'

# Test suite.
describe.skip pkg.name, ->
  # Test options.
  describe '-e, --email <e-mail>', () ->
    it 'should set the e-mail address of the Kinvey account.', () ->
      cli [ 'node', pkg.name, 'config', '--email', 'bob@example.com' ]

  describe '--host <host>', () ->
    before    'stub', -> sinon.stub request, 'defaults'
    afterEach 'stub', -> request.defaults.reset()
    after     'stub', -> request.defaults.restore()

    it 'should set the host of the Kinvey service.', ->
      cli [ 'node', pkg.name, 'config', '--host', 'example.com' ]

  describe '-p, --password <password>', () ->
    it 'should set the password of the Kinvey account.', ->
      cli [ 'node', pkg.name, 'config', '--password', '123' ]

  describe '-s, --silent', () ->
    it 'should not output anything.', ->
      cli [ 'node', pkg.name, 'config', '--silent' ]

  describe '-c, --suppress-version-check', () ->
    it 'should not check for package updates.', ->
      cli [ 'node', pkg.name, 'config', '--suppress-version-check' ]

  describe '-v, --verbose', () ->
    it 'should output debug messages.', ->
      cli [ 'node', pkg.name, 'config', '--verbose' ]