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

const { AllowedServiceTypesForExport, ConfigFiles, LogLevel } = require('../Constants');
const { isEmpty } = require('../Utils');
const KinveyError = require('../KinveyError');

class ServiceFileExporter {
  constructor(options, exportOptions) {
    this.cliManager = options.cliManager;
    this.servicesService = options.servicesService;
    this._baseExport = {
      schemaVersion: '1.0.0',
      configType: 'service'
    };
    this._setOptions(exportOptions);
  }

  _setOptions(exportOptions) {
    this.serviceId = exportOptions.serviceId;
    this.filepath = path.resolve(exportOptions.file);
    this.dirname = path.dirname(this.filepath);
  }

  exportService(done) {
    let service;
    let exportData;

    this.servicesService.getById(this.serviceId, (err, data) => {
      if (err) {
        return done(err);
      }

      service = data;
      const isSupported = AllowedServiceTypesForExport.includes(service.type);
      if (!isSupported) {
        return setImmediate(() => { done(new Error(`Type is not supported: ${service.type}.`)); });
      }

      const defaultSrvEnv = {};
      if (service.backingServers && !isEmpty(service.backingServers[0])) {
        defaultSrvEnv.secret = service.backingServers[0].secret;
        if (service.type === ConfigFiles.ServiceType.FLEX_EXTERNAL) {
          defaultSrvEnv.host = service.backingServers[0].host;
        }
      }

      exportData = {
        type: ConfigFiles.BackendToConfigServiceType[service.type],
        name: service.name,
        description: service.description
      };

      exportData = Object.assign(exportData, defaultSrvEnv, this._baseExport);

      this.cliManager.log(LogLevel.DEBUG, `Writing configuration to file: ${this.filepath}`);
      try {
        fs.writeFileSync(this.filepath, JSON.stringify(exportData, null, 4));
      } catch (ex) {
        return done(ex);
      }

      done(null, exportData);
    });
  }
}

module.exports = ServiceFileExporter;
