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

# Entry point for the logs command.
module.exports = logs = (options, cb) ->
  # Set-up.
  user.restore()
  project.restore()
  dlc.restore()

  # Output logs.
  dlc.logs()

  # Done.
  cb()

# Register the command.
module.exports = program
  .command     'logs'
  .description 'display the logs of the DataLink Connector'
  .action      logs