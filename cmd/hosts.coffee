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

# Package modules.
program = require 'commander'
async = require 'async'

# Local modules.
datalink = require '../lib/datalink.coffee'
init   = require '../lib/init.coffee'
logger = require '../lib/logger.coffee'
project = require '../lib/project.coffee'
user    = require '../lib/user.coffee'

# Entry point for the logs command.
module.exports = hosts = (argv..., cb) ->
  options = init this # Initialize the command.

  # Set-up user and project.
  async.series [
    (next) -> user.setup options, next
    project.restore

    # Get internal DLC logs
    project.listLogHosts
  ], (err) ->
    if err? # Display errors.
      logger.error '%s', err
      unless cb? then process.exit -1 # Exit with error.
    cb? err

# Register the command.
program
.command     'hosts'
.description 'display the logs of the Data Link Connector'
.action      hosts