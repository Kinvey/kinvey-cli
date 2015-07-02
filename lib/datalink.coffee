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
path = require 'path'

# Package modules.
archiver = require 'archiver'
chalk    = require 'chalk'
config   = require 'config'

# Local modules.
logger  = require './logger.coffee'
pkg     = require '../package.json'
project = require './project.coffee'
request = require './request.coffee'
user    = require './user.coffee'

# Define the datalink class.
class Datalink

  constructor: (project) ->
    this.project = project

  # Packages and uploads the project.
  deploy: (cb) =>
    logger.debug 'Creating archive' # Debug.

    # Initialize the archive.
    archive = archiver.create 'zip'

    # Prepare the request.
    req = request.post {
      url     : "/apps/#{project.app}/data-links/{project.datalink}/deploy"
      headers : { Authorization: "Kinvey #{user.token}" }
    }, (err, response) ->
      logger.debug 'Upload complete.' # Debug.
      cb err

    # Event listeners.
    archive.on 'finish', (err) ->
      size = archive.pointer()

      # Debug.
      logger.debug 'Created archive, %s bytes written', chalk.cyan size

      # Validate the archive and fail when invalid.
      if size > config.maxUpload
        logger.debug 'Max archive size exceeded (%s, limit %s)', chalk.cyan(size), chalk.cyan config.maxUpload
        archive.emit 'error', new Error 'ProjectMaxFileSizeExceeded'

    archive.on 'error', (err) ->
      # Stop further processing and continue with error.
      req.abort()
      archive.unpipe req
      archive.abort()
      cb err
      cb = null # Reset.

    # Pipe the archive into the request.
    archive.pipe req

    # Pack.
    archive.bulk [{
      cwd    : process.cwd()
      src    : '**'
      dest   : false
      expand : true
      filter : this._skipArtifacts
    }]
    archive.finalize()

  # Restarts the containers that host the DLC.
  restart: (cb) =>
    this._execRestart cb

  # Validates the project.
  validate: (cb) =>
    # TODO pick right pkg - not this module one, but the process.cwd() one.
    unless pkg.dependencies?['backend-sdk']?
      return cb new Error 'InvalidProject'
    unless this.project.isConfigured()
      return cb new Error 'ProjectNotConfigured'
    cb() # Continue.

  # Executes a POST /apps/:app/datalink/:datalink/restart request.
  _execRestart: (cb) ->
    request.post {
      url     : "/apps/#{this.project.app}/data-links/#{this.project.datalink}/restart"
      headers : { Authorization: "Kinvey #{user.token}" }
    }, cb

  # Executes a POST /apps/:app/datalink/:datalink/deploy request.
  _execUpload: (file, cb) ->
    request.post {
      url       : "/apps/#{this.project.app}/data-links/#{this.project.datalink}/deploy"
      headers   : { Authorization: "Kinvey #{user.token}" }
      multipart : [ { body: file } ]
    }, cb

  # Returns true if the provided path is an artifact.
  _skipArtifacts: (filepath) ->
    relative = path.relative process.cwd(), filepath
    0 isnt relative.indexOf 'node_modules/'

# Exports.
module.exports = new Datalink project