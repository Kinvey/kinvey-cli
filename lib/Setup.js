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

const cloneDeep = require('lodash.clonedeep');
const { isEmpty, isNullOrUndefined, readJSONSync, writeJSON } = require('./Utils');

/**
 * Keeps information about CLI configuration (e.g. saved profiles).
 */
class Setup {
  constructor(path) {
    this._path = path;
    this._profiles = {};
    this._activeItems = {};
  }

  load() {
    try {
      const globalSetup = readJSONSync(this._path);
      if (!isEmpty(globalSetup)) {
        this._setActiveItems(globalSetup.active);
        this._setProfiles(globalSetup.profiles);
      }
    } catch (ex) {
      return ex;
    }
  }

  save(done) {
    const data = {
      active: this._activeItems,
      profiles: this._profiles
    };

    writeJSON(this._path, data, done);
  }

  getProfiles() {
    return cloneDeep(this._profiles);
  }

  addProfile(name, email, token, host) {
    this._profiles[name] = {
      email,
      token,
      host
    };
  }

  deleteProfile(name) {
    const activeProfile = this.getActiveProfile();
    if (activeProfile && activeProfile.name === name) {
      delete this._activeItems.profile;
    }

    delete this._profiles[name];
  }

  _setProfiles(profiles = {}) {
    this._profiles = profiles;
  }

  hasProfiles() {
    return !isEmpty(this._profiles);
  }

  findProfileByName(name) {
    if (!this.hasProfiles()) {
      return null;
    }

    const profile = this._profiles[name];
    if (isEmpty(profile)) {
      return null;
    }

    return Object.assign({}, profile);
  }

  _setActiveItems(activeItems = {}) {
    this._activeItems = activeItems;
  }

  hasActiveProfile() {
    return !isEmpty(this._activeItems) && this._activeItems.profile;
  }

  getActiveProfile() {
    if (!this.hasActiveProfile()) {
      return null;
    }

    const activeProfileName = this._activeItems.profile;
    const activeProfile = this.findProfileByName(activeProfileName);
    if (!isNullOrUndefined(activeProfile)) {
      activeProfile.name = activeProfileName;
    }

    return activeProfile;
  }

  setActiveProfile(profile) {
    this._activeItems.profile = profile;
  }
}

module.exports = Setup;
