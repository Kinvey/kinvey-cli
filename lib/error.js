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

const config = require('config');

const errors = {
  ConnectionError: {
    message: 'The connection to the remote host was unsuccessful. Please try again or contact Kinvey support if the problem persists.'
  },
  InvalidConfigUrl: {
    message: 'The configuration URL is invalid. Please use a valid Kinvey instance name or URL.'
  },
  InvalidProject: {
    message: 'This project is not valid. Please implement the kinvey-flex-sdk node module.'
  },
  ProjectNotConfigured: {
    message: 'This project is not configured. Use `kinvey config [instance]` to get started.'
  },
  ProjectMaxFileSizeExceeded: {
    message: `This project is too big to be deployed. The max project size is ${config.maxUploadSize} bytes.`
  },
  ProjectRestoreError: {
    message: 'This project could not be properly restored. Run `kinvey logout` and then `kinvey config [instance]` to get started.'
  },
  RequestError: {
    message: 'There was an error processing your request.'
  },
  NoAppsFound: {
    message: 'You have no apps yet. Head over to the console to create one.'
  },
  NoFlexServicesFound: {
    message: 'You have no eligible Internal Flex Services yet.'
  },
  NoOrgsFound: {
    message: 'You have no organizations yet. Head over to the console to create one.'
  },
  NoServiceHostsFound: {
    message: 'There are no logs for this Internal Flex Service'
  }
};

function KinveyError(name, message) {
  let thisErrorMessage = null;
  if (errors[name]) thisErrorMessage = errors[name].message;
  this.name = name;
  this.message = message || thisErrorMessage;
  this.stack = (new Error).stack;
}

KinveyError.prototype = Object.create(Error.prototype);
KinveyError.prototype.constructor = KinveyError;

module.exports = KinveyError;
