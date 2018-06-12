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

const { Errors, LogLevel, OperationType } = require('./Constants');
const { isNullOrUndefined } = require('./Utils');

class ServiceFileProcessor {
  constructor(options) {
    this.cliManager = options.cliManager;
    this.servicesService = options.servicesService;
  }

  process(options, done) {
    const operationType = options.operation;
    const source = options.parsedData;
    if (operationType === OperationType.CREATE) {
      this._createService(source, options, done);
    } else if (operationType === OperationType.UPDATE) {
      this._updateService(source, options, done);
    } else {
      return setImmediate(() => { done(new Error(`Operation type not supported: ${operationType}`)); });
    }
  }

  _createService(source, options, done) {
    const data = {
      name: options.name,
      type: source.type === 'flex-internal' ? 'internal' : 'external', // TODO: service-config Replace with constants
      backingServers: [{ secret: source.secret }]
    };

    if (!isNullOrUndefined(source.description)) {
      data.description = source.description;
    }

    if (source.type === 'flex-external') {
      data.backingServers[0].host = source.host;
    }

    this.servicesService.create(data, options.domainId, options.domainType, (err, service) => {
      if (err) {
        return done(err);
      }

      const dir = source.sourcePath;
      if (!dir) {
        return done(null, service);
      }

      this.servicesService.deployFlexProject(dir, service.id, this.cliManager.config.defaultSchemaVersion, (err, id) => {
        if (err) {
          return done(err);
        }


        service.jobId = id;
        done(null, service);
      });
    });
  }

  _updateService(source, options, done) {
    const serviceId = options.serviceId;
    let updateData;
    let jobId;

    async.series([
      (next) => {
        this.servicesService.getById(serviceId, (err, originalService) => {
          if (err) {
            return next(err);
          }

          const allBackingServers = originalService.backingServers;
          const defaultOriginalBackingServer = allBackingServers[0];
          const defaultModifiedBackingServer = {
            host: source.host || defaultOriginalBackingServer.host, // can be updated for external
            secret: source.secret || defaultOriginalBackingServer.secret,
            _id: defaultOriginalBackingServer._id // if not passed, a new id is assigned
          };
          allBackingServers[0] = defaultModifiedBackingServer;

          const data = {
            name: source.name || originalService.name,
            type: originalService.type, // cannot be updated but required from the backend,
            backingServers: allBackingServers
          };

          if (!isNullOrUndefined(source.description)) {
            data.description = source.description;
          }

          updateData = data;

          next();
        });
      },
      (next) => {
        this.servicesService.update(updateData, serviceId, next);
      },
      (next) => {
        const dir = source.sourcePath;
        if (!dir) {
          return setImmediate(next);
        }

        this.servicesService.deployFlexProject(dir, serviceId, this.cliManager.config.defaultSchemaVersion, (err, id) => {
          if (err) {
            if (err.name === Errors.DeploymentVersionTooLow.NAME) {
              this.cliManager.log(LogLevel.WARN, `Skipped deploy: ${err.message}`);
              return next();
            }

            return next(err);
          }

          jobId = id;
          next();
        });
      }
    ], (err) => {
      if (err) {
        return done(err);
      }

      done(null, { id: serviceId, jobId });
    });
  }
}

module.exports = ServiceFileProcessor;
