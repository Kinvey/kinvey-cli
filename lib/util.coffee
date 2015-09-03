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
fs  = require 'fs'
url = require 'url'

# Package modules.
async = require 'async'
chalk = require 'chalk'

# Local modules.
logger = require './logger.coffee'

# Formats the host argument to be a valid URL.
exports.formatHost = (host) ->
  urlObj = url.parse host
  urlObj = # Make sure the host is correctly set, with protocol and path.
    host     : urlObj.host     or urlObj.pathname
    pathname : if urlObj.host? then urlObj.pathname else null
    protocol : urlObj.protocol or 'https' # Default to HTTPS.
  url.format urlObj # Return the urlStr.

# Formats the provided list for use with inquirer.
exports.formatList = (list, name = 'name') ->
  result = list.map (el) -> { name: el[name], value: el }
  result.sort (x, y) ->
    if x[name].toLowerCase() < y[name].toLowerCase() then -1 else 1
  result

# Reads contents from the specified file.
exports.readFile = readFile = (file, cb) ->
  logger.debug 'Reading contents from file %s', chalk.cyan file # Debug.
  fs.readFile file, cb # Forward to fs.

# Reads JSON contents from the specified file.
exports.readJSON = readJSON = (file, cb) ->
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
exports.writeJSON = writeJSON = (file, json, cb) ->
  logger.debug 'Writing JSON to file %s', chalk.cyan file # Debug.
  contents = JSON.stringify json
  writeFile file, contents, cb