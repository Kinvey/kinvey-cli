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
project = require '../lib/project.coffee'
user    = require '../lib/user.coffee'

# Entry point for the deploy command.
module.exports = deploy = (options, cb) ->
  # Set-up.
  user.restore()
  project.restore()
  dlc.restore()

  # Validate, pack, and upload the project package.
  project.validate()
  project.pack()
  project.upload()

  # Done.
  cb()

# Register the command.
program
  .command     'deploy'
  .description 'deploy the current project as a Kinvey-backed Datalink Connector'
  .action      deploy