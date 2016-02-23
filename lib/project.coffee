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
KinveyError = require './error.coffee'
logger = require './logger.coffee'
prompt = require './prompt.coffee'
user   = require './user.coffee'
util   = require './util.coffee'

# Define the project class.
class Project

  # App, datalink, and schema.
  app           : null
  datalink      : null
  datalinkName  : null
  schemaVersion : null

  # Constructor.
  constructor: (path) ->
    this.projectPath = path

  # Returns whether the project is configured.
  isConfigured: () =>
    this.app? and this.datalink? and this.schemaVersion?

  # Lists all Kinvey datalinks.
  list: (cb) =>
    this._execKinveyDatalinks (err, datalinks) =>
      if err? then cb err # Continue with error.
      else # Log info.
        logger.info 'You have %s Kinvey datalink connectors:', chalk.cyan datalinks.length
        datalinks.forEach (datalink) =>
          # Highlight the active datalink.
          bullet = if datalink.id is this.datalink then chalk.green '* ' else ''
          logger.info '%s%s', bullet, chalk.cyan(datalink.name)
        logger.info 'The datalink used in this project is marked with *'
        cb() # Continue.

  # Restores the project from file.
  restore: (cb) =>
    logger.debug 'Restoring project from file %s', chalk.cyan this.projectPath
    util.readJSON this.projectPath, (err, data) =>
      if data?.app and data.datalink # Save ids.
        logger.debug 'Restored project from file %s', chalk.cyan this.projectPath
        this.app           = data.app
        this.datalink      = data.datalink
        this.datalinkName  = data.datalinkName
        this.schemaVersion = data.schemaVersion
        cb()
      else
        logger.debug 'Failed to restore project from file %s', chalk.cyan this.projectPath
        cb new KinveyError 'ProjectNotConfigured' # Continue with error.

  # Saves the project details to file.
  save: (cb) =>
    logger.debug 'Saving project to file %s', chalk.cyan this.projectPath
    util.writeJSON this.projectPath, {
      app           : this.app
      datalink      : this.datalink
      datalinkName  : this.datalinkName
      schemaVersion : this.schemaVersion
    }, cb

  # Selects and save app, and datalink.
  select: (cb) =>
    async.series [
      this._selectApp
      this._selectDatalink
      this.save
    ], cb

  # Sets up the project.
  setup: (options, cb) =>
    # Attempt to restore the project from file.
    this.restore (err) =>
      if !this.isConfigured() # Not configured, prompt for details.
        this.select cb
      else cb err # Continue.

  # Executes a GET /apps request.
  _execApps: (cb) ->
    util.makeRequest { url: '/apps' }, (err, response) ->
      cb err, response?.body

  # Returns eligible Kinvey datalinks.
  _execKinveyDatalinks: (cb) =>
    this._execDatalinks (err, body) ->
      if err? then cb err # Continue with error.
      else # Filter and sort by name.
        body = body.filter (el) -> 'internal' is el.type
        body.sort (x, y) -> # Sort.
          if x.name.toLowerCase() < y.name.toLowerCase() then -1 else 1
        cb null, body

  # Executes a GET /apps/:app/datalinks request.
  _execDatalinks: (cb) ->
    util.makeRequest {
      url: "/v#{this.schemaVersion}/apps/#{this.app}/data-links"
    }, (err, response) ->
      cb err, response?.body

  # Attempts to select the app.
  _selectApp: (cb) =>
    async.waterfall [
      this._execApps
      (apps, next) ->
        if 0 is apps.length then next new KinveyError 'NoAppsFound'
        else prompt.getApp apps, next
    ], (err, app) =>
      if app? # Save.
        this.app           = app.id
        this.schemaVersion = app.schemaVersion or config.defaultSchemaVersion
      cb err # Continue.

  # Attempts to select the datalink
  _selectDatalink: (cb) =>
    async.waterfall [
      this._execKinveyDatalinks
      (datalinks, next) ->
        if 0 is datalinks.length then next new KinveyError 'NoDatalinksFound'
        else prompt.getDatalink datalinks, next
    ], (err, datalink) =>
      if datalink?
        this.datalink = datalink.id
        this.datalinkName = datalink.name
      cb err # Continue.

# Exports.
module.exports = new Project config.paths.project