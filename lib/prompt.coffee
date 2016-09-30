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
chalk    = require 'chalk'
inquirer = require 'inquirer'
isEmail  = require 'isemail'
moment   = require 'moment'

# Local modules.
logger = require './logger.coffee'
util   = require './util.coffee'

# Configure.
validateEmail = (email) ->
  if isEmail email then true
  else 'Please enter a valid e-mail address.'

# Timestamp validation for prompts
validateTimestamp = (ts) ->
  if not ts
    return true # Null input represents from the beginning

  # Input detected. Ensure it's a valid timestamp or error
  if moment(ts, moment.ISO_8601, true).isValid() then true
  else 'Please enter a valid ISO-8601 timestamp'

# Prompts the user for the app to use.
exports.getApp = (apps, cb) ->
  logger.debug 'Prompting for application'
  inquirer.prompt [{
    message : 'Which app would you like to use?'
    name    : 'app'
    type    : 'list'
    choices : util.formatList apps
    when    : 0 < apps.length
  }], (answers) ->
    cb null, answers.app # Continue.

# Prompts the user for the service to use.
exports.getService = (services, cb) ->
  logger.debug 'Prompting for service'
  inquirer.prompt [{
    message : 'Which service would you like to use?'
    name    : 'service'
    type    : 'list'
    choices : util.formatList services
    when    : 0 < services.length
  }], (answers) ->
    cb null, answers.service # Continue.

# Prompts the user for email and/or password.
exports.getEmailPassword = (email, password, cb) ->
  logger.debug 'Prompting for email and/or password'
  inquirer.prompt [
    { message: 'E-mail',   name: 'email', validate: validateEmail, when: not email?    }
    { message: 'Password', name: 'password', type: 'password',     when: not password? }
  ], (answers) ->
    if answers.email?    then email    = answers.email
    if answers.password? then password = answers.password
    cb null, email, password # Continue.

# Prompts the user for log start time.
exports.getLogStartTimestamp = (startTs, cb) ->
  logger.debug 'Prompting for log start timestamp'
  prompt = inquirer.prompt [
    { message: 'From ISO-8601 date: (leave blank for the beginning)',   name: 'startTimestamp', validate: validateTimestamp, when: not startTs?    }
  ], (answers) ->
    if answers.startTimestamp? then startTs = answers.startTimestamp
    else
      prompt.message = 'From ISO-8601 date:'
    cb null, startTs # Continue.

# Prompts the user for log end time.
exports.getLogEndTimestamp = (endTs, cb) ->
  logger.debug 'Prompting for log end timestamp'
  inquirer.prompt [
    { message: 'To ISO-8601 date: (leave blank for the most recent)',   name: 'endTimestamp', validate: validateTimestamp, when: not endTs?    }
  ], (answers) ->
    if answers.endTimestamp? then endTs = answers.endTimestamp
    cb null, endTs # Continue.