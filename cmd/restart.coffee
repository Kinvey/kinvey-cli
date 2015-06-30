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
program = require 'commander'

# Local modules.
dlc     = require '../lib/dlc.coffee'
project = require '../lib/project.coffee'
user    = require '../lib/user.coffee'

# Entry point for the restart command.
module.exports = restart = (options, cb) ->
  # Set-up.
  user.restore()
  project.restore()

  # Restart the DLC.
  dlc.restart()

  # Done.
  cb()

# Register the command.
module.exports = program
  .command     'restart'
  .description 'restart the containers that host the Data Link Connector'
  .action      restart