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
lodashMerge    = require 'lodash.merge'
updateNotifier = require 'update-notifier'

# Local modules.
logger  = require './logger.coffee'
pkg     = require '../package.json'

# Exports.
module.exports = (command) ->
  # Merge options.
  options = lodashMerge { }, command.opts(), command.parent.opts()

  # Shared options.
  if options.silent?  then logger.config { level: 3 }
  if options.verbose? then logger.config { level: 0 }

  # Check for updates.
  unless options.suppressVersionCheck?
    logger.debug 'Checking for package updates'
    updateNotifier({ pkg: pkg, updateCheckInterval: 1000 * 60 * 30 }).notify { defer: false } # Show right away.

  # Return the options.
  options