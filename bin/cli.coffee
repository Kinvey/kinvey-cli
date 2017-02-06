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

# Standard lib.
path = require 'path'

# Package modules.
program = require 'commander'

# Local modules.
pkg = require '../package.json'

# Configure.
process.env.NODE_CONFIG_DIR = path.join __dirname, '../config'

# Exports.
module.exports = (args) ->
  # Create the program and set global options.
  program
    .version pkg.version
    .option  '-e, --email <e-mail>',         'e-mail address of your Kinvey account'
    .option  '--host <host>',                'set host of the Kinvey service'
    .option  '-p, --password <password>',    'password of your Kinvey account'
    .option  '-s, --silent',                 'do not output anything'
    .option  '-c, --suppress-version-check', 'do not check for package updates'
    .option  '-v, --verbose',                'output debug messages'

  # Register sub-commands.
  require '../cmd/config'
  require '../cmd/deploy.js'
  require '../cmd/list.js'
  require '../cmd/logout.js'
  require '../cmd/logs.js'
  require '../cmd/recycle.js'
  require '../cmd/status.coffee'
  require '../cmd/job.js'

  # Default action.
  program
    .command '*'
    .description 'display usage information'
    .action () -> program.outputHelp()

  # Run the program.
  program.parse args

  # Display help by default.
  unless args.slice(2).length
    program.outputHelp()