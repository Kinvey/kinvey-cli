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
    this._flexNamespace = {};
  }

  save(done) {
    const data = {
      flex: this._flexNamespace
    };

    writeJSON(this._path, data, done);
  }

  load() {
    try {
      const projectSetup = readJSONSync(this._path);
      if (!isEmpty(projectSetup)) {
        this._flexNamespace = projectSetup.flex;
      }
    } catch (err) {
      return err;
    }
  }

  isFlexConfigured() {
    return !isEmpty(this._flexNamespace) && !isNullOrUndefined(this._flexNamespace.serviceId) && !isNullOrUndefined(this._flexNamespace.schemaVersion);
  }

  getFlexNamespace() {
    return Object.assign({}, this._flexNamespace);
  }

  setFlexNamespace({ domain, domainEntityId, serviceId, serviceName, schemaVersion }) {
    this._flexNamespace = {
      domain,
      domainEntityId,
      serviceId,
      serviceName,
      schemaVersion
    };
  }

  clearFlexNamespace() {
    this._flexNamespace = null;
  }
}

module.exports = ProjectSetup;
