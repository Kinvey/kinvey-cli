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

const { AllowedBasicCollPermissions, AllowedCollectionHooks, AllowedRolesPermissions, CollectionHook,
  ConfigType, ConfigFiles, PermissionsOperation } = require('./Constants');
const KinveyError = require('./KinveyError');

const typeOfCollAndCollHookSchema = Joi.string().valid([ConfigFiles.AllowedCollTypes]).required();
const codeSchema = Joi.string().min(1);
const codeFileSchema = Joi.string().min(6);
const permissionOperationSchema = Joi.string().optional().valid(AllowedRolesPermissions);
const serviceSchemaInEnv = Joi.string()
  .when('type', { is: ConfigFiles.CollType.EXTERNAL, then: Joi.required() })
  .when('type', { is: ConfigFiles.CollType.INTERNAL, then: Joi.forbidden() });
const handlerNameSchema = Joi.string().when('type', { is: ConfigFiles.CollType.INTERNAL, then: Joi.forbidden() });
const collHookAndEndpointSchema = Joi.object().optional().keys(
  {
    type: typeOfCollAndCollHookSchema,
    code: codeSchema,
    codeFile: codeFileSchema,
    service: serviceSchemaInEnv,
    handlerName: handlerNameSchema
  })
  .and('service', 'handlerName')
  .xor('code', 'codeFile');

const collHooksPlainObj = {};
AllowedCollectionHooks.forEach((hook) => { collHooksPlainObj[hook] = collHookAndEndpointSchema; });

const scheduledCodePlainObj = {
  interval: Joi.string().optional().valid(['weekly', 'daily', 'hourly', '30-minutes', '10-minutes', '5-minutes', '1-minute']),
  start: Joi.string().required()
};

const primarySchema = Joi.object().keys({
  version: Joi.any().required().valid('1.0.0'),
  configType: Joi.string().required().valid(ConfigType.ENV)
});

const rgxAnyExceptWhitespace = /\S/;
const rgxCollName = /^[a-zA-Z0-9_\-]{1,123}$/; //eslint-disable-line
const rgxEndpointName = /^[a-zA-Z0-9_-]{2,}$/;

const envSchema = primarySchema.keys({
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
        handlerName: handlerNameSchema
      })
        .and('service', 'handlerName')
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
      collHookAndEndpointSchema
    ),
  scheduledCode: Joi.object({})
    .pattern(
      rgxEndpointName,
      Joi.object().required().keys(scheduledCodePlainObj)
    ),
  roles: Joi.object({})
    .pattern(
      rgxAnyExceptWhitespace,
      Joi.object().keys({
        name: Joi.string().optional().regex(rgxAnyExceptWhitespace),
        description: Joi.string().optional()
      })
    )
});

const serviceSchema = primarySchema.keys(({
  type: Joi.string().required().valid(['flex-internal', 'flex-internal']),
  secret: Joi.string().required().min(2),
  name: Joi.string().optional().min(2),
  description: Joi.string().optional().min(1),
  host: Joi.string().min(1).when('type', { is: 'flex-external', then: Joi.required(), otherwise: Joi.forbidden() }),
  sourcePath: Joi.string().optional().when('type', { is: 'flex-external', then: Joi.forbidden() })
}));

const schemas = {
  [ConfigType.ENV]: envSchema
};

class SchemaValidator {
  static validate(type, value, options, done) {
    const defaultOptions = { abortEarly: false };
    options = options || defaultOptions;

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
