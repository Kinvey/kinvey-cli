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
path = require 'path'

# Package modules.
osHomedir = require 'os-homedir'

# Exports.
module.exports =
  host: 'https://manage.kinvey.com'

  # Default schema for apps.
  defaultSchemaVersion: 1

  # Project archive settings.
  artifacts     : [ '.git/', '.svn/', 'node_modules/' ]
  maxUploadSize : 10 * 1024 * 1024 # 10 MB

  # Timeouts.
  timeout       :  5 * 1000 # 5s
  uploadTimeout : 30 * 1000 # 30s

  # Paths.
  paths:
    project : path.join process.cwd(), '.kinvey'             # <projectDir>/<project>
    session : path.join osHomedir(),   '.kinvey-dlc-session' # ~/<session>