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
KinveyError = require './error.coffee'
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
    onError =

    # Initialize the archive.
    archive = archiver.create 'tar'

    # Prepare the upload stream.
    attachment =
      value   : archive
      options : { filename: 'archive.tar', contentType: 'application/tar' }

    # Prepare the request.
    req = request.post {
      url      : "/apps/#{project.app}/data-links/#{project.datalink}/deploy"
      headers  : { Authorization: "Kinvey #{user.token}", 'Transfer-Encoding': 'chunked' },
      formData : { file: attachment }
      timeout  : config.uploadTimeout or 30 * 1000 # 30s.
    }, (err, response) ->
      # NOTE: error is handled by `req` event listener defined below.
      if 202 is response?.statusCode
        logger.info 'Deploy initiated, received job %s', chalk.cyan response.body.job # Debug.
        cb() # Continue.
      else if response?
        cb response # Continue with request error.

    # Event listeners.
    archive.on 'data', (chunk) ->
      size = archive.pointer()
      if size > config.maxUploadSize # Validate.
        logger.info 'Max archive size exceeded (%s bytes, max %s bytes)', chalk.cyan(size), chalk.cyan config.maxUploadSize
        req.emit 'error', new KinveyError 'ProjectMaxFileSizeExceeded'

    archive.on 'finish', (err) ->
      logger.debug 'Created archive, %s bytes written', chalk.cyan archive.pointer() # Debug.

    # Error listeners.
    req.once 'error', (err) ->
       # NOTE: This handler is also triggered on archive-related errors.
      logger.debug 'Aborting the request because of error: %s', chalk.cyan err.message or err # Debug.
      archive.removeAllListeners 'finish'
      archive.abort()
      req.abort()
      cb err # Continue with error.

    # Pack.
    archive.bulk [{
      cwd    : dir
      src    : '**/*'
      dest   : false
      dot    : true # Include ".*" (e.g. ".git").
      expand : true
      filter : (filepath) => not this._isArtifact dir, filepath
    }]
    archive.finalize()

  # Recycles the containers that host the DLC.
  recycle: (cb) =>
    this._execRecycle (err, response) ->
      if 202 is response?.statusCode
        logger.info 'Recycle initiated, received job %s', chalk.cyan response.body.job
        cb() # Continue.
      else
        cb err or response.body # Continue with error.

  # Returns the deploy job status.
  status: (job, cb) =>
    this._execStatus job, (err, response) ->
      if 200 is response?.statusCode
        logger.info 'Job status: %s', chalk.cyan response.body.status
        cb null, response.body.status # Continue.
      else
        cb err or response.body # Continue with error.

  # Validates the project.
  validate: (dir, cb) ->
    packagePath = path.join dir, 'package.json' # Lookup package in provided dir.
    util.readJSON packagePath, (err, json) ->
      unless json?.dependencies?['backend-sdk']?
        return cb new KinveyError 'InvalidProject'
      unless project.isConfigured()
        return cb new KinveyError 'ProjectNotConfigured'
      cb err # Continue.

  # Executes a POST /apps/:app/datalink/:datalink/recycle request.
  _execRecycle: (cb) ->
    request.post {
      url     : "/apps/#{project.app}/data-links/#{project.datalink}/recycle"
      headers : { Authorization: "Kinvey #{user.token}" }
    }, cb

  # Executes a GET /apps/:app/datalink/:datalink/<type> request.
  _execStatus: (job, cb) ->
    request.get {
      url     : "/apps/#{project.app}/data-links/#{project.datalink}/deploy?job=#{job}"
      headers : { Authorization: "Kinvey #{user.token}" }
    }, cb

  # Returns true if the provided path is an artifact.
  _isArtifact: (base, filepath) ->
    relative = path.relative base, filepath
    for pattern in config.artifacts
      if 0 is relative.indexOf(pattern) or "#{relative}/" is pattern # Exclude both files and dirs.
        return true
    false

# Exports.
module.exports = new Datalink()