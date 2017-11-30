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
  PREFIX: 'KINVEY_CLI_'
};
constants.EnvironmentVariables.USER = `${constants.EnvironmentVariables.PREFIX}EMAIL`;
constants.EnvironmentVariables.PASSWORD = `${constants.EnvironmentVariables.PREFIX}PASSWORD`;
constants.EnvironmentVariables.PROFILE = `${constants.EnvironmentVariables.PREFIX}PROFILE`;
constants.EnvironmentVariables.HOST = `${constants.EnvironmentVariables.PREFIX}HOST`;

constants.AllCommandsNotRequiringAuth = ['init', 'profile create', 'profile list', 'profile show', 'profile delete', 'profile use', 'flex delete'];

constants.AuthOptionsNames = {
  EMAIL: 'email',
  PASSWORD: 'password',
  PROFILE: 'profile',
  HOST: 'host'
};

constants.FlexOptionsNames = {
  SERVICE_ID: 'serviceId',
  DOMAIN_TYPE: 'domain',
  DOMAIN_ID: 'id',
  FROM: 'from',
  TO: 'to',
  PAGE: 'page',
  NUMBER: 'number'
};

constants.FlexOptions = {
  [constants.FlexOptionsNames.SERVICE_ID]: {
    global: false,
    describe: 'Service ID',
    type: 'string'
  },
  [constants.FlexOptionsNames.DOMAIN_TYPE]: {
    global: false,
    describe: 'Specify domain: \'app\' or \'org\'',
    type: 'string'
  },
  [constants.FlexOptionsNames.DOMAIN_ID]: {
    global: false,
    describe: 'ID of app or org',
    type: 'string'
  },
};

constants.PromptTypes = {
  INPUT: 'input',
  LIST: 'list',
  PASSWORD: 'password'
};

constants.PromptMessages = {
  INPUT_EMAIL: 'E-mail',
  INPUT_PASSWORD: 'Password',
  INPUT_MFA_TOKEN: 'Two-factor authentication token',
  INPUT_HOST: 'Host',
  INPUT_PROFILE: 'Profile',
  INPUT_DOMAIN: 'Would you like to select a service from a Kinvey app or org?',
  INPUT_APP: 'Which app would you like to use?',
  INPUT_ORG: 'Which organization would you like to use?',
  INPUT_SPECIFIC_SERVICE: 'Which service would you like to use?',
  INVALID_MFA_TOKEN: 'Please enter a valid 2FA token (6 digits).',
  INVALID_EMAIL_ADDRESS: 'Please enter a valid e-mail address.',
  INVALID_STRING: 'Please provide a non-empty string.'
};

constants.InfoMessages = {
  APP_PROMPTING: 'Prompting for application',
  APP_OR_ORG_PROMPTING: 'Prompting for app or organization',
  ORG_PROMPTING: 'Prompting for organization',
  SERVICE_PROMPTING: 'Prompting for service',
  TWO_FACTOR_TOKEN_PROMPTING: 'Prompting for 2FA token',
  EMAIL_PASSWORD_PROMPTING: 'Prompting for email and/or password'
};

constants.LogErrorMessages = {
  INVALID_TIMESTAMP: 'invalid (ISO-8601 timestamp expected)',
  INVALID_NONZEROINT: 'invalid (non-zero integer expected)'
};

constants.DomainTypes = {
  APP: 'app',
  ORG: 'org'
};

constants.JobStatus = {
  COMPLETE: 'COMPLETE'
};

constants.ServiceStatus = {
  ONLINE: 'ONLINE',
  NEW: 'NEW',
  UPDATING: 'UPDATING',
  ERROR: 'ERROR'
};

constants.FlexProjectMaxSize = 10 * 1024 * 1024;

constants.Errors = {
  ConnectionError: {
    NAME: 'ConnectionError',
    MESSAGE: 'The connection to the remote host was unsuccessful. Please try again or contact Kinvey support if the problem persists.'
  },
  InvalidEmail: {
    NAME: 'InvalidEmail',
    MESSAGE: 'E-mail is invalid.'
  },
  InvalidCredentials: {
    NAME: 'InvalidCredentials',
    MESSAGE: 'Credentials are invalid. Please authenticate.'
  },
  InvalidConfigUrl: {
    NAME: 'InvalidConfigUrl',
    MESSAGE: 'The configuration URL is invalid. Please use a valid Kinvey instance name or URL.'
  },
  InvalidProject: {
    NAME: 'InvalidProject',
    MESSAGE: 'This project is not valid. Please implement the kinvey-flex-sdk node module.'
  },
  ProfileNotFound: {
    NAME: 'ProfileNotFound',
    MESSAGE: 'Profile not found. Please verify profile name exists.'
  },
  ProjectNotConfigured: {
    NAME: 'ProjectNotConfigured',
    MESSAGE: "This project is not configured. Use 'kinvey flex init' to get started."
  },
  ProjectMaxFileSizeExceeded: {
    NAME: 'ProjectMaxFileSizeExceeded',
    MESSAGE: `This project is too big to be deployed. The max project size is ${constants.FlexProjectMaxSize} bytes.`
  },
  ProjectRestoreError: {
    NAME: 'ProjectRestoreError',
    MESSAGE: 'This project could not be properly restored. Run `kinvey flex init` to get started.'
  },
  RequestError: {
    NAME: 'RequestError',
    MESSAGE: 'There was an error processing your request.'
  },
  NoAppsFound: {
    NAME: 'NoAppsFound',
    MESSAGE: 'You have no apps yet. Head over to the console to create one.'
  },
  NoFlexServicesFound: {
    NAME: 'NoFlexServicesFound',
    MESSAGE: 'You have no eligible Internal Flex Services yet.'
  },
  NoOrgsFound: {
    NAME: 'NoOrgsFound',
    MESSAGE: 'You have no organizations yet. Head over to the console to create one.'
  },
  NoServiceHostsFound: {
    NAME: 'NoServiceHostsFound',
    MESSAGE: 'There are no logs for this Internal Flex Service'
  }
};

constants.HTTPMethod = {
  GET: 'GET',
  POST: 'POST',
  DELETE: 'DELETE'
};

constants.HTTPConnectionErrors = ['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'PROTOCOL_CONNECTION_LOST'];

constants.LogLevel = {
  INFO: 'info',
  DEBUG: 'debug',
  ERROR: 'error',
  WARN: 'warn'
};

module.exports = constants;
