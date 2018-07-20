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
const { AppOptionsName, ConfigType, DomainTypes, EntityType, FlexOptionsNames, OperationType, OrgOptionsName } = require('../Constants');
const KinveyError = require('../KinveyError');
const ServiceFileExporter = require('./../exporter/ServiceFileExporter');
const { isNullOrUndefined } = require('../Utils');

class ServicesController extends BaseController {
  constructor(options) {
    super(options);
    this.options = options;
    this.applicationsService = options.applicationsService;
    this.organizationsService = options.organizationsService;
  }

  static getCommandResult(operationType, service) {
    const rawData = { id: service.id };
    const cmdResult = new CommandResult().setBasicMsg(operationType, EntityType.SERVICE, service.id);

    if (!isNullOrUndefined(service.jobId)) {
      rawData.jobId = service.jobId;
      cmdResult.setAdditionalMsg(`Job ID: ${service.jobId}`);
    }

    cmdResult.setRawData(rawData);
    return cmdResult;
  }

  create(options, done) {
    let domainType;
    let domainId;

    async.series([
      (next) => {
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
          this.organizationsService.getByIdOrName(options[OrgOptionsName.ORG], (err, data) => {
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
      const cmdResult = ServicesController.getCommandResult(OperationType.CREATE, result);
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

      const cmdResult = ServicesController.getCommandResult(OperationType.UPDATE, data);
      done(null, cmdResult);
    });
  }

  exportService(options, done) {
    const srvFileExporter = new ServiceFileExporter(this.options, options);
    srvFileExporter.exportService((err, data) => {
      if (err) {
        return done(err);
      }

      const cmdRes = new CommandResult()
        .setRawData(data)
        .setBasicMsg(OperationType.EXPORT, EntityType.SERVICE, options[FlexOptionsNames.SERVICE_ID]);
      done(null, cmdRes);
    });
  }
}

module.exports = ServicesController;
