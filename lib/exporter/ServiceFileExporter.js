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

const path = require('path');

const { AllowedServiceTypesForExport, APIRuntimeToCLIRuntime, BackendServiceType, ConfigFiles, LogLevel } = require('../Constants');
const { getObjectByOmitting, getObjectByPicking, isEmpty, isNullOrUndefined, writeConfigFile } = require('../Utils');

class ServiceFileExporter {
  constructor(options) {
    this.cliManager = options.cliManager;
    this.servicesService = options.servicesService;
    this._baseExport = {
      schemaVersion: '1.0.0',
      configType: 'service'
    };
  }

  /**
   * Exports a service to a file. Either options.serviceId or options.service must be specified.
   * @param {Object} options
   * @param {String} options.file Absolute or relative file path.
   * @param {String} [options.serviceId] ID of the service.
   * @param {Object} [options.service] Service data that will be exported.
   * @param done
   */
  exportService(options, done) {
    let service;
    let svcEnvs;

    async.series([
      (next) => {
        if (!isEmpty(options.service)) {
          service = options.service;
          return setImmediate(next);
        }

        this.servicesService.getById(options.serviceId, (err, data) => {
          if (err) {
            return next(err);
          }

          service = data;
          next();
        });
      },
      (next) => {
        const isSupported = AllowedServiceTypesForExport.includes(service.type);
        if (!isSupported) {
          return setImmediate(() => { next(new Error(`Type is not supported: ${service.type}.`)); });
        }

        setImmediate(next);
      },
      (next) => {
        this.servicesService.getServiceEnvs(service.id, (err, data) => {
          if (err) {
            return done(err);
          }

          svcEnvs = data;
          next();
        });
      },
      (next) => {
        const exportData = ServiceFileExporter._getExportData(service, svcEnvs);
        const result = Object.assign({}, this._baseExport, exportData);
        delete result.name;

        const filepath = path.resolve(options.file);
        this.cliManager.log(LogLevel.DEBUG, `Writing configuration to file: ${filepath}`);
        writeConfigFile(filepath, result, next);
      }
    ], (err, results) => {
      if (err) {
        return done(err);
      }

      done(null, results.pop());
    });
  }

  static _getExportData(service, svcEnvs) {
    const environments = {};
    const canExportHost = service.type !== BackendServiceType.FLEX_INTERNAL;

    if (!isEmpty(svcEnvs)) {
      svcEnvs.forEach((x) => {
        const exportedEnv = getObjectByOmitting(x, ['id', 'mapping', 'name', 'runtime']);
        if (!canExportHost || isNullOrUndefined(x.host)) {
          delete exportedEnv.host;
        }

        if (x.runtime) {
          exportedEnv.runtime = APIRuntimeToCLIRuntime[x.runtime] || x.runtime;
        }

        const envMapping = Object.assign({}, x.mapping);
        if (!isEmpty(envMapping)) {
          const serviceObjectNames = Object.keys(envMapping);
          serviceObjectNames.forEach((serviceObjName) => {
            delete envMapping[serviceObjName].serviceEnvironment;
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
      type: ConfigFiles.BackendToConfigServiceType[service.type]
    };

    // Handle special rest-based services
    if (service.baseConfig && service.type === BackendServiceType.REST) {
      if (service.baseConfig === ConfigFiles.BaseConfigType.DATA_DIRECT) {
        exportData.type = ConfigFiles.ServiceType.DATA_DIRECT;
      } else if (service.baseConfig === ConfigFiles.BaseConfigType.POKIT_DOK) {
        exportData.type = ConfigFiles.ServiceType.POKIT_DOK;
      } else {
        // Unknown baseConfig value, fallback to 'rest' and include the actual baseConfig value.
        exportData.type = ConfigFiles.ServiceType.REST;
        exportData.baseConfig = service.baseConfig;
      }
    }

    if (service.description) {
      exportData.description = service.description;
    }

    exportData.environments = environments;

    return exportData;
  }
}

module.exports = ServiceFileExporter;
