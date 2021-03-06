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
const semver = require('semver');

const BaseService = require('./../BaseService');
const { DomainTypes, EntityType, Errors, FlexProjectMaxSize, HTTPMethod, LogLevel } = require('./../Constants');
const KinveyError = require('./../KinveyError');
const { Endpoints, findAndSortInternalServices, getCustomNotFoundError, getValueFromObject, isArtifact, isEmpty,
  isNullOrUndefined, readJSON } = require('./../Utils');

class ServicesService extends BaseService {
  /**
   * Gets all services for a domain.
   * @param {Object} entity Backend app or org.
   * @param {Boolean} shouldExpand If true, the services envs will be included in the result.
   * @param done
   */
  getAllByDomainType(entity, shouldExpand, done) {
    const query = {};
    if (!isEmpty(entity)) {
      const queryParamName = entity.security ? 'organizationId' : 'appId';
      query[queryParamName] = entity.id;
      if (!isNullOrUndefined(entity.organizationId)) {
        query.organizationId = entity.organizationId;
      }
    }

    if (shouldExpand) {
      query.expand = 'environments';
    }

    const endpoint = Endpoints.services(this.cliManager.config.defaultSchemaVersion);
    this.cliManager.sendRequest({ endpoint, query }, done);
  }

  _getServices(query, shouldExpand, filterPredicate, done) {
    query = query || {}; // eslint-disable-line no-param-reassign

    if (shouldExpand) {
      query.expand = 'environments';
    }

    const endpoint = Endpoints.services(this.cliManager.config.defaultSchemaVersion);
    this.cliManager.sendRequest({ endpoint, query }, (err, allServices) => {
      if (err) {
        return done(err);
      }

      const filteredServices = allServices.filter(filterPredicate);
      done(null, filteredServices);
    });
  }

  /**
   * Gets all services owned by the specified app.
   * @param {String} appId
   * @param {Boolean} shouldExpand If true, the services envs will be included in the result.
   * @param done
   */
  getAllOwnedByApp(appId, shouldExpand, done) {
    const query = { appId };

    const filterPredicate = (x) => {
      const writerApps = getValueFromObject(x, 'access.writers.apps');
      return Array.isArray(writerApps) && writerApps[0] === appId;
    };

    this._getServices(query, shouldExpand, filterPredicate, done);
  }

  /**
   * Gets all services owned by the specified organization.
   * @param orgId
   * @param shouldExpand
   * @param done
   */
  getAllOwnedByOrg(orgId, shouldExpand, done) {
    const query = { organizationId: orgId };

    const filterPredicate = (x) => {
      const writerOrgs = getValueFromObject(x, 'access.writers.organizations');
      return Array.isArray(writerOrgs) && writerOrgs[0] === orgId;
    };

    this._getServices(query, shouldExpand, filterPredicate, done);
  }

  /**
   * Gets all the internal services (sorted) for a domain. Returns error if none found.
   * @param {Object} entity Backend app or org.
   * @param done
   */
  getAllInternalFlexServicesByDomain(entity, done) {
    this.getAllByDomainType(entity, null, (err, data) => {
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

  create(data, done) {
    const endpoint = Endpoints.services(this.cliManager.config.defaultSchemaVersion);
    this.cliManager.sendRequest({ endpoint, data, method: HTTPMethod.POST }, done);
  }

  update(data, id, done) {
    const endpoint = Endpoints.services(this.cliManager.config.defaultSchemaVersion, id);
    this.cliManager.sendRequest({ endpoint, data, method: HTTPMethod.PUT }, done);
  }

  _validateFlexProjectPackageJson(json, serviceId, svcEnvId, schemaVersion, done) {
    if (!json || !json.dependencies || !json.dependencies['kinvey-flex-sdk']) {
      return setImmediate(() => { done(new KinveyError(Errors.InvalidProject)); });
    }

    this.getServiceStatus({ serviceId, schemaVersion, svcEnvId }, (err, data) => {
      if (err) {
        return done(err);
      }

      const currentVersion = json.version;
      let cloudVersion = data.version;
      if (data.deployment && data.deployment.version) {
        cloudVersion = data.deployment.version;
      }

      let errVersion = null;
      try {
        if (cloudVersion && semver.lte(currentVersion, cloudVersion)) {
          const errMsg = `Local version (${currentVersion}) is lower or equal to cloud version (${cloudVersion}).`;
          errVersion = new KinveyError(Errors.DeploymentVersionTooLow.NAME, errMsg);
        }
      } catch (ex) {
        this.cliManager.log(LogLevel.DEBUG, `Local version: '${currentVersion}'. Cloud version: '${cloudVersion}'.`);
      }

      done(errVersion);
    });
  }

  deployFlexProject({ dir, serviceId, svcEnvId, schemaVersion, envVars, runtime }, done) {
    async.waterfall([
      (next) => {
        const packagePath = path.join(dir, 'package.json');
        readJSON(packagePath, next);
      },
      (packageJson, next) => {
        this._validateFlexProjectPackageJson(packageJson, serviceId, svcEnvId, schemaVersion, (err) => {
          if (err) {
            return next(err);
          }

          next(null, packageJson.version);
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

        const params = {
          serviceId,
          serviceEnvironmentId: svcEnvId,
          version: pkgVersion
        };

        if (!isNullOrUndefined(envVars)) {
          params.environmentVariables = envVars;
        }

        if (!isNullOrUndefined(runtime)) {
          params.runtime = runtime;
        }

        const req = this.cliManager.sendRequest({
          method: 'POST',
          endpoint: Endpoints.jobs(schemaVersion),
          headers: {
            'Transfer-Encoding': 'chunked'
          },
          formData: {
            type: 'deployService',
            params: JSON.stringify(params),
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

  getServiceStatus({ serviceId, schemaVersion, svcEnvId }, done) {
    this.cliManager.sendRequest({ endpoint: Endpoints.serviceStatus(schemaVersion, serviceId, svcEnvId) }, done);
  }

  getServiceLogs({ from, to, number, page }, serviceId, svcEnvId, schemaVersion, done) {
    let paramAdded = false;
    let endpoint = Endpoints.serviceLogs(schemaVersion, serviceId, svcEnvId);

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

  execRecycle(schemaVersion, serviceId, svcEnvId, done) {
    const options = {
      endpoint: Endpoints.jobs(schemaVersion),
      method: HTTPMethod.POST,
      data: {
        type: 'recycleService',
        params: {
          serviceId,
          serviceEnvironmentId: svcEnvId
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

  getServiceEnvs(serviceId, done) {
    return this.cliManager.sendRequest({ endpoint: Endpoints.serviceEnvs(this.cliManager.config.defaultSchemaVersion, serviceId) }, done);
  }

  getSpecifiedOrDefaultSvcEnv(serviceId, scvEnvIdentifier, done) {
    this.getServiceEnvs(serviceId, (err, data) => {
      if (err) {
        return done(err);
      }

      if (isEmpty(data)) {
        return done(new KinveyError(Errors.NoScvEnvFound));
      }

      if (!scvEnvIdentifier) {
        if (data.length === 1) {
          done(null, data[0]);
        } else {
          const names = data.reduce((accumulator, x, index, arr) => {
            const separator = arr.length - 1 > index ? ', ' : '';
            return `${accumulator}${x.name}${separator}`;
          }, '');
          done(new KinveyError('TooManySvcEnvs', `You should choose an environment: ${names}`));
        }
      } else {
        const wantedEnv = data.find((x) => {
          return x.id === scvEnvIdentifier || x.name === scvEnvIdentifier;
        });

        if (!wantedEnv) {
          return done(getCustomNotFoundError(EntityType.SCV_ENV, scvEnvIdentifier));
        }

        done(null, wantedEnv);
      }
    });
  }

  createSvcEnv(serviceId, data, done) {
    const options = {
      data,
      endpoint: Endpoints.serviceEnvs(this.cliManager.config.defaultSchemaVersion, serviceId),
      method: HTTPMethod.POST
    };
    return this.cliManager.sendRequest(options, done);
  }

  updateSvcEnv(serviceId, svcEnvId, data, done) {
    const options = {
      data,
      endpoint: Endpoints.serviceEnvs(this.cliManager.config.defaultSchemaVersion, serviceId, svcEnvId),
      method: HTTPMethod.PUT
    };
    return this.cliManager.sendRequest(options, done);
  }
}

module.exports = ServicesService;
