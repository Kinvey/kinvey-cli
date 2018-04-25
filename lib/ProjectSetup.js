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

const { isEmpty, isNullOrUndefined, readJSONSync, writeJSON } = require('./Utils');

/**
 * Keeps information about a project's configuration (e.g. service id).
 */
class ProjectSetup {
  constructor(projectPath) {
    this._path = projectPath;
    this._setup = {};
  }

  save(done) {
    const data = this._setup;
    writeJSON(this._path, data, done);
  }

  load() {
    try {
      const projectSetup = readJSONSync(this._path);
      if (!isEmpty(projectSetup)) {
        this._setup = projectSetup;
      }
    } catch (err) {
      return err;
    }
  }

  getFlexNamespace(key) {
    if (isNullOrUndefined(this._setup[key])) {
      return {};
    }

    return Object.assign({}, this._setup[key].flex);
  }

  setFlexNamespace(key, { domain, domainEntityId, serviceId, serviceName, schemaVersion }) {
    this._setup[key] = {
      flex: {
        domain,
        domainEntityId,
        serviceId,
        serviceName,
        schemaVersion
      }
    };
  }

  clear() {
    this._setup = '';
  }

  setJobId(key, id) {
    if (isNullOrUndefined(this._setup[key]) || isNullOrUndefined(this._setup[key].flex)) {
      this._setup[key] = { flex: {} };
    }

    this._setup[key].flex.jobId = id;
  }

  _isPropertySetInFlexNamespace(firstLevelKey, propName) {
    return this._setup && !isEmpty(this._setup[firstLevelKey]) && !isEmpty(this._setup[firstLevelKey].flex)
      && !isNullOrUndefined(this._setup[firstLevelKey].flex[propName]);
  }

  _clearPropertyInFlexNamespace(firstLevelKey, propName) {
    delete this._setup[firstLevelKey].flex[propName];
  }

  isServiceSetInFlexNamespace(firstLevelKey) {
    return this._isPropertySetInFlexNamespace(firstLevelKey, 'serviceId') || this._isPropertySetInFlexNamespace(firstLevelKey, 'serviceName');
  }

  clearServiceInFlexNamespace(firstLevelKey) {
    const keysToRemove = ['serviceId', 'serviceName'];
    keysToRemove.forEach(k => this._clearPropertyInFlexNamespace(firstLevelKey, k));
  }
}

module.exports = ProjectSetup;
