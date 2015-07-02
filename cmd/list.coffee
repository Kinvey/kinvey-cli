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
async   = require 'async'
chalk   = require 'chalk'
program = require 'commander'

# Local modules.
init    = require '../lib/init.coffee'
logger  = require '../lib/logger.coffee'
project = require '../lib/project.coffee'
user    = require '../lib/user.coffee'

# Entry point for the list command.
module.exports = list = (command, cb) ->
  options = init command # Initialize the command.

  # Set-up user and project.
  async.series [
    (next) -> user.setup options, next
    project.restore

    (next) ->
      logger.info 'Current datalink: %s', chalk.cyan project.datalink
      next() # Continue.
  ], (err) ->
    if err? # Display errors.
      logger.error err
      unless cb? then process.exit -1 # Exit with error.
    cb? err

# Register the command.
program
  .command     'list'
  .description 'list the configured Kinvey-backed Data Link Connectors for the current environment'
  .action      list