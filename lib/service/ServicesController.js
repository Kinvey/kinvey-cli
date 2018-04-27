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

const async = require('async');

const BaseController = require('../BaseController');
const CommandResult = require('../CommandResult');
const { ActiveItemType, AppOptionsName, CommonOptionsNames, ConfigType, DomainTypes, EntityType, EnvOptionsName, Errors, Mapping, OperationType, OrgOptionsName } = require('../Constants');
const KinveyError = require('../KinveyError');
const { getCommandNameFromOptions, isNullOrUndefined, mapFromSource, sortList } = require('../Utils');

class ServicesController extends BaseController {
  constructor(options) {
    super(options);
    this.applicationsService = options.applicationsService;
    this.organizationsService = options.organizationsService;
  }

  create(options, done) {
    let domainType;
    let domainId;

    async.series([
      (next) => {
        // TODO:
        const appIsSet = !isNullOrUndefined(options[AppOptionsName.APP]);
        const orgIsSet = !isNullOrUndefined(options[OrgOptionsName.ORG]);
        if (appIsSet) {
          domainType = DomainTypes.APP;
          this.applicationsService.getByIdOrName(options[AppOptionsName.APP], (err, data) => {
            if (err) {
              return next(err);
            }

            domainId = data.id;
            next();
          });
        } else if (orgIsSet) {
          domainType = DomainTypes.ORG;
          this.organizationsService.getByIdOrName(options[OrgOptionsName.ORG],  (err, data) => {
            if (err) {
              return next(err);
            }

            domainId = data.id;
            next();
          });
        } else {
          const errMsg = `Either '--${AppOptionsName.APP}' or '--${OrgOptionsName.ORG}' option must be set.`;
          return setImmediate(() => next(new Error(errMsg)));
        }
      },
      (next) => {
        const processOptions = {
          domainId,
          domainType,
          file: options.file,
          name: options.name,
          operation: OperationType.CREATE,
          configType: ConfigType.SERVICE
        };
        this.cliManager.processConfigFile(processOptions, next);
      }
    ], (err, results) => {
      if (err) {
        return done(err);
      }

      const result = results.pop();
      const cmdResult = new CommandResult()
        .setRawData({ id: result.id })
        .setBasicMsg(OperationType.CREATE, EntityType.SERVICE, result.id);
      done(null, cmdResult);
    });
  }

  update(options, done) {
    const processOptions = {
      serviceId: options.serviceId,
      file: options.file,
      operation: OperationType.UPDATE,
      configType: ConfigType.SERVICE
    };

    this.cliManager.processConfigFile(processOptions, (err, data) => {
      if (err) {
        return done(err);
      }

      const cmdResult = new CommandResult()
        .setRawData({ id: data.id })
        .setBasicMsg(OperationType.UPDATE, EntityType.SERVICE);
      done(null, cmdResult);
    });
  }
}

module.exports = ServicesController;
