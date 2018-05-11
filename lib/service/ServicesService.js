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

const path = require('path');

const archiver = require('archiver');
const async = require('async');
const chalk = require('chalk');

const BaseService = require('./../BaseService');
const { EntityType, Errors, FlexProjectMaxSize, HTTPMethod, LogLevel } = require('./../Constants');
const KinveyError = require('./../KinveyError');
const { Endpoints, findAndSortInternalServices, getCustomNotFoundError, isArtifact, isEmpty, readJSON } = require('./../Utils');

class ServicesService extends BaseService {
  /**
   * Gets all services for a domain.
   * @param {Constants.DomainTypes} domainType
   * @param {Object} entity
   * @param {String} entity.id
   * @param {String} [entity.schemaVersion]
   * @param done
   */
  getAllByDomainType(domainType, entity, done) {
    const schemaVersion = entity.schemaVersion || this.cliManager.config.defaultSchemaVersion;
    const endpoint = Endpoints.servicesByDomain(domainType, entity.id, schemaVersion);
    this.cliManager.sendRequest({ endpoint }, done);
  }

  /**
   * Gets all the internal services (sorted) for a domain. Returns error if none found.
   * @param {Constants.DomainTypes} domainType
   * @param {Object} entity
   * @param {String} entity.id
   * @param {String} [entity.schemaVersion]
   * @param done
   */
  getAllInternalFlexServicesByDomain(domainType, entity, done) {
    this.getAllByDomainType(domainType, entity, (err, data) => {
      if (err) {
        return done(err);
      }

      const result = findAndSortInternalServices(data);
      if (isEmpty(result)) {
        return done(new KinveyError(Errors.NoFlexServicesFound));
      }

      done(null, result);
    });
  }

  getById(id, done) {
    this.cliManager.sendRequest({ endpoint: Endpoints.services(this.cliManager.config.defaultSchemaVersion, id) }, done);
  }

  create(data, domainId, domainType, done) {
    const endpoint = Endpoints.servicesByDomain(domainType, domainId, this.cliManager.config.defaultSchemaVersion);
    this.cliManager.sendRequest({ endpoint, data, method: HTTPMethod.POST }, done);
  }

  update(data, id, done) {
    const endpoint = Endpoints.services(this.cliManager.config.defaultSchemaVersion, id);
    this.cliManager.sendRequest({ endpoint, data, method: HTTPMethod.PUT }, done);
  }

  deployFlexProject(dir, serviceId, schemaVersion, done) {
    async.waterfall([
      (next) => {
        const packagePath = path.join(dir, 'package.json');
        readJSON(packagePath, (err, json) => {
          if (!json || !json.dependencies || !json.dependencies['kinvey-flex-sdk']) {
            return next(new KinveyError(Errors.InvalidProject));
          }

          next(err, json.version);
        });
      },
      (pkgVersion, next) => {
        this.cliManager.log(LogLevel.DEBUG, 'Creating archive from %s', chalk.cyan(dir));
        const archive = archiver.create('tar');

        const attachment = {
          value: archive,
          options: {
            filename: 'archive.tar',
            contentType: 'application/tar'
          }
        };

        const req = this.cliManager.sendRequest({
          method: 'POST',
          endpoint: Endpoints.jobs(schemaVersion),
          headers: {
            'Transfer-Encoding': 'chunked'
          },
          formData: {
            type: 'deployDataLink',
            params: JSON.stringify({
              dataLinkId: serviceId,
              version: pkgVersion
            }),
            file: attachment
          },
          timeout: this.cliManager.config.flexProjectUploadTimeout
        }, (err, data) => {
          if (err) {
            return next(err);
          }

          next(null, data.job);
        });

        req.on('pipe', () => req.removeHeader('Content-Length'));

        const maxUploadSize = FlexProjectMaxSize;
        archive.on('data', () => {
          const size = archive.pointer();
          if (size > maxUploadSize) {
            this.cliManager.log(LogLevel.DEBUG, 'Max archive size exceeded (%s bytes, max %s bytes)', chalk.cyan(size), chalk.cyan(maxUploadSize));
            req.emit('error', new KinveyError(Errors.ProjectMaxFileSizeExceeded));
          }
        });

        archive.on('finish', () => this.cliManager.log(LogLevel.DEBUG, 'Created archive, %s bytes written', chalk.cyan(archive.pointer())));

        req.once('error', (err) => {
          this.cliManager.log(LogLevel.DEBUG, 'Aborting the request because of error: %s', chalk.cyan(err.message || err));
          archive.removeAllListeners('finish');
          archive.abort();
          req.abort();
        });

        archive.bulk([
          {
            cwd: dir,
            src: '**/*',
            dest: false,
            dot: true,
            expand: true,
            filter: filepath => !isArtifact(this.cliManager.config.artifacts, dir, filepath)
          }
        ]);

        archive.finalize();
      }
    ], done);
  }

  _getJob(jobId, schemaVersion, done) {
    this.cliManager.sendRequest({ endpoint: Endpoints.jobs(schemaVersion, jobId) }, done);
  }

  jobStatus(jobId, schemaVersion, done) {
    this._getJob(jobId, schemaVersion, (err, data) => {
      if (err) {
        return done(err);
      }

      const statusInfo = {
        status: data.status,
        progress: data.progress,
        jobId: data.jobId
      };

      done(null, statusInfo);
    });
  }

  getServiceStatus({ serviceId, schemaVersion }, done) {
    this.cliManager.sendRequest({ endpoint: Endpoints.serviceStatus(schemaVersion, serviceId) }, done);
  }

  getServiceLogs({ from, to, number, page }, serviceId, schemaVersion, done) {
    let paramAdded = false;
    let endpoint = Endpoints.serviceLogs(schemaVersion, serviceId);

    if (from != null) {
      endpoint += `?from=${from}`;
      paramAdded = true;
    }

    if (to != null) {
      if (paramAdded) {
        endpoint += `&to=${to}`;
      } else {
        endpoint += `?to=${to}`;
        paramAdded = true;
      }
    }

    if (number != null) {
      if (paramAdded) {
        endpoint += `&limit=${number}`;
      } else {
        endpoint += `?limit=${number}`;
        paramAdded = true;
      }
    }

    if (page != null) {
      if (paramAdded) {
        endpoint += `&page=${page}`;
      } else {
        endpoint += `?page=${page}`;
      }
    }

    this.cliManager.sendRequest({ endpoint }, done);
  }

  execRecycle(schemaVersion, serviceId, done) {
    const options = {
      endpoint: Endpoints.jobs(schemaVersion),
      method: HTTPMethod.POST,
      data: {
        type: 'recycleDataLink',
        params: {
          dataLinkId: serviceId
        }
      }
    };

    this.cliManager.sendRequest(options, (err, data) => {
      if (err) {
        return done(err);
      }

      done(null, data.job);
    });
  }

  deleteById(id, done) {
    const endpoint = Endpoints.services(this.cliManager.config.defaultSchemaVersion, id);
    this.cliManager.sendRequest({ endpoint, method: HTTPMethod.DELETE }, done);
  }

  deleteInternalFlexServiceById(id, done) {
    async.series([
      (next) => {
        this.getById(id, (err, service) => {
          if (err) {
            return next(err);
          }

          const isInternalFlex = service && service.type === 'internal';
          if (!isInternalFlex) {
            return setImmediate(() => { next(getCustomNotFoundError(EntityType.INTERNAL_FLEX_SERVICE, id)); });
          }

          next();
        });
      },
      (next) => {
        this.deleteById(id, next);
      }
    ], done);
  }
}

module.exports = ServicesService;
