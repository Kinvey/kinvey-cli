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

  # Selected data link host for log messages (null value retrieves logs for all hosts)
  host: null
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
      },
      timeout  : config.uploadTimeout or 30 * 1000 # 30s.
    }, (err, response) ->
      if err? then req.emit 'error', err # Trigger request error.
      else # OK.
        logger.info 'Deploy initiated, received job %s', chalk.cyan response.body.job # Debug.
        cb() # Continue.

    # Event listeners.
    archive.on 'data', (chunk) ->
      size = archive.pointer()
      console.log 'ARCHIVE SIZE: ' + size
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

  # Gets Kinvey-backed DLC host for extracting log messages
  getAndSetLogRequestParams: (cb) =>
    async.series [
      this._selectDatalinkHost
      this._selectAndSetLogStartTimestamp
      this._selectAndSetLogEndTimestamp
    ], cb

  # Lists all hosts containing internal DLC log files
  listLogHosts: (cb) =>
    this._execDatalinkLogHosts (err, datalinkLogs) =>
      if err? then cb err # Continue with error.
      else # Log info.
        #console.log "datalinkHosts: #{JSON.stringify datalinkHosts}"
        logger.info "There are %s log hosts for Kinvey DLC #{project.datalink}: ", chalk.cyan datalinkLogs.length
        datalinkLogs.forEach (datalinkLog) ->
          logger.info '%s', chalk.cyan(datalinkLog)
        cb() # Continue.

  # Lists all Kinvey logs.
  logs: (cb) =>
    this._execDatalinkLogs (err, logs) =>
      if err? then cb err # Continue with error.
      else # Log info.
        logs.forEach (log) ->
          console.log '%s %s - %s', chalk.green(log.containerId.substring(0, 12)), log.timestamp, chalk.cyan(log.message.trim())
        if !!this.host
            logger.info "Query returned %s logs for DLC %s host %s:", chalk.cyan(logs.length), chalk.cyan(project.datalink),
              chalk.green(this.host)
        else
          logger.info "Query returned %s logs for Kinvey DLC %s:", chalk.cyan(logs.length), chalk.cyan(project.datalink)
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
        logger.info 'Job status: %s %s', chalk.cyan(response.body.status), response.body.message or ''
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

# Executes a GET /apps/:app/datalinks/:datalink/logs/hosts request.
  _execDatalinkLogHosts: (cb) ->
    util.makeRequest {
      url: "/v#{project.schemaVersion}/apps/#{project.app}/data-links/#{project.datalink}/logs/hosts"
    }, (err, response) ->
      cb err, response?.body?.results

# Executes a GET /apps/:app/datalinks/:datalink/logs request.
  _execDatalinkLogs: (cb) =>
    paramAdded = false
    url = "/v#{project.schemaVersion}/apps/#{project.app}/data-links/#{project.datalink}/logs"

    logger.debug "Log start timestamp: #{this.logStartTimestamp}"
    logger.debug "Logs end timestamp: #{this.logEndTimestamp}"

    # Request URL creation (versus user input params)
    if !!this.host
      url += "?cid=#{this.host}"
      paramAdded = true
    if !!this.logStartTimestamp
      if paramAdded
        url += "&from=#{this.logStartTimestamp}"
      else
        url += "?from=#{this.logStartTimestamp}"
        paramAdded = true
    if !!this.logEndTimestamp
      if paramAdded
        url += "&to=#{this.logEndTimestamp}"
      else
        url += "?to=#{this.logEndTimestamp}"

    logger.debug "Logs URI: #{url}"

    util.makeRequest {
      url: url
    }, (err, response) ->
      cb err, response?.body?.logs

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

  # Attempts to select a datalink host (or all hosts).
  _selectDatalinkHost: (cb) =>
    async.waterfall [
      this._execDatalinkLogHosts
      (datalinkHosts, next) ->
        if 0 is datalinkHosts.length then next new KinveyError 'NoDatalinkHostsFound'
        else prompt.getDatalinkHost datalinkHosts, next
    ], (err, datalinkHost) =>
      if datalinkHost? then this.host = datalinkHost
      cb err # Continue.

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