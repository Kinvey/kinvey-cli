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

# Standard lib.
fs = require 'fs'

# Package modules.
async    = require 'async'
chalk    = require 'chalk'
config   = require 'config'
inquirer = require 'inquirer'
isEmail  = require 'isemail'
logger   = require 'custom-logger'

# Local modules.
user = require './user.coffee'

###
 # Attempt to login with the provided credentials.
###
attemptLogin = (email, password, cb) ->
  async.waterfall [
    (next) -> prompt email, password, next
    user.login
  ], (err, response) ->
    # Error.
    if err then cb err

    # Success.
    else if 200 is response.statusCode # Success.
      logger.info 'Welcome back %s', chalk.cyan response.body.email
      cb null, response

    # Retry on invalid or incomplete credentials.
    else if response.body.code in [ 'InvalidCredentials', 'ValidationError' ]
      logger.warn 'Invalid Credentials. Please try again.'
      cb null, response

    else # Failure.
      logger.error response.body.description
      cb response

###
 # Ensure the user is eventually logged in.
###
ensureLogin = (email, password, cb) ->
  async.doUntil (next) ->
    attemptLogin email, password, next
    email = password = null # Reset.
  , user.isLoggedIn, (err) ->
    # Save the token to disk unless an error occured.
    questions = [ ]
    unless err? # The user is logged in.
      questions.push { message: 'Do you want to remember this user?', name: 'remember', type: 'confirm' }
    inquirer.prompt questions, (answers) ->
      if answers.remember # Save session to disk.
        logger.debug 'Writing session file %s', chalk.cyan config.paths.session # Debug.
        data = JSON.stringify { token: user.token }
        fs.writeFileSync config.paths.session, data

      # Continue.
      cb err

###
 # Prompt the user for e-mail and/or password.
###
prompt = (email, password, cb) ->
  questions = [ ]
  unless email? # E-mail not set, ask for it.
    questions.push { message: 'E-mail', name: 'email', validate: isEmail }
  unless password? # Password not set, ask for it.
    questions.push { message: 'Password', name: 'password', type: 'password' }
  inquirer.prompt questions, (answers) ->
    if answers.email?    then email    = answers.email
    if answers.password? then password = answers.password
    cb null, email, password

# Exports.
module.exports = (options, cb) ->
  if not user.isLoggedIn() or options.parent.email? or options.parent.password?
    user.token = null # Reset.
    ensureLogin options.parent.email, options.parent.password, cb
  else # The user is already logged in.
    cb()