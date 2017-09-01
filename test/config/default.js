/**
 * Copyright (c) 2017, Kinvey, Inc. All rights reserved.
 *
 * This software is licensed to you under the Kinvey terms of service located at
 * http://www.kinvey.com/terms-of-use. By downloading, accessing and/or using this
* software, you hereby accept such terms of service  (and any agreement referenced
* therein) and agree that you have read, understand and agree to be bound by such
* terms of service and are of legal age to agree to such terms with Kinvey.
*
* This software contains valuable confidential and proprietary information of
* KINVEY, INC and is subject to applicable licensing agreements.
* Unauthorized reproduction, transmission or distribution of this file and its
* contents is a violation of applicable laws.
*/

const path = require('path');
const osHomedir = require('os-homedir');

module.exports = {
  host: 'https://manage.kinvey.com/',
  defaultSchemaVersion: 2,
  artifacts: ['.git', '.svn', 'node_modules', 'output.log'],
  maxUploadSize: 10 * 1024 * 1024,
  timeout: 5 * 1000,
  uploadTimeout: 30 * 1000,
  paths: {
    project: path.join(process.cwd(), 'test/integration/project', '.kinvey'),
    package: path.join(process.cwd(), 'test/integration/project'),
    session: path.join(osHomedir(), '.kinvey-cli-session-tests')
  }
};
