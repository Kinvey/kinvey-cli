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
config  = require 'config'
program = require 'commander'

# Local modules.
logger = require '../lib/logger.coffee'
util   = require '../lib/util.coffee'

# Entry point for the config command.
module.exports = configure = (options, cb) ->
  # Set-up.
  user.setup()
  project.setup()
  dlc.setup()

  cb()

###
 # Entry point for the config command (exported).
###
module.exports = configure = util.run (options, cb) ->
  # Runtime modules.
  project = require '../lib/project.coffee'
  user    = require '../lib/user.coffee'

  # Fail if the project is already configured.
  if project.app? then return cb 'This project is already configured'

  # Prompt the user for app, environment, and datalink selection.
  async.series [
    project.selectApp
    project.selectDLC
  ], (err) ->
    if err then return cb err # Continue with error.

    # Save app, environment, and datalink selection in project file.
    logger.debug 'Writing project file %s', chalk.cyan config.paths.project # Debug.
    fs.writeFileSync config.paths.project, JSON.stringify {
      app : project.app.id
      dlc : project.dlc.id
      environment: project.environment.id
    }
    cb() # Continue.

# Register the command.
program
  .command     'config'
  .description 'set project options'
  .action      configure