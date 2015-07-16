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
config         = require 'config'
program        = require 'commander'
sinon          = require 'sinon'
updateNotifier = require('update-notifier').UpdateNotifier

# Local modules.
cli     = require '../bin/cli.coffee'
init    = require '../lib/init.coffee'
logger  = require '../lib/logger.coffee'
pkg     = require '../package.json'
request = require '../lib/request.coffee'

# Test suite.
describe "./#{pkg.name}", () ->
  # Register a synchronous test command.
  before 'command', () -> program.command('test').action init

  # Restore state.
  after 'command', () ->
    logger.config { level: 3 }
    request.defaults { baseUrl: config.host }

  # Stub logger.config().
  before    'stub', () -> sinon.stub logger, 'config'
  afterEach 'stub', () -> logger.config.reset()
  after     'stub', () -> logger.config.restore()

  # Test global options.
  describe '--host <host>', () ->
    # Stub request.defaults().
    before    'stub', () -> sinon.stub request, 'defaults'
    afterEach 'stub', () -> request.defaults.reset()
    after     'stub', () -> request.defaults.restore()

    it 'should set the host of the Kinvey service.', () ->
      cli [ 'node', pkg.name, 'test', '--host', 'example.com' ]
      expect(request.defaults).to.be.calledOnce
      expect(request.defaults).to.be.calledWith { baseUrl: 'https://example.com' }

  describe '-s, --silent', () ->
    it 'should not output anything.', () ->
      cli [ 'node', pkg.name, 'test', '--silent' ]
      expect(logger.config).to.be.calledWith { level: 3 }

  describe '-c, --suppress-version-check', () ->
    # Stub updateNotifier.notify().
    before    'stub', () -> sinon.stub updateNotifier.prototype, 'notify'
    afterEach 'stub', () -> updateNotifier.prototype.notify.reset()
    after     'stub', () -> updateNotifier.prototype.notify.restore()

    it 'should not check for package updates.', () ->
      cli [ 'node', pkg.name, 'test', '--suppress-version-check' ]
      expect(updateNotifier.prototype.notify).not.to.be.called

  describe '-v, --verbose', () ->
    it 'should output debug messages.', () ->
      cli [ 'node', pkg.name, 'test', '--verbose' ]
      expect(logger.config).to.be.calledWith { level: 0 }