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

# Standard lib.
path = require 'path'

# Package modules.
async    = require 'async'
archiver = require 'archiver'
chalk    = require 'chalk'
config   = require 'config'

# Local modules.
KinveyError = require './error.coffee'
logger  = require './logger.coffee'
project = require './project.coffee'
prompt = require './prompt.coffee'
user    = require './user.coffee'
util    = require './util.coffee'

# Define the datalink class.
class Datalink

  # `logs` command query values fetched via prompt
  logStartTimestamp: null
  logEndTimestamp: null

  # Packages and uploads the project.
  deploy: (dir, version, cb) =>
    logger.debug 'Creating archive from %s', chalk.cyan dir # Debug.

    # Initialize the archive.
    archive = archiver.create 'tar'

    # Prepare the upload stream.
    attachment =
      value   : archive
      options : { filename: 'archive.tar', contentType: 'application/tar' }

    # Prepare the request.
    req = util.makeRequest {
      method   : 'POST'
      url      : "/v#{project.schemaVersion}/jobs"
      headers  : { 'Transfer-Encoding': 'chunked' }
      formData : {
        type   : 'deployDataLink'
        params : JSON.stringify { appId: project.app, dataLinkId: project.datalink, version: version }
        file   : attachment
      }
      timeout  : config.uploadTimeout or 30 * 1000 # 30s.
    }, (err, response) ->
      if err? then req.emit 'error', err # Trigger request error.
      else # OK.
        logger.info 'Deploy initiated, received job %s', chalk.cyan response.body.job # Debug.
        cb() # Continue.

    # The archive is pipe-d into the request using chucken encoding, so unset Content-Length.
    # NOTE This is required as the `formData` module inserts the incorrect length.
    req.on 'pipe', ->
      req.removeHeader 'Content-Length'

    # Event listeners.
    archive.on 'data', (chunk) ->
      size = archive.pointer()
      #console.log 'ARCHIVE SIZE: ' + size
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

  # Gets query params
  getAndSetLogRequestParams: (cb) =>
    async.series [
      this._selectAndSetLogStartTimestamp
      this._selectAndSetLogEndTimestamp
    ], cb

  # Lists all Kinvey logs.
  logs: (cb) =>
    this._execDatalinkLogs (err, logs) ->
      if err? then cb err # Continue with error.
      else # Log info.
        logs.forEach (log) ->
          console.log '%s %s - %s', chalk.green(log.containerId), log.timestamp, chalk.cyan(log.message.trim())
        logger.info 'Query returned %s logs for Kinvey DLC %s (%s):', chalk.cyan(logs.length), chalk.cyan(project.datalink),
          chalk.gray(project.datalinkName)
        cb() # Continue.

  # Recycles the containers that host the DLC.
  recycle: (cb) =>
    this._execRecycle (err, response) ->
      if err? then cb err # Continue with error.
      else # OK.
        logger.info 'Recycle initiated, received job %s', chalk.cyan response.body.job
        cb() # Continue.

  # Returns the deploy job status.
  status: (job, cb) =>
    this._execStatus job, (err, response) ->
      if err? then cb err # Continue with error.
      else # OK.
        suffix =
          if 'COMPLETE' isnt response.body.status && response.body.progress?
          then " - #{response.body.progress}"
          else ''
        logger.info 'Job status: %s%s', chalk.cyan(response.body.status), suffix
        cb null, response.body.status # Continue.

  # Validates the project.
  validate: (dir, cb) ->
    packagePath = path.join dir, 'package.json' # Lookup package in provided dir.
    util.readJSON packagePath, (err, json) ->
      unless json?.dependencies?['kinvey-backend-sdk']?
        return cb new KinveyError 'InvalidProject'
      unless project.isConfigured()
        return cb new KinveyError 'ProjectNotConfigured'
      cb err, json.version # Continue with version.

# Executes a GET /apps/:app/datalinks/:datalink/logs request.
  _execDatalinkLogs: (cb) =>
    paramAdded = false
    url = "/v#{project.schemaVersion}/data-links/#{project.datalink}/logs"

    logger.debug "Log start timestamp: #{this.logStartTimestamp}"
    logger.debug "Logs end timestamp: #{this.logEndTimestamp}"

    # Request URL creation (versus user input params)
    if this.logStartTimestamp
      url += "?from=#{this.logStartTimestamp}"
      paramAdded = true
    if this.logEndTimestamp
      if paramAdded
        url += "&to=#{this.logEndTimestamp}"
      else
        url += "?to=#{this.logEndTimestamp}"

    logger.debug "Logs URI: #{url}"

    util.makeRequest {
      url: url
    }, (err, response) ->
      cb err, response?.body

  # Executes a POST /apps/:app/datalink/:datalink/recycle request.
  _execRecycle: (cb) ->
    util.makeRequest {
      method : 'POST'
      url    : "/v#{project.schemaVersion}/jobs"
      body   : {
        type   : 'recycleDataLink'
        params : { appId: project.app, dataLinkId: project.datalink }
      }
    }, cb

  # Executes a GET /apps/:app/datalink/:datalink/<type> request.
  _execStatus: (job, cb) ->
    util.makeRequest { url: "/v#{project.schemaVersion}/jobs/#{job}" }, cb

  # Returns true if the provided path is an artifact.
  _isArtifact: (base, filepath) ->
    relative = path.relative base, filepath
    for pattern in config.artifacts
      if 0 is relative.indexOf(pattern) or "#{relative}/" is pattern # Exclude both files and dirs.
        return true
    false

  # Attempts to select a log start time
  _selectAndSetLogStartTimestamp: (cb) =>
    prompt.getLogStartTimestamp null, (err, startTimestamp) =>
      if startTimestamp? then this.logStartTimestamp = startTimestamp
      cb err # Continue.

  # Attempts to select a log end time
  _selectAndSetLogEndTimestamp: (cb) =>
    prompt.getLogEndTimestamp null, (err, endTimestamp) =>
      if endTimestamp? then this.logEndTimestamp = endTimestamp
      cb err # Continue.

# Exports.
module.exports = new Datalink()