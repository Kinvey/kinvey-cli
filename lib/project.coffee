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

  # App, service, and schema.
  app           : null
  service      : null
  serviceName  : null
  schemaVersion : null
  lastJobId     : null

  # Constructor.
  constructor: (path) ->
    this.projectPath = path

  # Returns whether the project is configured.
  isConfigured: () =>
    this.app? and this.service? and this.schemaVersion?

  # Lists all Kinvey datalinks.
  list: (cb) =>
    this._execKinveyServices (err, services) =>
      if err? then cb err # Continue with error.
      else # Log info.
        logger.info 'You have %s Kinvey service connectors:', chalk.cyan services.length
        services.forEach (service) =>
          # Highlight the active service.
          bullet = if service.id is this.service then chalk.green '* ' else ''
          logger.info '%s%s', bullet, chalk.cyan(service.name)
        logger.info 'The service used in this project is marked with *'
        cb() # Continue.

  # Restores the project from file.
  restore: (cb) =>
    logger.debug 'Restoring project from file %s', chalk.cyan this.projectPath
    util.readJSON this.projectPath, (err, data) =>
      if data?.app and data.service # Save ids.
        logger.debug 'Restored project from file %s', chalk.cyan this.projectPath
        this.app           = data.app
        this.service      = data.service
        this.serviceName  = data.serviceName
        this.schemaVersion = data.schemaVersion
        this.lastJobId     = data.lastJobId
        cb()
      else
        logger.debug 'Failed to restore project from file %s', chalk.cyan this.projectPath
        cb new KinveyError 'ProjectNotConfigured' # Continue with error.

  # Saves the project details to file.
  save: (cb) =>
    logger.debug 'Saving project to file %s', chalk.cyan this.projectPath
    util.writeJSON this.projectPath, {
      app           : this.app
      service       : this.service
      serviceName   : this.serviceName
      schemaVersion : this.schemaVersion
      lastJobId     : this.lastJobId
    }, cb

  # Selects and save app, and service.
  select: (cb) =>
    async.series [
      this._selectApp
      this._selectService
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
  _execKinveyServices: (cb) =>
    this._execServices (err, body) ->
      if err? then cb err # Continue with error.
      else # Filter and sort by name.
        body = body.filter (el) -> 'internal' is el.type
        body.sort (x, y) -> # Sort.
          if x.name.toLowerCase() < y.name.toLowerCase() then -1 else 1
        cb null, body

  # Executes a GET /apps/:app/datalinks request.
  _execServices: (cb) ->
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

  # Attempts to select the service
  _selectService: (cb) =>
    async.waterfall [
      this._execKinveyServices
      (services, next) ->
        if 0 is services.length then next new KinveyError 'NoDatalinksFound'
        else prompt.getService services, next
    ], (err, service) =>
      if service?
        this.service = service.id
        this.serviceName = service.name
      cb err # Continue.

# Exports.
module.exports = new Project config.paths.project