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

const EOL = require('os').EOL;

const Joi = require('joi');

const { AllowedBasicCollPermissions, AllowedCollectionHooks, AllowedRolesPermissions, AllowedServiceTypesToApply,
  AllowedCLIRuntimes, ConfigType, ConfigFiles, PermissionsOperation } = require('./Constants');
const KinveyError = require('./KinveyError');

const typeOfCollAndCollHookSchema = Joi.string().valid([ConfigFiles.AllowedCollTypes]).required();
const codeSchema = Joi.string().min(1);
const codeFileSchema = Joi.string().min(6);
const permissionOperationSchema = Joi.string().optional().valid(AllowedRolesPermissions);
const serviceSchemaInEnv = Joi.string()
  .when('type', { is: ConfigFiles.CollType.EXTERNAL, then: Joi.required() })
  .when('type', { is: ConfigFiles.CollType.INTERNAL, then: Joi.forbidden() });
const svcEnvSchemaInEnv = Joi.string()
  .when('type', { is: ConfigFiles.CollType.EXTERNAL, then: Joi.required() })
  .when('type', { is: ConfigFiles.CollType.INTERNAL, then: Joi.forbidden() });
const handlerNameSchema = Joi.string().when('type', { is: ConfigFiles.CollType.INTERNAL, then: Joi.forbidden() });

// TODO: config-management Find a way to require code or codeFile if type is internal
const collHookSchema = Joi.object().optional().keys(
  {
    type: typeOfCollAndCollHookSchema,
    code: codeSchema,
    codeFile: codeFileSchema,
    service: serviceSchemaInEnv,
    serviceEnvironment: svcEnvSchemaInEnv,
    handlerName: handlerNameSchema
  })
  .and('service', 'handlerName')
  .without('code', ['codeFile']);

const collHooksPlainObj = {};
AllowedCollectionHooks.forEach((hook) => { collHooksPlainObj[hook] = collHookSchema; });

const endpointSchema = Joi.object().optional().keys(
  {
    type: typeOfCollAndCollHookSchema,
    code: codeSchema,
    codeFile: codeFileSchema,
    service: serviceSchemaInEnv,
    serviceEnvironment: svcEnvSchemaInEnv,
    handlerName: handlerNameSchema,
    schedule: Joi.object().optional().keys({
      start: Joi.string().required(),
      interval: Joi.string().optional().valid(['weekly', 'daily', 'hourly', '30-minutes', '10-minutes', '5-minutes', '1-minute'])
    })
  })
  .and('service', 'handlerName')
  .without('code', ['codeFile']);


const primarySchema = Joi.object().keys({
  schemaVersion: Joi.any().required().valid('1.0.0'),
  configType: Joi.string().required().valid(ConfigType.APP, ConfigType.ENV, ConfigType.ORG, ConfigType.SERVICE)
});

const rgxAnyExceptWhitespace = /\S/;
const rgxCollName = /^[a-zA-Z0-9_\-]{1,123}$/; //eslint-disable-line
const rgxEndpointName = /^[a-zA-Z0-9_-]{2,}$/;

const envSchemaKeys = {
  settings: Joi.object().optional().keys({
    apiVersion: Joi.number().optional(),
    name: Joi.string().optional(),
    emailVerification: Joi.object().optional().keys({
      auto: Joi.boolean().optional(),
      required: Joi.boolean().required(),
      since: Joi.string().optional()
    })
  }),
  collections: Joi.object({})
    .pattern(
      rgxCollName,
      Joi.object().keys({
        type: typeOfCollAndCollHookSchema,
        name: Joi.string().optional().regex(rgxCollName),
        permissions: Joi.alternatives().required().try(
          Joi.string().valid(AllowedBasicCollPermissions),
          Joi.object().keys({}).pattern(
            rgxAnyExceptWhitespace,
            Joi.object().required().keys({
              [PermissionsOperation.CREATE]: permissionOperationSchema,
              [PermissionsOperation.READ]: permissionOperationSchema,
              [PermissionsOperation.UPDATE]: permissionOperationSchema,
              [PermissionsOperation.DELETE]: permissionOperationSchema
            }))
        ),
        service: serviceSchemaInEnv,
        serviceEnvironment: svcEnvSchemaInEnv,
        serviceObject: handlerNameSchema
      })
        .and('service', 'serviceObject')
    ),
  commonCode: Joi.object({})
    .pattern(
      /^[a-zA-Z0-9_-]{2,}$/,
      Joi.object().keys({
        code: codeSchema,
        codeFile: codeFileSchema
      })
        .xor('code', 'codeFile')
    ),
  collectionHooks: Joi.object({})
    .pattern(
      rgxCollName,
      Joi.object().required().keys(collHooksPlainObj)
    ),
  customEndpoints: Joi.object({})
    .pattern(
      rgxEndpointName,
      endpointSchema
    ),
  roles: Joi.object({})
    .pattern(
      rgxAnyExceptWhitespace,
      Joi.object().keys({
        name: Joi.string().optional().regex(rgxAnyExceptWhitespace),
        description: Joi.string().optional()
      })
    ),
  groups: Joi.object({})
    .pattern(
      rgxAnyExceptWhitespace,
      Joi.object().keys({
        name: Joi.string().optional().regex(rgxAnyExceptWhitespace),
        description: Joi.string().optional(),
        groups: Joi.any().optional()
      })
    ),
  push: Joi.object().keys({
    android: Joi.object().optional().keys({
      senderId: Joi.string().required().min(2),
      apiKey: Joi.string().required().min(2)
    }),
    ios: Joi.object().optional().keys({
      production: Joi.boolean().required(),
      certificateFilePath: Joi.string().required(),
      password: Joi.string().optional().min(1)
    })
  })
    .or('android', 'ios')
};

const envSchema = primarySchema.keys(envSchemaKeys);

const envSchemaInApp = Joi.object().keys({
  schemaVersion: Joi.any().required().valid('1.0.0')
}).keys(envSchemaKeys)
  .keys({ configType: Joi.string().optional().valid(ConfigType.ENV) });

const rapidBaseSrvSchemaKeys = {
  version: Joi.string().optional(),
  connectionOptions: Joi.object().optional(),
  authentication: Joi.object().optional().keys({
    type: Joi.string().optional().valid(['ServiceAccount', 'ServiceAccountOAuth', 'MIC', 'WindowsServiceAccount', 'None', 'Basic', 'oauthClientCredentials']),
  }).unknown(),
  mapping: Joi.object().optional().pattern(
    rgxAnyExceptWhitespace, // service object name
    Joi.object().keys({
      sourceObject: Joi.object().keys({
        objectName: Joi.string()
      }).unknown(),
      fields: Joi.array().optional(),
      methods: Joi.object().optional().keys({
        getAll: Joi.object(),
        getById: Joi.object(),
        getByQuery: Joi.object(),
        insert: Joi.object(),
        update: Joi.object(),
        deleteById: Joi.object(),
        deleteByQuery: Joi.object(),
        getCount: Joi.object(),
        getCountByQuery: Joi.object()
      })
    })
  )
};

const rapidHealthSrvSchemaKeys = Joi.object().required()
  .pattern(
    rgxAnyExceptWhitespace,
    Joi.object().keys(rapidBaseSrvSchemaKeys)
  );

const rapidSrvEnvsSchema = Joi.object().allow(null)
  .pattern(
    rgxAnyExceptWhitespace,
    Joi.object()
      .keys({ host: Joi.string().required() })
      .keys(rapidBaseSrvSchemaKeys)
  );

const rgxEnvVarKey = /^[_a-z][_a-z0-9]*$/i;
const flexInternalSrvEnvsSchema = Joi.object().allow(null)
  .pattern(
    rgxAnyExceptWhitespace,
    Joi.object().keys({
      secret: Joi.string().required().min(2),
      sourcePath: Joi.string(),
      host: Joi.any().forbidden(),
      description: Joi.string().optional(),
      environmentVariables: Joi.object().allow(null)
        .pattern(
          rgxEnvVarKey,
          Joi.string()
        ),
      runtime: Joi.string().optional().valid(AllowedCLIRuntimes)
    })
  );

const flexExternalSrvEnvsSchema = Joi.object().allow(null)
  .pattern(
    rgxAnyExceptWhitespace,
    Joi.object().keys({
      secret: Joi.string().required().min(2),
      host: Joi.string().required().min(1),
      description: Joi.string().optional()
    })
  );

const serviceSchemaKeys = {
  type: Joi.string().required().valid([AllowedServiceTypesToApply]),
  name: Joi.string().min(2),
  description: Joi.string().optional().min(1),
  environments: Joi.any().allow(null)
    .when('type', { is: ConfigFiles.ServiceType.FLEX_INTERNAL, then: flexInternalSrvEnvsSchema })
    .when('type', { is: ConfigFiles.ServiceType.FLEX_EXTERNAL, then: flexExternalSrvEnvsSchema })
    .when('type', { is: ConfigFiles.ServiceType.SP, then: rapidSrvEnvsSchema })
    .when('type', { is: ConfigFiles.ServiceType.SF, then: rapidSrvEnvsSchema })
    .when('type', { is: ConfigFiles.ServiceType.SAP, then: rapidSrvEnvsSchema })
    .when('type', { is: ConfigFiles.ServiceType.SQL, then: rapidSrvEnvsSchema })
    .when('type', { is: ConfigFiles.ServiceType.REST, then: rapidSrvEnvsSchema })
    .when('type', { is: ConfigFiles.ServiceType.PROGRESS_DATA, then: rapidSrvEnvsSchema })
    .when('type', { is: ConfigFiles.ServiceType.DATA_DIRECT, then: rapidSrvEnvsSchema })
    .when('type', { is: ConfigFiles.ServiceType.POKIT_DOK, then: rapidHealthSrvSchemaKeys })
};

const serviceSchema = primarySchema.keys(serviceSchemaKeys);

const serviceSchemaInAppOrOrg = Joi.object().keys({
  schemaVersion: Joi.any().required().valid('1.0.0')
}).keys(serviceSchemaKeys)
  .keys({ configType: Joi.string().optional().valid(ConfigType.SERVICE) });

const rgxMinTwoCharsNoWhitespaceAtStartAndEnd = /^\S.*\S$/;
const rgxEnvName = rgxMinTwoCharsNoWhitespaceAtStartAndEnd;
const rgxAppName = rgxMinTwoCharsNoWhitespaceAtStartAndEnd;
const appSchemaKeys = {
  settings: Joi.object().optional().keys({
    realtime: Joi.object().optional().keys({
      enabled: Joi.boolean()
    }),
    sessionTimeoutInSeconds: Joi.number().optional()
  }),
  environments: Joi.object({}).optional()
    .pattern(
      rgxEnvName,
      envSchemaInApp
    ),
  services: Joi.object({}).optional()
    .pattern(
      rgxAnyExceptWhitespace,
      serviceSchemaInAppOrOrg
    )
};
const appSchema = primarySchema.keys(appSchemaKeys);
const appInOrgSchema = Joi.object().keys({
  schemaVersion: Joi.any().required().valid('1.0.0')
}).keys(appSchemaKeys)
  .keys({ configType: Joi.string().optional().valid(ConfigType.APP) });

const orgSchema = primarySchema.keys({
  settings: Joi.object().optional().keys({
    security: Joi.object().optional().keys({
      requireApprovals: Joi.boolean().optional(),
      requireEmailVerification: Joi.boolean().optional(),
      requireTwoFactorAuth: Joi.boolean().optional()
    })
  }),
  applications: Joi.object({}).optional()
    .pattern(
      rgxAppName,
      appInOrgSchema
    ),
  services: Joi.object({}).optional()
    .pattern(
      rgxAnyExceptWhitespace,
      serviceSchemaInAppOrOrg
    )
});

const schemas = {
  [ConfigType.APP]: appSchema,
  [ConfigType.ENV]: envSchema,
  [ConfigType.SERVICE]: serviceSchema,
  [ConfigType.ORG]: orgSchema
};

class SchemaValidator {
  static validate(type, value, options, done) {
    const defaultOptions = { abortEarly: false };
    options = options || defaultOptions; // eslint-disable-line no-param-reassign

    schemas[type].validate(value, options, (err) => {
      if (err) {
        let transformedErrMsg = '';
        if (Array.isArray(err.details)) {
          err.details.forEach((d) => {
            const propertyPath = d.path.join('.');
            transformedErrMsg = `${transformedErrMsg}${EOL}\t${propertyPath}: ${d.message}`;
          });

          return done(new KinveyError(err.name, transformedErrMsg));
        }

        return done(err);
      }

      done();
    });
  }
}

module.exports = SchemaValidator;
