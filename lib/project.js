/**
 * Copyright (c) 2017, Kinvey, Inc. All rights reserved.
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
const chalk = require('chalk');
const config = require('config');
const KinveyError = require('./error.js');
const logger = require('./logger.js');
const prompt = require('./prompt');
const util = require('./util.js');

class Project {
  constructor(path) {
    this.app = null;
    this.org = null;
    this.service = null;
    this.serviceName = null;
    this.schemaVersion = null;
    this.lastJobId = null;
    this.projectPath = path;
  }

  config(options, cb) {
    return this.select(cb);
  }

  isConfigured() {
    return (this.service != null) && (this.schemaVersion != null);
  }

  list(cb) {
    this._execKinveyServices((err, services) => {
      if (err != null) return cb(err);
      logger.info('You have %s Kinvey service connectors:', chalk.cyan(services.length));
      services.forEach((service) => {
        const bullet = service.id === this.service ? chalk.green('* ') : '';
        return logger.info('%s%s', bullet, chalk.cyan(service.name));
      });
      logger.info('The service used in this project is marked with *');
      return cb();
    });
  }

  logout(cb) {
    logger.debug('Clearing project configuration from file %s', chalk.cyan(this.projectPath));
    logger.info('Session and project data cleared. Run %s to get started.', chalk.green('kinvey config', chalk.cyan('[instance]')));
    return util.writeJSON(this.projectPath, '', cb);
  }

  restore(cb) {
    logger.debug('Restoring project from file %s', chalk.cyan(this.projectPath));
    return util.readJSON(this.projectPath, (err, data) => {
      if (err != null) return cb(new KinveyError('ProjectRestoreError'));

      if (data != null && data.service != null) {
        logger.debug('Restored project from file %s', chalk.cyan(this.projectPath));
        this.app = data.app;
        this.org = data.org;
        this.service = data.service;
        this.serviceName = data.serviceName;
        this.schemaVersion = data.schemaVersion;
        this.lastJobId = data.lastJobId;
        return cb();
      }
      logger.debug('Failed to restore project from file %s', chalk.cyan(this.projectPath));
      return cb(new KinveyError('ProjectNotConfigured'));
    });
  }

  save(cb) {
    logger.debug('Saving project to file %s', chalk.cyan(this.projectPath));
    return util.writeJSON(this.projectPath, {
      app: this.app,
      org: this.org,
      lastJobId: this.lastJobId,
      service: this.service,
      serviceName: this.serviceName,
      schemaVersion: this.schemaVersion
    }, cb);
  }

  select(cb) {
    return async.series([
      (next) => this._selectAppOrOrg(next),
      (next) => this._selectService(next),
      (next) => this.save(next)
    ], cb);
  }

  setup(options, cb) {
    return this.restore((err) => {
      if (!this.isConfigured()) return this.select(cb);
      return cb(err);
    });
  }

  _execApps(cb) {
    return util.makeRequest({
      url: '/apps'
    }, (err, response) => cb(err, response != null ? response.body : null));
  }

  _execKinveyServices(cb) {
    return this._execServices((err, body) => {
      if (err != null) return cb(err);
      const filteredBody = body.filter((el) => el.type === 'internal');
      filteredBody.sort((x, y) => {
        if (x.name.toLowerCase() < y.name.toLowerCase()) return -1;
        return 1;
      });
      return cb(null, filteredBody);
    });
  }

  _execOrgs(cb) {
    return util.makeRequest({
      url: '/organizations'
    }, (err, response) => cb(err, response != null ? response.body : null));
  }

  _execServices(cb) {
    let entity;
    let resourceType;

    if (this.org != null) {
      resourceType = 'organizations';
      entity = this.org;
    } else {
      resourceType = 'apps';
      entity = this.app;
    }

    return util.makeRequest({
      url: `/v${this.schemaVersion}/${resourceType}/${entity}/data-links`
    }, (err, response) => cb(err, response != null ? response.body : null));
  }

  _selectApp(cb) {
    return async.waterfall([
      (next) => this._execApps(next),
      (apps, next) => {
        if (apps.length === 0) return next(new KinveyError('NoAppsFound'));
        return prompt.getApp(apps, next);
      }
    ], (err, app) => {
      if (app != null) {
        this.org = null;
        this.app = app.id;
        this.schemaVersion = app.schemaVersion || config.defaultSchemaVersion;
      }
      return cb(err);
    });
  }

  _selectAppOrOrg(cb) {
    const options = [
      { name: 'App' },
      { name: 'Organization' }
    ];
    return prompt.getAppOrOrg(options, (err, choice) => {
      if (choice.name === 'App') return this._selectApp(cb);
      return this._selectOrg(cb);
    });
  }

  _selectOrg(cb) {
    return async.waterfall([
      (next) => this._execOrgs(next),
      (orgs, next) => {
        if (orgs.length === 0) return next(new KinveyError('NoOrgsFound'));
        return prompt.getOrg(orgs, next);
      }
    ], (err, org) => {
      if (org != null) {
        this.app = null;
        this.org = org.id;
        this.schemaVersion = 2;
      }
      return cb(err);
    });
  }

  _selectService(cb) {
    return async.waterfall([
      (next) => this._execKinveyServices(next),
      (services, next) => {
        if (services.length === 0) return next(new KinveyError('NoFlexServicesFound'));
        return prompt.getService(services, next);
      }
    ], (err, service) => {
      if (service != null) {
        this.service = service.id;
        this.serviceName = service.name;
      }
      return cb(err);
    });
  }
}

module.exports = new Project(config.paths.project);
