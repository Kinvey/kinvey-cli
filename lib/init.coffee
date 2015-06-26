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
logger  = require './logger.coffee'
pkg     = require '../package.json'
request = require './request.coffee'

# Exports.
module.exports = (options, cb) ->
  # Runtime modules.
  project = require './project.coffee'
  user    = require './user.coffee'

  # OPTIONS.
  # ========

  # Adjust the host.
  if options.parent.host? # TODO Make this work.
    request.defaults { baseUrl: options.parent.host }

  # Adjust the logger level based on verbose and silent options.
  if options.parent.verbose
    logger.config { level: 0 }
  if options.parent.silent
    logger.config { level: 3 }

  # Check for updates unless the suppress-version-check option was passed.
  unless options.parent.suppressVersionCheck
    notifier = updateNotifier { pkg: pkg }
    notifier.notify { defer: false } # Notify right away.

  # PROJECT.
  # ========

  # Initialize project.
  if fs.existsSync config.paths.project
    logger.debug 'Reading project file %s', chalk.cyan config.paths.project # Debug.
    contents = fs.readFileSync config.paths.project
    data     = try JSON.parse contents # Extract data.
    if data.app? and data.dlc? and data.environment? # Save.
      logger.debug 'Project OK'
      project.app = data.app
      project.dlc = data.dlc
      project.environment = data.environment

  # USER.
  # =====

  # Establish session with the provided user details.
  if options.parent.email? or options.parent.password? # Custom session.
    return user.login options.parent.email, options.parent.password, cb

  # Restore session from file.
  else if fs.existsSync config.paths.session
    logger.debug 'Reading session file %s', chalk.cyan config.paths.session # Debug.
    contents   = fs.readFileSync config.paths.session
    user.token = try JSON.parse(contents).token # Extract token.
    if user.token?
      logger.debug 'Session OK' # Debug.
      return cb()

  # Prompt for user details, and save the session.
  user.login null, null, () ->
    logger.debug 'Writing session file %s', chalk.cyan config.paths.session # Debug.
    fs.writeFileSync config.paths.session, JSON.stringify { token: user.token }
    cb() # Continue.