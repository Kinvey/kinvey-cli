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
config = require 'config'

# Local modules.
logger = require './logger.coffee'
pkg    = require '../package.json'

# Enumerate errors.
errors =
  ConnectionError:
    message: 'The connection to the remote host was unsuccessful. Please try again or contact Kinvey support if the problem persists.'
  InvalidConfigUrl:
    message: 'The configuration URL is invalid. Please use a valid Kinvey instance name or URL.'
  InvalidProject:
    message: 'This project is not valid. Please implement the kinvey-flex-sdk node module.'
  ProjectNotConfigured:
    message: "This project is not configured. Use `kinvey config [instance]` to get started."
  ProjectMaxFileSizeExceeded:
    message: "This project is too big to be deployed. The max project size is #{config.maxUploadSize} bytes."
  RequestError:
    message: 'There was an error processing your request.'
  NoAppsFound:
    message: 'You have no apps yet. Head over to the console to create one.'
  NoFlexServicesFound:
    message: 'You have no eligible Internal Flex Services yet.'
  NoOrgsFound:
    message: 'You have no organizations yet. Head over to the console to create one.'
  NoServiceHostsFound:
    message: 'There are no logs for this Internal Flex Service'

# Extend the error class.
KinveyError = (name, message) ->
  this.name    = name
  this.message = message or errors[name]?.message
  this.stack   = (new Error).stack
KinveyError.prototype = Object.create Error.prototype
KinveyError.prototype.constructor = KinveyError

# Exports.
module.exports = KinveyError
