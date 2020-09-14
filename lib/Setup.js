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

const cloneDeep = require('lodash.clonedeep');
const { Errors } = require('./Constants');
const KinveyError = require('./KinveyError');
const { getDefaultIdentityProvider, isEmpty, isNullOrUndefined, readJSONSync, validateActiveItemType, writeJSON } = require('./Utils');

/**
 * Keeps information about CLI configuration (e.g. saved profiles).
 */
class Setup {
  constructor(path) {
    this._path = path;
    this._profiles = {};
    this._activeItemsFirstLevel = {};
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
      active: this._activeItemsFirstLevel,
      profiles: this._profiles
    };

    writeJSON({ file: this._path, data }, done);
  }

  getProfiles() {
    return cloneDeep(this._profiles);
  }

  addProfile(name, email, token, host, identityProvider) {
    this._profiles[name] = {
      email,
      token,
      host,
      identityProvider
    };
  }

  setProfileToken(name, token) {
    if (isNullOrUndefined(this.findProfileByName(name))) {
      throw new KinveyError(Errors.ProfileNotFound);
    }

    this._profiles[name].token = token;
  }

  deleteProfile(name) {
    const activeProfile = this.getActiveProfile();
    if (activeProfile && activeProfile.name === name) {
      delete this._activeItemsFirstLevel.profile;
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

    // it could occur because of profiles created before 5.0.1
    if (isEmpty(profile.identityProvider)) {
      profile.identityProvider = getDefaultIdentityProvider();
    }

    return Object.assign({ name }, profile);
  }

  _setActiveItems(activeItems = {}) {
    this._activeItemsFirstLevel = activeItems;
  }

  hasActiveProfile() {
    return !isEmpty(this._activeItemsFirstLevel) && this._activeItemsFirstLevel.profile;
  }

  getActiveProfile() {
    if (!this.hasActiveProfile()) {
      return null;
    }

    const activeProfileName = this._activeItemsFirstLevel.profile;
    const activeProfile = this.findProfileByName(activeProfileName);
    if (!isNullOrUndefined(activeProfile)) {
      activeProfile.name = activeProfileName;
    }

    return activeProfile;
  }

  setActiveProfile(profile) {
    this._activeItemsFirstLevel.profile = profile;
  }

  /**
   * Gets specific active item at the profile name. If profile cannot be found or it does not contain any active items,
   * returns null. Throws if itemType is not supported.
   * @param {Constants.ActiveItemType} itemType
   * @param {String} profileName
   * @returns {*}
   */
  getActiveItemProfileLevel(itemType, profileName) {
    validateActiveItemType(itemType);

    const profile = this.findProfileByName(profileName);
    if (isNullOrUndefined(profile)) {
      return null;
    }

    if (!profile.active) {
      return null;
    }

    return profile.active[itemType];
  }

  setActiveItemProfileLevel(itemType, item, profileName) {
    const profile = this.findProfileByName(profileName);
    if (isNullOrUndefined(profile)) {
      throw new KinveyError(Errors.ProfileNotFound);
    }

    validateActiveItemType(itemType);

    if (!item || !Object.prototype.hasOwnProperty.call(item, 'id')) {
      throw new KinveyError('Item must have an id.');
    }

    if (isNullOrUndefined(this._profiles[profileName].active) || isEmpty(this._profiles[profileName].active)) {
      this._profiles[profileName].active = {};
    }

    this._profiles[profileName].active[itemType] = {
      id: item.id
    };
  }
}

module.exports = Setup;
