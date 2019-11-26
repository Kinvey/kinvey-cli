/**
 * Copyright (c) 2018, Kinvey, Inc. All rights reserved.
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
  PROFILE: 'profile',
  SERVICE: 'service',
  SITE: 'website'
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
    CREATE: 'create',
    UPDATE: 'update',
    SHOW: 'show'
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
  FLEX_SHOW: `${Constants.Namespace.FLEX} ${Constants.SubCommand[Constants.Namespace.FLEX].SHOW}`,
  FLEX_UPDATE: `${Constants.Namespace.FLEX} ${Constants.SubCommand[Constants.Namespace.FLEX].UPDATE}`,
  ENV_SHOW: `${Constants.Namespace.ENV} ${Constants.SubCommand[Constants.Namespace.ENV].SHOW}`,
  ENV_DELETE: `${Constants.Namespace.ENV} ${Constants.SubCommand[Constants.Namespace.ENV].DELETE}`
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
    alias: 'noPrompt',
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
  BAAS_HOST: 'baas',
  EMAIL: 'email',
  PASSWORD: 'password',
  TWO_FACTOR_AUTH_TOKEN: '2fa',
  PROFILE: 'profile',
  HOST: 'instance-id'
};

Constants.ExportOptionsNames = {
  FILE: 'file'
};

Constants.ExportOptions = {
  [Constants.ExportOptionsNames.FILE]: {
    global: false,
    describe: 'Path to file',
    required: true,
    type: 'string'
  }
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
  SERVICE_ID: 'service',
  DOMAIN_TYPE: 'domain',
  DOMAIN_ID: 'id',
  FROM: 'from',
  TO: 'to',
  PAGE: 'page',
  NUMBER: 'number',
  JOB_ID: 'id',
  SERVICE_SECRET: 'secret',
  SVC_ENV: 'env',
  ENV_VARS_REPLACE: 'replace-vars',
  ENV_VARS_SET: 'set-vars',
  ENV_VARS: 'vars',
  RUNTIME: 'runtime'
};

const flexEnvVarsSyntaxDescription = 'Specify either as comma-separated list of key-value pairs (key1=value1,key2=value2) or in JSON format.';

Constants.CLIRuntime = {
  NODE6: 'node6',
  NODE8: 'node8',
  NODE10: 'node10',
  NODE12: 'node12'
};

Constants.AllowedCLIRuntimes = [
  Constants.CLIRuntime.NODE6,
  Constants.CLIRuntime.NODE8,
  Constants.CLIRuntime.NODE10,
  Constants.CLIRuntime.NODE12
];

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
  [Constants.FlexOptionsNames.SVC_ENV]: {
    global: false,
    describe: 'Service environment name/ID',
    type: 'string'
  },
  [Constants.FlexOptionsNames.ENV_VARS_REPLACE]: {
    global: false,
    describe: `Environment variables (replaces all already existing). ${flexEnvVarsSyntaxDescription}`,
    alias: 'replaceVars'
  },
  [Constants.FlexOptionsNames.ENV_VARS_SET]: {
    global: false,
    describe: `Environment variables to set. ${flexEnvVarsSyntaxDescription}`,
    alias: 'setVars'
  },
  [Constants.FlexOptionsNames.ENV_VARS]: {
    global: false,
    describe: `Environment variables. ${flexEnvVarsSyntaxDescription}`,
    alias: Constants.FlexOptionsNames.ENV_VARS_SET
  },
  [Constants.FlexOptionsNames.RUNTIME]: {
    global: false,
    describe: 'Runtime environment',
    type: 'string',
    choices: Constants.AllowedCLIRuntimes
  }
};

Constants.APIRuntime = {
  NODE6: 'flex-runtime-node6',
  NODE8: 'flex-runtime-node8',
  NODE10: 'flex-runtime-node10',
  NODE12: 'flex-runtime-node12'
};

Constants.CLIRuntimeToAPIRuntime = {
  [Constants.CLIRuntime.NODE6]: Constants.APIRuntime.NODE6,
  [Constants.CLIRuntime.NODE8]: Constants.APIRuntime.NODE8,
  [Constants.CLIRuntime.NODE10]: Constants.APIRuntime.NODE10,
  [Constants.CLIRuntime.NODE12]: Constants.APIRuntime.NODE12
};

Constants.APIRuntimeToCLIRuntime = {
  [Constants.APIRuntime.NODE6]: Constants.CLIRuntime.NODE6,
  [Constants.APIRuntime.NODE8]: Constants.CLIRuntime.NODE8,
  [Constants.APIRuntime.NODE10]: Constants.CLIRuntime.NODE10,
  [Constants.APIRuntime.NODE12]: Constants.CLIRuntime.NODE12
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

Constants.ServiceOptionsNames = {
  SVC_ENV: 'svcEnv'
};

Constants.ServiceOptions = {
  [Constants.ServiceOptionsNames.SVC_ENV]: {
    global: false,
    describe: 'Service environment name/ID',
    type: 'string'
  }
};

Constants.SitesOptionsNames = {
  SITE: 'website',
  DOMAIN_NAME: 'domainName',
  INDEX_PAGE: 'indexPage',
  ERROR_PAGE: 'errorPage',
  ROUTING: 'historyApiRouting',
  FORCE: 'force'
};

Constants.SitesOptions = {
  [Constants.SitesOptionsNames.SITE]: {
    global: false,
    describe: 'Website ID/name',
    type: 'string',
    demandOption: true
  },
  [Constants.SitesOptionsNames.DOMAIN_NAME]: {
    global: false,
    describe: 'Domain name',
    type: 'string',
    demandOption: true
  },
  [Constants.SitesOptionsNames.INDEX_PAGE]: {
    global: false,
    describe: 'Index page',
    type: 'string',
    demandOption: false
  },
  [Constants.SitesOptionsNames.ERROR_PAGE]: {
    global: false,
    describe: 'Error page',
    type: 'string',
    demandOption: false
  },
  [Constants.SitesOptionsNames.ROUTING]: {
    global: false,
    describe: 'Enable server support for History API routing',
    type: 'boolean',
    demandOption: false,
    default: false
  },
  [Constants.SitesOptionsNames.FORCE]: {
    global: false,
    describe: 'Force execution (skip client-side validation)',
    type: 'boolean',
    demandOption: false,
    default: false
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
  INPUT_PROFILE: 'Profile name (stores connection settings)',
  INPUT_OVERRIDE_PROFILE: 'Override profile?',
  INPUT_DOMAIN: 'Would you like to select a service from a Kinvey app or org?',
  INPUT_APP: 'Which app would you like to use?',
  INPUT_ORG: 'Which organization would you like to use?',
  INPUT_SPECIFIC_SERVICE: 'Which service would you like to use?',
  INPUT_SPECIFIC_SVC_ENV: 'Which service environment would you like to use?',
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
  BUILDING: 'BUILDING',
  DEPLOYING: 'DEPLOYING',
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
  DeploymentVersionTooLow: {
    NAME: 'DeploymentVersionTooLow'
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
  AppOrOrgRequired: {
    NAME: 'AppOrOrgRequired',
    MESSAGE: `Either '--${Constants.AppOptionsName.APP}' or '--${Constants.OrgOptionsName.ORG}' option must be set.`
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
  TooManyEntitiesFound: {
    NAME: 'TooManyFound',
    MESSAGE: 'Too many entities found.'
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
  NoScvEnvFound: {
    NAME: 'NoScvEnvFound',
    MESSAGE: 'You have no service environments yet.'
  },
  NoSiteEnvFound: {
    NAME: 'NoSiteEnvFound',
    MESSAGE: 'You have no site environments yet.'
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
  PUT: 'PUT',
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
  SAVE: 'save',
  EXPORT: 'export'
};

Constants.OperationMessage = {
  [Constants.OperationType.CREATE]: 'Created',
  [Constants.OperationType.UPDATE]: 'Updated',
  [Constants.OperationType.DELETE]: 'Deleted',
  [Constants.OperationType.ACTIVATE]: 'Active',
  [Constants.OperationType.SAVE]: 'Saved',
  [Constants.OperationType.EXPORT]: 'Exported'
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
  INTERNAL_FLEX_SERVICE: 'internal flex service',
  SCV_ENV: 'service environment',
  SITE: 'website'
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

Constants.CollectionHook = {
  onPreSave: 'pre-save',
  onPreFetch: 'pre-fetch',
  onPreDelete: 'pre-delete',
  onPostSave: 'post-save',
  onPostFetch: 'post-fetch',
  onPostDelete: 'post-delete'
};

Constants.AllowedCollectionHooks = Object.keys(Constants.CollectionHook);

Constants.EndpointFieldNames = ['name', 'code', 'host', 'sdkHandlerName', 'schedule'];

/**
 * Defines types of configuration files.
 * @readonly
 * @enum {string} ConfigType
 */
Constants.ConfigType = {
  APP: 'application',
  ENV: 'environment',
  ORG: 'organization',
  SERVICE: 'service'
};

/**
 * Defines basic permissions for a collection as defined in a config file.
 * @readonly
 * @enum {string} BasicCollectionPermission
 */
Constants.BasicCollectionPermission = {
  PRIVATE: 'private',
  FULL: 'full',
  SHARED: 'shared',
  READ_ONLY: 'read-only'
};

Constants.AllowedBasicCollPermissions = Object.keys(Constants.BasicCollectionPermission).map(x => Constants.BasicCollectionPermission[x]);

Constants.AllowedRolesPermissions = ['always', 'grant', 'entity', 'never'];

/**
 * Defines a mapping from basic collection permissions as defined in a config file to backend collection permissions.
 * @readonly
 * @enum {string} BackendCollectionPermission
 */
Constants.BackendCollectionPermission = {
  [Constants.BasicCollectionPermission.PRIVATE]: 'append-only',
  [Constants.BasicCollectionPermission.FULL]: 'write',
  [Constants.BasicCollectionPermission.SHARED]: 'append-read',
  [Constants.BasicCollectionPermission.READ_ONLY]: 'read-only'
};

/**
 * Defines permissions operations on a collection.
 * @readonly
 * @enum {string} PermissionsOperation
 */
Constants.PermissionsOperation = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete'
};

Constants.AllowedPermissionsOperations = [Constants.PermissionsOperation.CREATE, Constants.PermissionsOperation.READ, Constants.PermissionsOperation.UPDATE, Constants.PermissionsOperation.DELETE];

Constants.ConfigFiles = {};

Constants.ConfigFiles.FILE_REFERENCE_PREFIX = 'file::';

Constants.ConfigFiles.CollType = {
  INTERNAL: 'internal',
  EXTERNAL: 'external'
};

Constants.ConfigFiles.ServiceType = {
  FLEX_INTERNAL: 'flex-internal',
  FLEX_EXTERNAL: 'flex-external',
  REST: 'rest',
  SP: 'sharepoint',
  SF: 'salesforce',
  SQL: 'mssql',
  PROGRESS_DATA: 'progressData',
  DATA_DIRECT: 'dataDirect',
  POKIT_DOK: 'rapid-health'
};

Constants.BackendServiceType = {
  FLEX_INTERNAL: 'internal',
  FLEX_EXTERNAL: 'external',
  REST: 'rest',
  SP: 'sharepoint',
  SF: 'salesforce',
  SQL: 'mssql',
  PROGRESS_DATA: 'progressDataObject'
};

Constants.ConfigFiles.BaseConfigType = {
  DATA_DIRECT: 'dataDirect',
  POKIT_DOK: 'pokitDok'
};

Constants.AllowedServiceTypesToApply = Object.keys(Constants.ConfigFiles.ServiceType).map(x => Constants.ConfigFiles.ServiceType[x]);
Constants.AllowedServiceTypesForExport = Object.keys(Constants.BackendServiceType).map(x => Constants.BackendServiceType[x]);

Constants.ConfigFiles.BackendToConfigServiceType = {
  [Constants.BackendServiceType.FLEX_INTERNAL]: Constants.ConfigFiles.ServiceType.FLEX_INTERNAL,
  [Constants.BackendServiceType.FLEX_EXTERNAL]: Constants.ConfigFiles.ServiceType.FLEX_EXTERNAL,
  [Constants.BackendServiceType.REST]: Constants.ConfigFiles.ServiceType.REST,
  [Constants.BackendServiceType.SP]: Constants.ConfigFiles.ServiceType.SP,
  [Constants.BackendServiceType.SF]: Constants.ConfigFiles.ServiceType.SF,
  [Constants.BackendServiceType.SQL]: Constants.ConfigFiles.ServiceType.SQL,
  [Constants.BackendServiceType.PROGRESS_DATA]: Constants.ConfigFiles.ServiceType.PROGRESS_DATA
};

Constants.ConfigFiles.ConfigToBackendServiceType = {
  [Constants.ConfigFiles.ServiceType.FLEX_INTERNAL]: Constants.BackendServiceType.FLEX_INTERNAL,
  [Constants.ConfigFiles.ServiceType.FLEX_EXTERNAL]: Constants.BackendServiceType.FLEX_EXTERNAL,
  [Constants.ConfigFiles.ServiceType.REST]: Constants.BackendServiceType.REST,
  [Constants.ConfigFiles.ServiceType.SP]: Constants.BackendServiceType.SP,
  [Constants.ConfigFiles.ServiceType.SF]: Constants.BackendServiceType.SF,
  [Constants.ConfigFiles.ServiceType.SQL]: Constants.BackendServiceType.SQL,
  [Constants.ConfigFiles.ServiceType.PROGRESS_DATA]: Constants.BackendServiceType.PROGRESS_DATA,
  [Constants.ConfigFiles.ServiceType.DATA_DIRECT]: Constants.BackendServiceType.REST,
  [Constants.ConfigFiles.ServiceType.POKIT_DOK]: Constants.BackendServiceType.REST
};

Constants.ConfigFiles.AllowedCollTypes = [Constants.ConfigFiles.CollType.INTERNAL, Constants.ConfigFiles.CollType.EXTERNAL];

module.exports = Constants;
