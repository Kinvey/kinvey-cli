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
datalink = require './datalink.coffee'
logger   = require './logger.coffee'
prompt   = require './prompt.coffee'
request  = require './request.coffee'
user     = require './user.coffee'
util     = require './util.coffee'

# Define the project class.
class Project

  # App, datalink, and environment ids.
  app         : null
  datalink    : null
  environment : null

  # Constructor.
  constructor: (path) ->
    this.projectPath = path

  # Returns whether the environment is configured.
  isConfigured: () =>
    this.app? and this.datalink? and this.environment?

  # Restores the environment from file.
  restore: (cb) =>
    logger.debug 'Restoring project from file %s', chalk.cyan this.projectPath
    util.readJSON this.projectPath, (err, data) =>
      if data?.app and data.datalink and data.environment # Save ids.
        logger.debug 'Restored project from file %s', chalk.cyan this.projectPath
        this.app         = data.app
        this.datalink    = data.datalink
        this.environment = data.environment
        cb() # Continue.
      else
        logger.debug 'Failed to restore project from file %s', chalk.cyan this.projectPath
        cb new Error 'ProjectNotConfigured' # Continue with error.

  # Saves the project details to file.
  save: (cb) =>
    logger.debug 'Saving project to file %s', chalk.cyan this.projectPath
    util.writeJSON this.projectPath, {
      app         : this.app
      datalink    : this.datalink
      environment : this.environment
    }, cb

  # Selects app, datalink, and environment.
  select: (cb) =>
    async.series [
      this._selectAppEnvironment
      this._selectDatalink
      this.save
    ], cb

  # Sets up the environment.
  setup: (options, cb) =>
    # Attempt to restore environment from file.
    this.restore (err) =>
      if !this.isConfigured() # Not configured, prompt for details.
        this.select cb
      else cb() # Continue.

  # Executes a GET /apps request.
  _execApps: (cb) =>
    request.get {
      url     : '/apps'
      headers : { Authorization: "Kinvey #{user.token}" }
    }, (err, response) ->
      if 200 is response?.statusCode then cb null, response.body
      else cb err or response # Continue with error.

  # Executes a GET /apps/:app/datalinks request.
  _execDatalinks: (cb) =>
    request.get {
      url     : "/apps/#{this.app}/data-links"
      headers : { Authorization: "Kinvey #{user.token}" }
    }, (err, response) ->
      if 200 is response?.statusCode then cb null, response.body
      else cb err or response # Continue with error.

  # Returns eligible Kinvey datalinks.
  _execKinveyDatalinks: (cb) =>
    this._execDatalinks (err, body) ->
      if body?.length # Filter.
        body = body.filter (el) -> 0 is el.host?.indexOf 'kinveyDLC://'
      cb err, body

  # Attempts to select the app and environment.
  _selectAppEnvironment: (cb) =>
    async.waterfall [
      this._execApps
      (apps, next) ->
        if 0 is apps.length then next new Error 'NoAppsFound'
        else prompt.getAppEnvironment apps, next
    ], (err, app, environment) =>
      if app?         then this.app = app.id
      if environment? then this.environment = environment.id
      cb err # Continue.

  # Attempts to select the datalink
  _selectDatalink: (cb) =>
    async.waterfall [
      this._execKinveyDatalinks
      (datalinks, next) ->
        if 0 is datalinks.length then next new Error 'NoDatalinksFound'
        else prompt.getDatalink datalinks, next
    ], (err, datalink) =>
      if datalink? then this.datalink = datalink.id
      cb err # Continue.

# Exports.
module.exports = new Project config.paths.project