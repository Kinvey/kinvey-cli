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

# Package modules.
async = require 'async'

# Local modules.
init   = require './init.coffee'
logger = require './logger.coffee'

###
 # Return a function which runs init before the specified "fn" handler.
###
exports.run = (fn) ->
  (options, cb) ->
    async.series [
      (next) -> init options, next # Initialize.
      (next) -> fn   options, next # Execute the handler.
    ], (err) ->
      # Print any errors.
      if err
        logger.error err
        unless cb? then process.exit 1
      cb? err # Continue.

###
 # Formats the provided list for use with inquirer.
###
exports.formatList = (list, name = 'name') ->
  result = list.map (el) -> { name: el[name], value: el }
  result.sort (x, y) ->
    if x[name].toLowerCase() < y[name].toLowerCase() then -1 else 1
  result