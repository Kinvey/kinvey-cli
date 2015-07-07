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
project = require './project.coffee'
request = require './request.coffee'
user    = require './user.coffee'
util    = require './util.coffee'

# Define the datalink class.
class Datalink

  # Packages and uploads the project.
  deploy: (dir, cb) =>
    logger.debug 'Creating archive from %s', chalk.cyan dir # Debug.

    # Initialize the archive.
    archive = archiver.create 'zip'

    # Prepare the request.
    req = request.post {
      url     : "/apps/#{project.app}/data-links/#{project.datalink}/deploy"
      headers : { Authorization: "Kinvey #{user.token}" }
      timeout : config.uploadTimeout or 30000 # 30s.
    }, (err, response) ->
      if 202 is response?.statusCode then logger.debug 'Upload complete.' # Debug.
      cb err # Continue.

    # Event listeners.
    archive.on 'data', (chunk) ->
      size = archive.pointer()
      if size > config.maxUploadSize # Validate.
        logger.debug 'Max archive size exceeded (%s, limit %s)', chalk.cyan(size), chalk.cyan config.maxUploadSize
        archive.emit 'error', new Error 'ProjectMaxFileSizeExceeded'

    archive.on 'finish', (err) ->
      logger.debug 'Created archive, %s bytes written', chalk.cyan archive.pointer() # Debug.

    archive.on 'error', (err) ->
      # Stop processing.
      req.end()
      archive.removeAllListeners()
      archive.abort()
      cb err # Continue with error.

    # Pipe the archve into the request.
    archive.pipe req

    # Pack.
    archive.bulk [{
      cwd    : dir
      src    : '**'
      dest   : false
      expand : true
      filter : (filepath) => this._skipArtifacts dir, filepath
    }]
    archive.finalize()

  # Restarts the containers that host the DLC.
  restart: (cb) =>
    this._execRestart cb

  # Validates the project.
  validate: (dir, cb) ->
    packagePath = path.join dir, 'package.json' # Lookup package in provided dir.
    util.readJSON packagePath, (err, json) ->
      unless json?.dependencies?['backend-sdk']?
        return cb new Error 'InvalidProject'
      unless project.isConfigured()
        return cb new Error 'ProjectNotConfigured'
      cb err # Continue.

  # Executes a POST /apps/:app/datalink/:datalink/restart request.
  _execRestart: (cb) ->
    request.post {
      url     : "/apps/#{project.app}/data-links/#{project.datalink}/restart"
      headers : { Authorization: "Kinvey #{user.token}" }
    }, cb

  # Executes a POST /apps/:app/datalink/:datalink/deploy request.
  _execUpload: (file, cb) ->
    request.post {
      url       : "/apps/#{project.app}/data-links/#{project.datalink}/deploy"
      headers   : { Authorization: "Kinvey #{user.token}" }
      multipart : [ { body: file } ]
    }, cb

  # Returns true if the provided path is an artifact.
  _skipArtifacts: (base, filepath) ->
    relative = path.relative base, filepath
    0 isnt relative.indexOf 'node_modules/'

# Exports.
module.exports = new Datalink()