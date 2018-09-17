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

const fs = require('fs');
const path = require('path');

const async = require('async');

const { AllowedServiceTypesForExport, BackendServiceType, ConfigFiles, LogLevel } = require('../Constants');
const { getObjectByOmitting, getObjectByPicking, isEmpty, isNullOrUndefined } = require('../Utils');

class ServiceFileExporter {
  constructor(options) {
    this.cliManager = options.cliManager;
    this.servicesService = options.servicesService;
    this._baseExport = {
      schemaVersion: '1.0.0',
      configType: 'service'
    };
  }

  exportService(options, done) {
    const serviceId = options.serviceId;
    let service;
    let svcEnvs;

    async.series([
      (next) => {
        this.servicesService.getById(serviceId, (err, data) => {
          if (err) {
            return done(err);
          }

          service = data;
          const isSupported = AllowedServiceTypesForExport.includes(service.type);
          if (!isSupported) {
            return setImmediate(() => { next(new Error(`Type is not supported: ${service.type}.`)); });
          }

          next();
        });
      },
      (next) => {
        this.servicesService.getServiceEnvs(serviceId, (err, data) => {
          if (err) {
            return done(err);
          }

          svcEnvs = data;
          next();
        });
      }
    ], (err) => {
      if (err) {
        return done(err);
      }

      const exportData = ServiceFileExporter._getExportData(service, svcEnvs);
      const result = Object.assign({}, this._baseExport, exportData);
      delete result.name;
      const filepath = path.resolve(options.file);

      this.cliManager.log(LogLevel.DEBUG, `Writing configuration to file: ${filepath}`);
      try {
        fs.writeFileSync(filepath, JSON.stringify(result, null, 4));
      } catch (ex) {
        return done(ex);
      }

      done(null, result);
    });
  }

  static _getExportData(service, svcEnvs) {
    const environments = {};
    const canExportHost = service.type !== BackendServiceType.FLEX_INTERNAL;

    if (!isEmpty(svcEnvs)) {
      svcEnvs.forEach((x) => {
        const exportedEnv = getObjectByOmitting(x, ['id', 'mapping', 'name']);
        if (!canExportHost || isNullOrUndefined(x.host)) {
          delete exportedEnv.host;
        }

        const envMapping = Object.assign({}, x.mapping);
        if (!isEmpty(envMapping)) {
          const serviceObjectNames = Object.keys(envMapping);
          serviceObjectNames.forEach((serviceObjName) => {
            delete envMapping[serviceObjName].backingServer;
            if (envMapping[serviceObjName].sourceObject) {
              // sometimes sourceObject contains more props than needed (e.g. IDs), so let's just take some
              const sourceObjProps = ['objectName', 'schemaName', 'objectType', 'primaryKey', 'name', 'endpoint',
                'contextRoot', 'httpMethod', 'primaryKey', 'queryMapping', 'querystring', 'headers', 'composedPrimaryKeys'];
              envMapping[serviceObjName].sourceObject = getObjectByPicking(envMapping[serviceObjName].sourceObject, sourceObjProps);
            }
          });

          exportedEnv.mapping = envMapping;
        }

        environments[x.name] = exportedEnv;
      });
    }

    const exportData = {
      type: ConfigFiles.BackendToConfigServiceType[service.type],
      name: service.name
    };

    if (service.description) {
      exportData.description = service.description;
    }

    exportData.environments = environments;

    return exportData;
  }
}

module.exports = ServiceFileExporter;
