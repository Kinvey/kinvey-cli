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

    # Global error handler.
    onError = (err) ->
      archive.removeAllListeners 'finish'
      archive.abort()
      req.abort()
      cb err # Continue with error.

    # Initialize the archive.
    archive = archiver.create 'zip'

    # Prepare the upload stream.
    attachment = {
      value   : archive
      options : { filename: 'archive.zip', contentType: 'application/zip' }
    }

    # Prepare the request.
    req = request.post {
      url      : "/apps/#{project.app}/data-links/#{project.datalink}/deploy?target=#{project.environment}"
      headers  : { Authorization: "Kinvey #{user.token}", 'Transfer-Encoding': 'chunked' },
      formData : { file: attachment }
      timeout  : config.uploadTimeout or 30 * 1000 # 30s.
    }, (_, response) ->
      if 202 is response?.statusCode
        logger.info 'Deploy initiated, received job %s.', chalk.cyan response.body.job # Debug.
        cb() # Continue.
      else if response?
        cb response # Continue with request error.

    # Event listeners.
    archive.on 'data', (chunk) ->
      size = archive.pointer()
      if size > config.maxUploadSize # Validate.
        logger.info 'Max archive size exceeded (%s bytes, max %s bytes)', chalk.cyan(size), chalk.cyan config.maxUploadSize
        req.emit 'error', new Error 'ProjectMaxFileSizeExceeded'

    archive.on 'finish', (err) ->
      logger.debug 'Created archive, %s bytes written', chalk.cyan archive.pointer() # Debug.

    # Error listeners.
    req.once 'error', onError # Also triggered on archive errors.

    # Pack.
    archive.bulk [{
      cwd    : dir
      src    : '**'
      dest   : false
      dot    : true # Include ".*" (e.g. ".git").
      expand : true
      filter : (filepath) => this._skipArtifacts dir, filepath
    }]
    archive.finalize()

  # Restarts the containers that host the DLC.
  restart: (cb) =>
    this._execRestart (err, response) ->
      if 202 is response?.statusCode
        logger.info 'Restart initiated, received job %s.', chalk.cyan response.body.job # Debug.
        cb() # Continue.
      else
        cb err or response # Continue with error.

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
      url     : "/apps/#{project.app}/data-links/#{project.datalink}/restart?target=#{project.environment}"
      headers : { Authorization: "Kinvey #{user.token}" }
    }, cb

  # Returns true if the provided path is an artifact (i.e. should be included).
  _skipArtifacts: (base, filepath) ->
    relative = path.relative base, filepath
    for pattern in config.ignore
      if 0 is relative.indexOf pattern
        return false
    true

# Exports.
module.exports = new Datalink()