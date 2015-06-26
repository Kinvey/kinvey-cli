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
pkg = require '../package.json'

# Create the program and set global options.
program
  .version pkg.version
  .option  '-c, --suppress-version-check', 'do not check for package updates'
  .option  '-e, --email <e-mail>',         'e-mail address of your Kinvey account'
  .option  '-h, --host <host>',            'set host of the Kinvey service'
  .option  '-p, --password <password>',    'password of your Kinvey account'
  .option  '-s, --silent',                 'silent mode: do not output anything'
  .option  '-v, --verbose',                'output debug messages'

# Register sub-commands.
require '../cmd/config.coffee'
require '../cmd/deploy.coffee'
require '../cmd/list.coffee'
require '../cmd/logs.coffee'
require '../cmd/restart.coffee'

# Run the program.
program.parse process.argv

# Display help by default.
unless process.argv.slice(2).length
  program.outputHelp()