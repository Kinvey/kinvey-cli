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

const Constants = {};

Constants.Namespace = {
  APP: 'app',
  COLL: 'coll',
  ENV: 'appenv',
  FLEX: 'flex',
  ORG: 'org',
  PROFILE: 'profile'
};

Constants.SubCommand = {
  [Constants.Namespace.FLEX]: {
    INIT: 'init',
    DEPLOY: 'deploy',
    JOB: 'job',
    STATUS: 'status',
    LIST: 'list',
    LOGS: 'logs',
    RECYCLE: 'recycle',
    DELETE: 'delete',
    CLEAR: 'clear',
    CREATE: 'create'
  },
  [Constants.Namespace.ENV]: {
    SHOW: 'show',
    DELETE: 'delete'
  }
};

Constants.Command = {
  FLEX_INIT: `${Constants.Namespace.FLEX} ${Constants.SubCommand[Constants.Namespace.FLEX].INIT}`,
  FLEX_DEPLOY: `${Constants.Namespace.FLEX} ${Constants.SubCommand[Constants.Namespace.FLEX].DEPLOY}`,
  FLEX_JOB: `${Constants.Namespace.FLEX} ${Constants.SubCommand[Constants.Namespace.FLEX].JOB}`,
  FLEX_STATUS: `${Constants.Namespace.FLEX} ${Constants.SubCommand[Constants.Namespace.FLEX].STATUS}`,
  FLEX_LIST: `${Constants.Namespace.FLEX} ${Constants.SubCommand[Constants.Namespace.FLEX].LIST}`,
  FLEX_LOGS: `${Constants.Namespace.FLEX} ${Constants.SubCommand[Constants.Namespace.FLEX].LOGS}`,
  FLEX_RECYCLE: `${Constants.Namespace.FLEX} ${Constants.SubCommand[Constants.Namespace.FLEX].RECYCLE}`,
  FLEX_DELETE: `${Constants.Namespace.FLEX} ${Constants.SubCommand[Constants.Namespace.FLEX].DELETE}`,
  FLEX_CLEAR: `${Constants.Namespace.FLEX} ${Constants.SubCommand[Constants.Namespace.FLEX].CLEAR}`,
  FLEX_CREATE: `${Constants.Namespace.FLEX} ${Constants.SubCommand[Constants.Namespace.FLEX].CREATE}`,
  ENV_SHOW: `${Constants.Namespace.ENV} ${Constants.SubCommand[Constants.Namespace.ENV].SHOW}`,
  ENV_DELETE: `${Constants.Namespace.ENV} ${Constants.SubCommand[Constants.Namespace.ENV].DELETE}`,
};

Constants.CommandRequirement = {
  AUTH: 'auth',
  PROFILE_AVAILABLE: 'profile'
};

Constants.EnvironmentVariables = {
  PREFIX: 'KINVEY_CLI_'
};
Constants.EnvironmentVariables.USER = `${Constants.EnvironmentVariables.PREFIX}EMAIL`;
Constants.EnvironmentVariables.PASSWORD = `${Constants.EnvironmentVariables.PREFIX}PASSWORD`;
Constants.EnvironmentVariables.PROFILE = `${Constants.EnvironmentVariables.PREFIX}PROFILE`;
Constants.EnvironmentVariables.HOST = `${Constants.EnvironmentVariables.PREFIX}HOST`;

Constants.AllCommandsNotRequiringAuth = ['init', 'profile create', 'profile list', 'profile show', 'profile delete', 'profile use', 'profile login', 'flex clear'];

Constants.CommonOptionsNames = {
  NO_COLOR: 'no-color',
  NO_PROMPT: 'no-prompt',
  OUTPUT: 'output',
  SILENT: 'silent',
  SUPPRESS_VERSION_CHECK: 'suppress-version-check',
  VERBOSE: 'verbose'
};

Constants.CommonOptions = {
  [Constants.CommonOptionsNames.NO_PROMPT]: {
    global: false,
    describe: 'Do not prompt',
    type: 'boolean',
    default: false
  }
};

Constants.OutputFormat = {
  HUMAN_READABLE: 'default',
  TEXT: 'text',
  JSON: 'json'
};

Constants.AuthOptionsNames = {
  EMAIL: 'email',
  PASSWORD: 'password',
  TWO_FACTOR_AUTH_TOKEN: '2fa',
  PROFILE: 'profile',
  HOST: 'instance-id'
};

Constants.AppOptionsName = {
  APP: 'app'
};

Constants.AppOptions = {
  [Constants.AppOptionsName.APP]: {
    global: false,
    describe: 'App ID/name',
    type: 'string'
  }
};

Constants.CollectionOptionsName = {
  COLL: 'coll'
};

Constants.CollectionOptions = {
  [Constants.CollectionOptionsName.COLL]: {
    global: false,
    describe: 'Collection name',
    type: 'string'
  }
};

Constants.EnvOptionsName = {
  ENV: 'env'
};

Constants.EnvOptions = {
  [Constants.EnvOptionsName.ENV]: {
    global: false,
    describe: 'Env ID/name',
    type: 'string'
  }
};

Constants.FlexOptionsNames = {
  SERVICE_ID: 'serviceId',
  DOMAIN_TYPE: 'domain',
  DOMAIN_ID: 'id',
  FROM: 'from',
  TO: 'to',
  PAGE: 'page',
  NUMBER: 'number',
  JOB_ID: 'id',
  SERVICE_SECRET: 'secret'
};

Constants.FlexOptions = {
  [Constants.FlexOptionsNames.SERVICE_ID]: {
    global: false,
    describe: 'Service ID',
    type: 'string'
  },
  [Constants.FlexOptionsNames.SERVICE_SECRET]: {
    global: false,
    describe: 'Shared secret',
    type: 'string'
  },
  [Constants.FlexOptionsNames.DOMAIN_TYPE]: {
    global: false,
    describe: 'Specify domain: \'app\' or \'org\'',
    type: 'string',
    choices: ['app', 'org']
  },
  [Constants.FlexOptionsNames.DOMAIN_ID]: {
    global: false,
    describe: 'ID of app or org',
    type: 'string'
  },
};

Constants.OrgOptionsName = {
  ORG: 'org'
};

Constants.OrgOptions = {
  [Constants.OrgOptionsName.ORG]: {
    global: false,
    describe: 'Org ID/name',
    type: 'string'
  }
};

Constants.PromptTypes = {
  CONFIRM: 'confirm',
  INPUT: 'input',
  LIST: 'list',
  PASSWORD: 'password'
};

Constants.PromptMessages = {
  INPUT_EMAIL: 'E-mail',
  INPUT_PASSWORD: 'Password',
  INPUT_MFA_TOKEN: 'Two-factor authentication token',
  INPUT_HOST: 'Instance ID (optional)',
  INPUT_PROFILE: 'Profile name',
  INPUT_OVERRIDE_PROFILE: 'Override profile?',
  INPUT_DOMAIN: 'Would you like to select a service from a Kinvey app or org?',
  INPUT_APP: 'Which app would you like to use?',
  INPUT_ORG: 'Which organization would you like to use?',
  INPUT_SPECIFIC_SERVICE: 'Which service would you like to use?',
  INVALID_MFA_TOKEN: 'Please enter a valid 2FA token (6 digits).',
  INVALID_EMAIL_ADDRESS: 'Please enter a valid e-mail address.',
  INVALID_STRING: 'Please provide a non-empty string.'
};

Constants.InfoMessages = {
  APP_PROMPTING: 'Prompting for application',
  APP_OR_ORG_PROMPTING: 'Prompting for app or organization',
  ORG_PROMPTING: 'Prompting for organization',
  SERVICE_PROMPTING: 'Prompting for service',
  TWO_FACTOR_TOKEN_PROMPTING: 'Prompting for 2FA token',
  EMAIL_PASSWORD_PROMPTING: 'Prompting for email and/or password'
};

Constants.LogErrorMessages = {
  INVALID_TIMESTAMP: 'invalid (ISO-8601 timestamp expected)',
  INVALID_NONZEROINT: 'invalid (non-zero integer expected)'
};

/**
 * Defines domain types.
 * @readonly
 * @enum {string} DomainTypes
 */
Constants.DomainTypes = {
  APP: 'app',
  ORG: 'org'
};

Constants.JobStatus = {
  COMPLETE: 'COMPLETE'
};

Constants.ServiceStatus = {
  ONLINE: 'ONLINE',
  NEW: 'NEW',
  UPDATING: 'UPDATING',
  ERROR: 'ERROR'
};

Constants.DeploymentStatus = {
  RUNNING: 'RUNNING',
  ERROR: 'ERROR',
  COMPLETED: 'COMPLETED'
};

Constants.FlexProjectMaxSize = 10 * 1024 * 1024;

/**
 * Defines active item types.
 * @readonly
 * @enum {string} ActiveItemType
 */
Constants.ActiveItemType = {
  APP: 'app',
  ENV: 'env',
  ORG: 'org'
};

Constants.ActiveItemTypes = [Constants.ActiveItemType.APP, Constants.ActiveItemType.ENV, Constants.ActiveItemType.ORG];

Constants.Errors = {
  ConnectionReset: {
    NAME: 'ECONNRESET',
    MESSAGE: 'A connection was forcibly closed by a peer.'
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
  ProfileRequired: {
    NAME: 'ProfileRequired',
    MESSAGE: `Profile is required. Please set active profile or use the --${Constants.AuthOptionsNames.PROFILE} option.`
  },
  AppRequired: {
    NAME: 'AppRequired',
    MESSAGE: `Application is required. Please set active app or use the --${Constants.AppOptionsName.APP} option.`
  },
  EnvRequired: {
    NAME: 'EnvRequired',
    MESSAGE: `Environment is required. Please set active env or use the --${Constants.EnvOptionsName.ENV} option.`
  },
  ProjectNotConfigured: {
    NAME: 'ProjectNotConfigured',
    MESSAGE: `This project is not configured. Use 'kinvey ${Constants.Command.FLEX_INIT}' to get started.`
  },
  ProjectMaxFileSizeExceeded: {
    NAME: 'ProjectMaxFileSizeExceeded',
    MESSAGE: `This project is too big to be deployed. The max project size is ${Constants.FlexProjectMaxSize} bytes.`
  },
  ProjectRestoreError: {
    NAME: 'ProjectRestoreError',
    MESSAGE: 'This project could not be properly restored. Run `kinvey flex init` to get started.'
  },
  RequestError: {
    NAME: 'RequestError',
    MESSAGE: 'There was an error processing your request.'
  },
  RequestTimedOut: {
    NAME: 'ETIMEDOUT',
    MESSAGE: 'Request timed out.'
  },
  NoAppsFound: {
    NAME: 'NoAppsFound',
    MESSAGE: 'You have no apps yet. Head over to the console to create one.'
  },
  NoAppsAndOrgsFound: {
    NAME: 'NoAppsAndOrgsFound',
    MESSAGE: 'You have no apps and orgs yet. Head over to the console to create some.'
  },
  NoEntityFound: {
    NAME: 'NotFound',
    MESSAGE: 'Entity not found.'
  },
  NoFlexServicesFound: {
    NAME: 'NoFlexServicesFound',
    MESSAGE: 'You have no eligible Internal Flex Services yet.'
  },
  NoOrgsFound: {
    NAME: 'NoOrgsFound',
    MESSAGE: 'You have no organizations yet. Head over to the console to create one.'
  },
  NoOrgFound: {
    NAME: 'OrganizationNotFound',
    MESSAGE: 'The specified organization could not be found.'
  },
  NoServiceHostsFound: {
    NAME: 'NoServiceHostsFound',
    MESSAGE: 'There are no logs for this Internal Flex Service'
  },
  NoJobStored: {
    NAME: 'NoJobStored',
    MESSAGE: 'No previous job stored. Please provide a job ID.'
  },
  ItemNotSpecified: {
    NAME: 'ItemNotSpecified',
    MESSAGE: 'No item identifier is specified and/or active item is not set.'
  }
};

Constants.HTTPMethod = {
  GET: 'GET',
  POST: 'POST',
  DELETE: 'DELETE'
};

Constants.HTTPConnectionErrors = ['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'PROTOCOL_CONNECTION_LOST'];

Constants.LogLevel = {
  DATA: 'data',
  DEBUG: 'debug',
  ERROR: 'error',
  INFO: 'info',
  SILENT: 'silent',
  WARN: 'warn'
};

Constants.StderrLogLevels = [
  Constants.LogLevel.DEBUG,
  Constants.LogLevel.ERROR,
  Constants.LogLevel.INFO,
  Constants.LogLevel.WARN
];

/**
 * Defines operation types.
 * @readonly
 * @enum {string} OperationType
 */
Constants.OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  ACTIVATE: 'activate',
  SAVE: 'save'
};

Constants.OperationMessage = {
  [Constants.OperationType.CREATE]: 'Created',
  [Constants.OperationType.UPDATE]: 'Updated',
  [Constants.OperationType.DELETE]: 'Deleted',
  [Constants.OperationType.ACTIVATE]: 'Active',
  [Constants.OperationType.SAVE]: 'Saved'
};

/**
 * Defines entity types.
 * @readonly
 * @enum {string} EntityType
 */
Constants.EntityType = {
  CONFIGURATION: 'configuration',
  PROFILE: 'profile',
  ORG: 'organization',
  APP: 'application',
  ENV: 'environment',
  COLL: 'collection',
  SERVICE: 'service',
  INTERNAL_FLEX_SERVICE: 'internal flex service'
};

Constants.Mapping = {};
Constants.Mapping[Constants.EntityType.ORG] = {
  BASIC: { id: 'id', name: 'name' },
  DETAILS: {
    id: 'id',
    name: 'name',
    plan: 'restrictions.defaultPlanLevel',
    requireApprovals: 'security.requireApprovals',
    requireEmailVerification: 'security.requireEmailVerification',
    requireTwoFactorAuth: 'security.requireTwoFactorAuth'
  }
};
Constants.Mapping[Constants.EntityType.APP] = {
  BASIC: {
    id: 'id',
    name: 'name',
    organizationId: 'organizationId',
    environments: item => (item && item.environments ? item.environments.length : 0)
  }
};
Constants.Mapping[Constants.EntityType.APP].DETAILS = Object.assign(
  {},
  Constants.Mapping[Constants.EntityType.APP].BASIC,
  { plan: 'plan.level' }
);


Constants.Mapping[Constants.EntityType.ENV] = {
  BASIC: {
    id: 'id',
    name: 'name'
  }
};
Constants.Mapping[Constants.EntityType.ENV].DETAILS = Object.assign(
  {},
  Constants.Mapping[Constants.EntityType.ENV].BASIC,
  { appSecret: 'appSecret' }
);

module.exports = Constants;
