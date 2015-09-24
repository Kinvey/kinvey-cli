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
config   = require 'config'

# Imports.
api     = require './lib/api.coffee'
prompt  = require '../lib/prompt.coffee'
user    = require '../lib/user.coffee'
util    = require '../lib/util.coffee'

# Test suite.
describe 'user', () ->
  # user.isLoggedIn()
  describe 'isLoggedIn', () ->
    # Tests.
    it 'should return true if the token was set.', () ->
      user.token = 123
      expect(user.isLoggedIn()).to.be.true
    it 'should return false if the token was not set.', () ->
      user.token = null
      expect(user.isLoggedIn()).to.be.false

  # user.login()
  describe 'login', () ->
    beforeEach 'token', () -> user.token = null # Reset.

    # Set a token.
    before 'token', () -> this.token = '123'
    after  'token', () -> delete this.token

    # Set credentials.
    before 'email',    () -> this.email    = 'bob@example.com'
    before 'password', () -> this.password = 'test123'
    after  'email',    () -> delete this.email
    after  'password', () -> delete this.password

    # Tests.
    describe 'given valid credentials', () ->
      # Mock the API.
      beforeEach 'api', () ->
        this.mock = api.post('/session').reply 200, { email: this.email, token: this.token }
      afterEach 'api', () ->
        this.mock.done()
        delete this.mock

      # Tests.
      it 'should login.', (cb) ->
        user.login this.email, this.password, (err) =>
          expect(user.isLoggedIn()).to.be.true
          expect(user.token).to.equal this.token
          cb err

    describe 'given invalid credentials', () ->
      # Mock the API.
      beforeEach 'api', () ->
        this.mock = api
          .post('/session').reply 401, { code: 'InvalidCredentials', description: '' } # First call.
          .post('/session').reply 200, { email: this.email, token: this.token } # Second call.
      afterEach 'api', () ->
        this.mock.done()
        delete this.mock

      # Stub prompt.getEmailPassword()
      before    'stub', () ->
        stub = sinon.stub prompt, 'getEmailPassword'
        stub.callsArgWith 2, null, this.email, this.password
      afterEach 'stub', () -> prompt.getEmailPassword.reset()
      after     'stub', () -> prompt.getEmailPassword.restore()

      # Tests.
      it 'should retry.', (cb) ->
        user.login 'alice@example.com', this.password, (err) ->
          expect(prompt.getEmailPassword).to.be.calledTwice
          expect(prompt.getEmailPassword).to.be.calledWith undefined, undefined # Prompt on second time.
          cb err

    describe 'given incomplete credentials', () ->
      # Mock the API.
      beforeEach 'api', () ->
        this.mock = api.post('/session').reply 200, { email: this.email, token: this.token }
      afterEach 'api', () ->
        this.mock.done()
        delete this.mock

      # Stub prompt.getEmailPassword()
      before    'stub', () ->
        stub = sinon.stub prompt, 'getEmailPassword'
        stub.callsArgWith 2, null, this.email, this.password
      afterEach 'stub', () -> prompt.getEmailPassword.reset()
      after     'stub', () -> prompt.getEmailPassword.restore()

      it 'should prompt.', (cb) ->
        user.login undefined, this.password, (err) =>
          expect(prompt.getEmailPassword).to.be.calledOnce
          expect(prompt.getEmailPassword).to.be.calledWith undefined, this.password
          cb err

  # user.refresh()
  describe 'refresh', ->
    # Set a token.
    before 'token', () -> this.token = '123'
    after  'token', () -> delete this.token

    # Stub user.login().
    before    'login', () -> sinon.stub(user, 'login').callsArg 2
    afterEach 'login', () -> user.login.reset()
    after     'login', () -> user.login.restore()

    # Stub user.save().
    before    'save', () -> sinon.stub(user, 'save').callsArg 0
    afterEach 'save', () -> user.save.reset()
    after     'save', () -> user.save.restore()

    # Tests.
    it 'should login.', (cb) ->
      user.refresh (err) ->
        expect(user.login).to.be.calledOnce
        expect(user.login).to.be.calledWith undefined, undefined
        expect(user.token).to.be.null
        cb err

    it 'should save.', (cb) ->
      user.refresh (err) ->
        expect(user.save).to.be.calledOnce
        cb err

  # user.restore()
  describe 'restore', () ->
    beforeEach 'token', () -> user.token = null # Reset.

    describe 'when the session file exists', () ->
      # Set a token.
      before 'token', () -> this.token = '123'
      after  'token', () -> delete this.token

      # Stub util.readJSON().
      before 'stub', () ->
        sinon.stub(util, 'readJSON').callsArgWith 1, null, { token: this.token }
      afterEach 'stub', () -> util.readJSON.reset()
      after     'stub', () -> util.readJSON.restore()

      # Tests.
      it 'should set the user token.', (cb) ->
        user.restore (err) =>
          expect(util.readJSON).to.be.calledOnce
          expect(util.readJSON).to.be.calledWith config.paths.session
          expect(user.token).to.equal this.token
          cb err

    describe 'when the session file does not exist', () ->
      # Stub user.login().
      before    'login', () -> sinon.stub(user, 'login').callsArg 2
      afterEach 'login', () -> user.login.reset()
      after     'login', () -> user.login.restore()

      # Stub util.readJSON().
      before    'readJSON', () -> sinon.stub(util, 'readJSON').callsArgWith 1, null, { }
      afterEach 'readJSON', () -> util.readJSON.reset()
      after     'readJSON', () -> util.readJSON.restore()

      # Tests.
      it 'should login.', (cb) ->
        user.restore (err) ->
          expect(user.login).to.be.calledOnce
          expect(user.login).to.be.calledWith undefined, undefined
          expect(user.token).to.be.null
          cb err

  # user.save()
  describe 'save', () ->
    # Set user token.
    before 'token', () -> user.token = '123'
    after  'token', () -> user.token = null # Reset.

    # Stub util.writeJSON().
    before    'stub', () -> sinon.stub(util, 'writeJSON').callsArg 2
    afterEach 'stub', () -> util.writeJSON.reset()
    after     'stub', () -> util.writeJSON.restore()

    # Tests.
    it 'should write the token to file.', (cb) ->
      user.save (err) ->
        expect(util.writeJSON).to.be.calledOnce
        expect(util.writeJSON).to.be.calledWith config.paths.session, { token: user.token }
        cb err

  # user.setup()
  describe 'setup', () ->
    # Stub user.login().
    before    'login', () -> sinon.stub(user, 'login').callsArg 2
    afterEach 'login', () -> user.login.reset()
    after     'login', () -> user.login.restore()

    # Stub user.restore().
    before    'restore', () -> sinon.stub(user, 'restore').callsArg 0
    afterEach 'restore', () -> user.restore.reset()
    after     'restore', () -> user.restore.restore()

    # Tests.
    it 'should restore the user session.', (cb) ->
      user.setup { }, (err) ->
        expect(user.restore).to.be.calledOnce
        cb err

    it 'should login given email.', (cb) ->
      options = { email: 'bob@example.com' }
      user.setup options, (err) ->
        expect(user.login).to.be.calledOnce
        expect(user.login).to.be.calledWith options.email, undefined
        cb err

    it 'should login given password.', (cb) ->
      options = { password: 'test123' }
      user.setup options, (err) ->
        expect(user.login).to.be.calledOnce
        expect(user.login).to.be.calledWith undefined, options.password
        cb err

    it 'should login given email and password.', (cb) ->
      options = { email: 'bob@example.com', password: 'test123' }
      user.setup options, (err) ->
        expect(user.login).to.be.calledOnce
        expect(user.login).to.be.calledWith options.email, options.password
        cb err