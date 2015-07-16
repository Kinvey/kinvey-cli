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
chalk    = require 'chalk'
inquirer = require 'inquirer'
isEmail  = require 'isemail'

# Local modules.
logger = require './logger.coffee'
util   = require './util.coffee'

# Prompts the user for the app and environment to use.
exports.getAppEnvironment = (apps, cb) ->
  logger.debug 'Prompting for app and environment'
  inquirer.prompt [{
    message : 'Which app would you like to use?'
    name    : 'app'
    type    : 'list'
    choices : util.formatList apps
    when    : 0 < apps.length
  }, {
    message : 'Which environment would you like to use?'
    name    : 'environment'
    type    : 'list'
    choices : (answers) -> util.formatList answers.app.environments
    when    : (answers) -> 0 < answers.app?.environments.length
  }], (answers) ->
    cb null, answers.app, answers.environment # Continue.

# Prompts the user for the datalink to use.
exports.getDatalink = (datalinks, cb) ->
  logger.debug 'Prompting for datalink'
  inquirer.prompt [{
    message : 'Which datalink would you like to use?'
    name    : 'datalink'
    type    : 'list'
    choices : util.formatList datalinks
    when    : 0 < datalinks.length
  }], (answers) ->
    cb null, answers.datalink # Continue.

# Prompts the user for email and/or password.
exports.getEmailPassword = (email, password, cb) ->
  logger.debug 'Prompting for email and/or password'
  inquirer.prompt [
    { message: 'E-mail',   name: 'email', validate: isEmail,   when: not email?    }
    { message: 'Password', name: 'password', type: 'password', when: not password? }
  ], (answers) ->
    if answers.email?    then email    = answers.email
    if answers.password? then password = answers.password
    cb null, email, password # Continue.