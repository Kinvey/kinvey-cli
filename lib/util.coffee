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
fs  = require 'fs'

# Package modules.
async    = require 'async'
chalk    = require 'chalk'
validUrl = require 'valid-url'

# Local modules.
KinveyError = require './error.js'
logger  = require './logger.js'
request = require './request.js'
user    = require './user.coffee'

# Formats the host argument to be a valid URL.
exports.formatHost = (host) ->
  # Check if input host is valid HTTP URI and use it if so
  validHost = validUrl.isHttpUri host
  if validHost
    if validHost.slice(-1) isnt '/' then validHost = validHost + '/'
    return validHost

  # Check if input host is valid HTTPS URI and use it if so
  validHost = validUrl.isHttpsUri host
  if validHost
    if validHost.slice(-1) isnt '/' then validHost = validHost + '/'
    return validHost

  # Input host is neither HTTP or HTTPS. Build host.
  return 'https://' + host + '-manage.kinvey.com/' # Return the urlStr.

# Formats the provided list for use with inquirer.
exports.formatList = (list, name = 'name') ->
  result = list.map (el) -> { name: el[name], value: el }
  result.sort (x, y) ->
    if x[name].toLowerCase() < y[name].toLowerCase() then -1 else 1
  result

# Formats the provided list for use with inquirer.
exports.formatHostList = (list) ->
  result = list.map (el) -> { name: el, value: el }
  result.unshift { name: 'all hosts', value: null } # Add 'all hosts' option to beginning of selection
  result

# Executes a request.
exports.makeRequest = makeRequest = (options, cb) ->
  # Add authentication to options.
  options.method ?= 'GET' # Default to GET.
  if user.isLoggedIn()
    options.headers ?= { }
    options.headers?.Authorization = "Kinvey #{user.getToken()}"

  # Perform the request.
  logger.debug 'Request:  %s %s', options.method, options.url
  request.Request options, (err, response) ->
    connErrors = [ 'ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'PROTOCOL_CONNECTION_LOST' ]
    if err?
      if err.message.indexOf('ENOTFOUND') isnt -1
        return cb new KinveyError 'InvalidConfigUrl'

      for msg in connErrors
        if err.message.indexOf(msg) isnt -1
          return cb new KinveyError 'ConnectionError'

      return cb err # Continue with error.

    logger.debug 'Response: %s %s %s', options.method, options.url, chalk.green response.statusCode
    if 2 is parseInt response.statusCode / 100, 10 # OK.
      return cb null, response
    if 'InvalidCredentials' is response.body?.code
      logger.warn 'Invalid credentials, please authenticate.'

      # Attempt to authenticate, unless explicitly disallowed.
      unless false is options.refresh
        return user.refresh (err) ->
          if err? then cb err # Continue with error.
          else makeRequest options, cb # Retry the original request.

    # Handle response errors.
    if response.body?.code? # Formatted response error.
      cb new KinveyError response.body.code, response.body.description
    else # Raw response error.
      cb new KinveyError 'RequestError', response.statusCode

# Reads contents from the specified file.
exports.readFile = readFile = (file, cb) ->
  logger.debug 'Reading contents from file %s', chalk.cyan file # Debug.
  fs.readFile file, cb # Forward to fs.

# Reads JSON contents from the specified file.
exports.readJSON = (file, cb) ->
  logger.debug 'Reading JSON from file %s', chalk.cyan file # Debug.
  async.waterfall [
    (next)       -> readFile file, next
    (data, next) ->
      json = null # Init.
      try
        logger.debug 'Parsing JSON from file: %s', chalk.cyan file # Debug.
        json = JSON.parse data
      catch e
        logger.warn 'Invalid JSON in file %s', chalk.cyan file # Debug.
        return next e # Invalid JSON.
      next null, json # Valid JSON.
  ], cb

# Writes contents to the specified file.
exports.writeFile = writeFile = (file, contents, cb) ->
  logger.debug 'Writing contents to file %s', chalk.cyan file # Debug.
  fs.writeFile file, contents, cb # Forward to fs.

# Writes JSON contents to the specified file.
exports.writeJSON = (file, json, cb) ->
  logger.debug 'Writing JSON to file %s', chalk.cyan file # Debug.
  contents = JSON.stringify json
  writeFile file, contents, cb