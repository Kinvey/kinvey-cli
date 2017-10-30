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
        this.setActiveItems(globalSetup.active);
        this.setProfiles(globalSetup.profiles);
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
    delete this._profiles[name];
  }

  setProfiles(profiles = {}) {
    this._profiles = profiles;
  }

  hasProfiles() {
    return !isEmpty(this._profiles)
  }

  findProfileByName(name) {
    if (!this.hasProfiles()) {
      return null;
    }

    return this._profiles[name];
  }

  setActiveItems(activeItems = {}) {
    this._activeItems = activeItems;
  }

  hasActiveProfile() {
    return !isEmpty(this._activeItems) && this._activeItems.profile;
  }

  getActiveProfile() {
    if (!this.hasActiveProfile()) {
      return null;
    }

    return this.findProfileByName(this._activeItems.profile);
  }

  setActiveProfile(profile) {
    this._activeItems.profile = profile;
  }
}

module.exports = Setup;
