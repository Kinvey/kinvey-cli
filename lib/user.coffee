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
async  = require 'async'
chalk  = require 'chalk'
config = require 'config'

# Local modules.
KinveyError = require './error.coffee'
logger  = require './logger.coffee'
prompt  = require './prompt.coffee'
request = require './request.coffee'
util    = require './util.coffee'

# Define the user class.
class User

  # Session token.
  token: null

  # Constructor.
  constructor: (path) ->
    this.userPath = path

  # Returns whether the user is logged in.
  isLoggedIn: () =>
    this.token?

  # Ensures to login the user.
  login: (email, password, cb) =>
    async.doUntil (next) =>
      this._loginOnce email, password, next
      email = password = undefined # Reset.
    , this.isLoggedIn, cb

  # Restores the session from file.
  restore: (cb) =>
    logger.debug 'Restoring session from file %s', chalk.cyan this.userPath
    util.readJSON this.userPath, (err, data) =>
      if data?.token # Save token.
        logger.debug 'Restored session from file %s', chalk.cyan this.userPath
        this.token = data.token
        cb() # Continue.
      else # No token, prompt for login.
        logger.debug 'Failed to restore session from file %s', chalk.cyan this.userPath
        async.series [
          (next) => this.login undefined, undefined, next
          this.save
        ], (err) -> cb err # Continue.

  # Saves the session to file.
  save: (cb) =>
    logger.debug 'Saving session to file %s', chalk.cyan this.userPath
    util.writeJSON this.userPath, { token: this.token }, cb

  # Sets up the user.
  setup: (options, cb) =>
    if options.email? or options.password? # Custom session.
      this.login options.email, options.password, cb
    else # Attempt to restore session from file.
      this.restore cb

  # Executes a login request.
  _execLogin: (email, password, cb) ->
    request.post {
      url  : '/v2/session',
      json : { email: email, password: password }
    }, cb

  # Attempts to login with the provided email and password.
  _loginOnce: (email, password, cb) ->
    async.waterfall [
      (next) -> prompt.getEmailPassword email, password, next
      this._execLogin
    ], (err, response) =>
      if err? then cb err # Continue with request error.
      else if 200 is response.statusCode
        logger.info 'Welcome back %s', chalk.cyan response.body.email
        this.token = response.body.token # Save token.
        cb() # Continue.
      else if response.body?.code in [ 'InvalidCredentials', 'ValidationError' ]
        logger.warn 'Invalid credentials, please try again.'
        cb() # Continue.
      else # Continue with error.
        cb new KinveyError response.body.code, response.body.description

# Exports.
module.exports = new User config.paths.session