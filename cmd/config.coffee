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
async   = require 'async'
chalk   = require 'chalk'
config  = require 'config'
program = require 'commander'

# Local modules.
init        = require '../lib/init.coffee'
logger      = require '../lib/logger.coffee'
project     = require '../lib/project.coffee'
user        = require '../lib/user.coffee'
util        = require '../lib/util.coffee'

initUrl = (host, cb) ->
  if host? # Format and adjust host.
    result = util.formatHost host
    user.host = result
  else
    user.host = config.host
  cb()

# Entry point for the config command.
module.exports = configure = (host, command, cb) ->
  options = init command # Initialize the command.

  # Set-up user and project.
  async.series [
    (next) -> initUrl        host, next
    (next) -> user.setup     options, next
    (next) -> project.config options, next
    (next) -> user.save      next
  ], (err) ->
    if err? # Display errors.
      logger.error '%s', err
      unless cb? then process.exit -1 # Exit with error.
    cb? err

# Register the command.
program
  .command     'config [instance]'
  .description "set project options (including optional Kinvey instance, i.e. 'acme-us1)"
  .action      configure