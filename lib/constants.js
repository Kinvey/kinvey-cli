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
const constants = {};

constants.EnvironmentVariables = {
  USER: 'KINVEY_CLI_USER',
  PASSWORD: 'KINVEY_CLI_PASSWORD',
};

constants.PromptMessages = {
  INVALID_MFA_TOKEN: 'Please enter a valid 2FA token (6 digits).',
  INVALID_EMAIL_ADDRESS: 'Please enter a valid e-mail address.',
};

constants.InfoMessages = {
  APP_PROMPTING: 'Prompting for application',
  APP_OR_ORG_PROMPTING: 'Prompting for app or organization',
  ORG_PROMPTING: 'Prompting for organization',
  SERVICE_PROMPTING: 'Prompting for service',
  TWO_FACTOR_TOKEN_PROMPTING: 'Prompting for 2FA token',
  EMAIL_PASSWORD_PROMPTING: 'Prompting for email and/or password'
};

constants.JobStatus = {
  COMPLETE: 'COMPLETE'
};

constants.Errors = {
  ConnectionError: {
    name: 'ConnectionError',
    message: 'The connection to the remote host was unsuccessful. Please try again or contact Kinvey support if the problem persists.'
  },
  InvalidConfigUrl: {
    name: 'InvalidConfigUrl',
    message: 'The configuration URL is invalid. Please use a valid Kinvey instance name or URL.'
  },
  InvalidProject: {
    name: 'InvalidProject',
    message: 'This project is not valid. Please implement the kinvey-flex-sdk node module.'
  },
  ProjectNotConfigured: {
    name: 'ProjectNotConfigured',
    message: 'This project is not configured. Use `kinvey config [instance]` to get started.'
  },
  ProjectMaxFileSizeExceeded: {
    name: 'ProjectMaxFileSizeExceeded',
    message: `This project is too big to be deployed. The max project size is ${config.maxUploadSize} bytes.`
  },
  ProjectRestoreError: {
    name: 'ProjectRestoreError',
    message: 'This project could not be properly restored. Run `kinvey logout` and then `kinvey config [instance]` to get started.'
  },
  RequestError: {
    name: 'RequestError',
    message: 'There was an error processing your request.'
  },
  NoAppsFound: {
    name: 'NoAppsFound',
    message: 'You have no apps yet. Head over to the console to create one.'
  },
  NoFlexServicesFound: {
    name: 'NoFlexServicesFound',
    message: 'You have no eligible Internal Flex Services yet.'
  },
  NoOrgsFound: {
    name: 'NoOrgsFound',
    message: 'You have no organizations yet. Head over to the console to create one.'
  },
  NoServiceHostsFound: {
    name: 'NoServiceHostsFound',
    message: 'There are no logs for this Internal Flex Service'
  }
};

module.exports = constants;
