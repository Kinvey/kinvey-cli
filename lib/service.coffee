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
KinveyError = require './error.js'
logger      = require './logger.js'
project     = require './project.js'
prompt      = require './prompt.coffee'
user        = require './user.coffee'
util        = require './util.coffee'

STATUS_CONSTANTS =
  ONLINE   : 'ONLINE'
  NEW      : 'NEW'
  UPDATING : 'UPDATING'
  ERROR    : 'ERROR'

# Kinvey Service
class Service

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
        params : JSON.stringify { dataLinkId: project.service, version: version }
        file   : attachment
      }
      refresh  : false # Do not attempt to authenticate, just assume token is valid.
      timeout  : config.uploadTimeout or 30 * 1000 # 30s.
    }, (err, response) ->
      if err? then req.emit 'error', err # Trigger request error.
      else # OK.
        project.lastJobId = response.body.job
        project.save()
        logger.info 'Deploy initiated, received job %s', chalk.cyan response.body.job # Debug.
        cb() # Continue.

    # The archive is pipe-d into the request using chucken encoding, so unset Content-Length.
    # NOTE This is required as the `formData` module inserts the incorrect length.
    req.on 'pipe', ->
      req.removeHeader 'Content-Length'

    # Event listeners.
    archive.on 'data', (chunk) ->
      size = archive.pointer()
      if size > config.maxUploadSize # Validate.
        logger.info 'Max archive size exceeded (%s bytes, max %s bytes)', chalk.cyan(size), chalk.cyan config.maxUploadSize
        req.emit 'error', new KinveyError 'ProjectMaxFileSizeExceeded'

    archive.on 'finish', (err) ->
      logger.debug 'Created archive, %s bytes written', chalk.cyan archive.pointer() # Debug.

    # Error listeners.
    req.once 'error', (err) =>
       # NOTE: This handler is also triggered on archive-related errors.
      logger.debug 'Aborting the request because of error: %s', chalk.cyan err.message or err # Debug.
      archive.removeAllListeners 'finish'
      archive.abort()
      req.abort()

      # If authentication failed, re-authenticate and try deploying again.
      if 'InvalidCredentials' is err.name
        async.series [
          user.refresh # Re-authenticate.
          (next) => this.deploy dir, version, next # Try deploying again.
        ], cb
      else # Continue with error.
        cb err

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

  # Lists all Kinvey logs.
  logs: (from, to, cb) =>
    this._execDatalinkLogs from, to, (err, logs) ->
      if err? then return cb err # Continue with error.
      skippedLogEntries = []
      logs.forEach (log) ->
        messageString = log?.message
        unless messageString?
          log.skipped = true
          return skippedLogEntries.push log
        if Object.prototype.toString.call messageString isnt "[object String]" then messageString = JSON.stringify messageString
        if log.threshold? then return console.log '[%s] %s %s - %s', log.threshold, chalk.green(log.containerId.substring(0, 12)), log.timestamp, chalk.cyan(messageString.trim())
        console.log '%s %s - %s', chalk.green(log.containerId.substring(0, 12)), log.timestamp, chalk.cyan(messageString.trim())
      if skippedLogEntries.length > 0 then logger.debug '%s skipped log entries for FSR service %s (%s): %s', skippedLogEntries.length, project.service, project.serviceName, JSON.stringify(skippedLogEntries)
      console.log 'Query returned %s logs for FSR service %s (%s)', chalk.cyan(logs.length - skippedLogEntries.length), chalk.cyan(project.service), chalk.gray(project.serviceName)
      cb null, logs # Continue.

  # Recycles the containers that host the DLC.
  recycle: (cb) =>
    this._execRecycle (err, response) ->
      if err? then cb err # Continue with error.
      else # OK.
        project.lastJobId = response.body.job
        project.save()
        logger.info 'Recycle initiated, received job %s', chalk.cyan response.body.job
        cb() # Continue.

  # Returns the deploy job status.
  jobStatus: (job, cb) =>
    if not job?
      job = project.lastJobId
      if not job? then return cb new Error 'No previous job stored. Please provide a job ID.'
    this._execJobStatus job, (err, response) ->
      if err? then cb err # Continue with error.
      else # OK.
        suffix =
          if 'COMPLETE' isnt response.body.status && response.body.progress?
          then " - #{response.body.progress}"
          else ''
        logger.info 'Job status: %s%s', chalk.cyan(response.body.status), suffix
        cb null, response.body.status # Continue.

  # Returns the KMR service status.
  serviceStatus: (cb) =>
    this._execServiceStatus (err, response) ->
      if err? then cb err # Continue with error.
      else # OK.
        status = response.body.status
        if status is STATUS_CONSTANTS.ONLINE then status = chalk.green STATUS_CONSTANTS.ONLINE
        if status is STATUS_CONSTANTS.UPDATING then status = chalk.yellow STATUS_CONSTANTS.UPDATING
        if status is STATUS_CONSTANTS.NEW then status = chalk.cyan STATUS_CONSTANTS.NEW
        if status is STATUS_CONSTANTS.ERROR then status = chalk.red STATUS_CONSTANTS.ERROR
        logger.info 'Service status: %s', status
        cb null, response.body.status # Continue.

  # Validates the project.
  validate: (dir, cb) ->
    packagePath = path.join dir, 'package.json' # Lookup package in provided dir.
    util.readJSON packagePath, (err, json) ->
      unless json?.dependencies?['kinvey-flex-sdk']?
        return cb new KinveyError 'InvalidProject'
      unless project.isConfigured()
        return cb new KinveyError 'ProjectNotConfigured'
      cb err, json.version # Continue with version.

  # Executes a GET /apps/:app/datalinks/:datalink/logs request.
  _execDatalinkLogs: (from, to, cb) ->
    paramAdded = false
    url = "/v#{project.schemaVersion}/data-links/#{project.service}/logs"

    logger.debug "Log start timestamp: #{from}"
    logger.debug "Logs end timestamp: #{to}"

    # Request URL creation (versus user input params)
    if from?
      url += "?from=#{from}"
      paramAdded = true
    if to?
      if paramAdded
        url += "&to=#{to}"
      else
        url += "?to=#{to}"

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
        params : { dataLinkId: project.service }
      }
    }, cb

  # Executes a GET /apps/:app/datalink/:datalink/<type> request.
  _execJobStatus: (job, cb) ->
    util.makeRequest { url: "/v#{project.schemaVersion}/jobs/#{job}" }, cb

  # Executes a GET /apps/:app/datalink/:datalink/<type> request.
  _execServiceStatus: (cb) ->
    util.makeRequest { url: "/v#{project.schemaVersion}/data-links/#{project.service}/status" }, cb

  # Returns true if the provided path is an artifact.
  _isArtifact: (base, filepath) ->
    relative = path.normalize path.relative base, filepath
    for pattern in config.artifacts
      if 0 is relative.indexOf(pattern) or "#{relative}/" is pattern # Exclude both files and dirs.
        return true
    false

# Exports.
module.exports = new Service()