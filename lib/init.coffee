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
fs = require 'fs'

# Package modules.
chalk          = require 'chalk'
config         = require 'config'
updateNotifier = require 'update-notifier'

# Local modules.
file   = require './file.coffee'
logger = require './logger.coffee'
pkg    = require '../package.json'
User   = require './user.coffee'

# Exports.
module.exports = (options) ->
  # Adjust the logger level based on verbose and silent options.
  if options.parent.verbose
    logger.config { level: 0 }
  if options.parent.silent
    logger.config { level: 3 }

  # Check for updates unless the suppress-version-check option was passed.
  unless options.parent.suppressVersionCheck
    notifier = updateNotifier { pkg: pkg }
    notifier.notify { defer: false } # Notify right away.

  # Initialize user.
  if fs.existsSync file.session
    logger.debug 'Reading session file %s', chalk.cyan file.session # Debug.
    contents   = fs.readFileSync file.session
    User.token = try JSON.parse(contents).token # Extract token.
    if User.token? then logger.debug 'Restored session' # Debug.

  # Initialize project.
  if fs.existsSync file.project
    # TODO
    contents = fs.readFileSync file.project