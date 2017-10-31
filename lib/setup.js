const { isEmpty, isNullOrUndefined, readJSONSync, writeJSON } = require('./utils');

// TODO: think about validation
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
    // not cool
    return this._profiles;
  }

  addProfile(name, email, token, host) {
    this._profiles[name] = {
      email: email,
      token: token,
      host: host
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
    return !isEmpty(this._profiles)
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
    if (activeProfile) {
      activeProfile.name = activeProfileName;
    }

    return activeProfile;
  }

  setActiveProfile(profile) {
    this._activeItems.profile = profile;
  }
}

module.exports = Setup;
