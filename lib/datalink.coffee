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
config = require 'config'

# Local modules.
pkg     = require '../package.json'
project = require './project.coffee'
user    = require './user.coffee'

# Define the datalink class.
class Datalink

  constructor: (project) ->
    this.project = project

  # Packages the project into a single file.
  pack: (cb) ->
    # TODO

  # Restarts the containers that host the DLC.
  restart: (cb) =>
    this._execRestart cb

  # Validates and uploads the packaged datalink file.
  upload: (file, cb) ->
    if file.length > config.maxUpload then cb new Error 'MaxFileSizeExceeded'
    else this._execUpload attachment, cb # Continue with upload.

  # Validates the project.
  validate: (cb) =>
    unless pkg.dependencies['backend-sdk']
      return cb new Error 'InvalidProject'
    unless this.project.isConfigured()
      return cb new Error 'ProjectNotConfigured'
    cb() # Continue.

  # Executes a POST /apps/:app/datalink/:datalink/restart request.
  _execRestart: (cb) ->
    request.post {
      url     : "/apps/#{this.project.app}/datalinks/#{this.project.datalink}/restart"
      headers : { Authorization: "Kinvey #{user.token}" }
    }, cb

  # Executes a POST /apps/:app/datalink/:datalink/deploy request.
  _execUpload: (file, cb) ->
    request.post {
      url       : "/apps/#{this.project.app}/datalinks/#{this.project.datalink}/deploy"
      headers   : { Authorization: "Kinvey #{user.token}" }
      multipart : [ { body: file } ]
    }, cb

# Exports.
module.exports = new Datalink project