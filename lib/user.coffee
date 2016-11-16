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
async  = require 'async'
chalk  = require 'chalk'
config = require 'config'

# Local modules.
logger  = require './logger.coffee'
prompt  = require './prompt.coffee'
request = require './request.coffee'
util    = require './util.coffee'

# Define the user class.
class User

  # Session token.
  token: null
  tokens: {}
  host: null

  # Constructor.
  constructor: (path) ->
    this.userPath = path

  # Returns whether the user is logged in.
  isLoggedIn: () =>
    if this.host? then return this.tokens?[this.host]?
    this.token?

  getToken: () =>
    if this.host? then return this.tokens?[this.host]
    this.token

  # Ensures to login the user.
  login: (email, password, cb) =>
    async.doUntil (next) =>
      this._loginOnce email, password, next
      email = password = undefined # Reset.
    , this.isLoggedIn, cb

  # Soft logout (doesn't clear session data server-side)
  logout: (cb) =>
    logger.debug 'Clearing session data from file %s', chalk.cyan this.userPath
    util.writeJSON this.userPath, '', cb

  # Refreshes the user token.
  refresh: (cb) =>
    if this.tokens? and this.host? then this.tokens[this.host] = null # Reset.
    this.token = null
    async.series [
      (next) => this.login undefined, undefined, next
      this.save
    ], (err) -> cb err # Continue.

  # Restores the session from file.
  restore: (cb) =>
    logger.debug 'Restoring session from file %s', chalk.cyan this.userPath
    util.readJSON this.userPath, (err, data) =>
      if data?.host?
        # If `this.host?` at this stage then user has manually updated the host value via the `config` command.
        # Use the new value and neglect the old.
        unless this.host? then this.host = data.host
      else
        unless this.host? then this.host = config.host

      request.Request = request.Request.defaults { baseUrl: this.host } # Save.
      if this.host? and this.host.indexOf(config.host) is -1 then logger.info 'host: %s', chalk.cyan this.host
      if data?.tokens? then this.tokens = data.tokens

      if this.tokens?[this.host]? # Save token.
        logger.debug 'Restored session from file %s', chalk.cyan this.userPath
        cb() # Continue.
      else # No token, prompt for login.
        logger.debug 'Failed to restore session from file %s', chalk.cyan this.userPath
        this.refresh cb

  # Saves the session to file.
  save: (cb) =>
    logger.debug 'Saving session to file %s', chalk.cyan this.userPath
    util.writeJSON this.userPath, {
      tokens    : this.tokens
      host      : this.host
    }, cb

  # Sets up the user.
  setup: (options, cb) =>
    if options.email? or options.password? or options.host? # Custom session.
      if options.host?
        host = util.formatHost(options.host)
        logger.debug "Setting host: #{host}"
        this.host = host
      else
        logger.debug "Setting host: #{config.host}"
        this.host = config.host
      request.Request = request.Request.defaults { baseUrl: this.host } # Save.cb
      this.login options.email, options.password, cb
    else # Attempt to restore session from file.
      this.restore cb

  # Executes a login request.
  _execLogin: (email, password, cb) ->
    util.makeRequest {
      method  : 'POST'
      url     : '/session',
      json    : { email: email, password: password }
      refresh : false
    }, cb

  # Attempts to login with the provided email and password.
  _loginOnce: (email, password, cb) ->
    async.waterfall [
      (next) -> prompt.getEmailPassword email, password, next
      this._execLogin
    ], (err, response) =>
      # Mute invalid login errors, as the `login()` method will just retry.
      if err?.name in [ 'InvalidCredentials', 'ValidationError' ] then cb() # Mute.
      else if err? then cb err # Continue with error.
      else # OK.
        logger.info 'Welcome back %s', chalk.cyan response.body.email
        if this.host? # Persistent session
          this.tokens[this.host] = response.body.token # Save token.
        else # One-time session
          this.token = response.body.token
        cb() # Continue.

# Exports.
module.exports = new User config.paths.session