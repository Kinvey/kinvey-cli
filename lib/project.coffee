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

# Local modules.
logger  = require './logger.coffee'
request = require './request.coffee'
user    = require './user.coffee'
util    = require './util.coffee'

# Define the project class.
class Project

  # Public properties.
  app : null
  dlc : null
  environment: null

  # Returns all apps for the user.
  getApps: (cb) ->
    request.get {
      url     : '/apps'
      headers : { Authorization: "Kinvey #{user.token} " }
    }, (err, response) ->
      if 200 is response?.statusCode then cb null, response.body # Continue.
      else cb err or response.body # Continue with error.

  # Returns all DLCs for the specified app.
  getDLCs: (cb) =>
    request.get {
      url     : "/apps/#{this.app}/data-links"
      headers : { Authorization: "Kinvey #{user.token}" }
    }, (err, response) ->
      # Filter response body to include only Kinvey DLCs.
      if 200 is response?.statusCode
        cb null, response.body.filter (dlc) -> 0 is dlc.host?.indexOf 'kinveyDLC://'
      else # Continue with error.
        cb err or response.body

  # Selects an app and environment.
  selectApp: (cb) =>
    async.waterfall [
      this.getApps
      this._promptApp
    ], (err, app, environment) =>
      # Save properties.
      this.app         = app?.id
      this.environment = environment?.id
      cb err # Continue.

  selectDLC: (cb) =>
    async.waterfall [
      this.getDLCs
      this._promptDLC
    ], (err, dlc) =>
      this.dlc = dlc?.id # Save.
      cb err # Continue.

  # Prompt for missing app and/or environment.
  _promptApp: (apps, cb) ->
    # Error out if the user does not have any apps.
    if 0 is apps.length
      return cb 'You do not have any apps yet. Head over to the Kinvey console to create one.'

    if 1 is apps.length
      app = apps[0]
      logger.info 'Autoselecting your only app: %s', chalk.cyan app.name

    # Prompt for app and/or environment to use.
    inquirer.prompt [{
      message : 'Which app would you like to use?'
      name    : 'app'
      type    : 'list'
      choices : util.formatList apps
      when    : not app? # Only when app not already set.
    }, {
      message : 'Which environment would you like to use?'
      name    : 'environment'
      type    : 'list'
      choices : (answers) -> util.formatList (app or answers.app).environments
      when    : (answers) -> 1 < (app or answers.app).environments.length
    }], (answers) ->
      if answers.app?         then app         = answers.app
      if answers.environment? then environment = answers.environment
      else # Autoselect the only environment.
        environment = app.environments[0]
        logger.info 'Autoselecting your only environment: %s', chalk.cyan environment.name

      # Continue.
      cb null, app, environment

  # Prompt for missing DLC.
  _promptDLC: (dlcs, cb) ->
    # Error out if the user does not have any apps.
    if 0 is dlcs.length
      return cb 'You do not have any eligible datalinks. Head over to the Kinvey console to create one.'

    # Autoselect the only app.
    if 1 is dlcs.length
      dlc = dlcs[0]
      logger.info 'Autoselecting your only eligible datalink: %s', chalk.cyan dlc.name

    # Prompt for DLC to use.
    inquirer.prompt [{
      message : 'Which datalink would you like to use?'
      name    : 'dlc'
      type    : 'list'
      choices : util.formatList dlc
      when    : 1 < dlc.length
    }], (answers) ->
      if answers.dlc? then dlc = answers.dlc
      cb null, dlc # Continue.

# Exports.
module.exports = new Project()