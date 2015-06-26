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
async    = require 'async'
chalk    = require 'chalk'
inquirer = require 'inquirer'
isEmail  = require 'isemail'

# Local modules.
logger  = require './logger.coffee'
request = require './request.coffee'

# Define the User class.
class User
  # Public properties.
  token: null

  # Returns whether the user is logged in.
  isLoggedIn: () =>
    this.token?

  # Ensures the user eventually logs in.
  login: (email, password, cb) =>
    async.doUntil (next) =>
      this._loginOnce email, password, next
      email = password = null # Reset initial credentials.
    , this.isLoggedIn, cb

  # Execute the login request.
  _execLogin: (email, password, cb) ->
    request.post {
      url  : '/session',
      json : { email: email, password: password }
    }, cb

  # Attempts to login the user with the provided credentials.
  _loginOnce: (email, password, cb) =>
    async.waterfall [
      (next) => this._prompt email, password, next
      this._execLogin
    ], (err, response) =>
      # Save the token upon login.
      if 200 is response?.statusCode
        logger.info 'Welcome back %s', chalk.cyan response.body.email
        this.token = response.body.token # Extract token.
        return cb null, response.body # Continue.

      # Retry if the request completed with error-code.
      if response?.body.code in [ 'InvalidCredentials', 'ValidationError' ]
        logger.warn 'Invalid Credentials. Please try again.'
        return cb null, response.body # Continue with retry.

      # Continue with error.
      cb err or response.body

  # Prompt for missing user credentials.
  _prompt: (email, password, cb) ->
    # Prompt for e-mail and password only when not already set.
    inquirer.prompt [
      { message: 'E-mail',   name: 'email', validate: isEmail,   when: not email?    }
      { message: 'Password', name: 'password', type: 'password', when: not password? }
    ], (answers) ->
      if answers.email?    then email    = answers.email
      if answers.password? then password = answers.password
      cb null, email, password # Continue.

# Exports.
module.exports = new User()