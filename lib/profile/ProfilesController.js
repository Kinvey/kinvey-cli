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

const BaseController = require('../BaseController');
const { AuthOptionsNames, EntityType, Errors, LogLevel, OperationType } = require('../Constants');
const CommandResult = require('../CommandResult');
const KinveyError = require('../KinveyError');
const { getItemError, isEmpty, isMFATokenError, isNullOrUndefined } = require('../Utils');

/**
 * Handles the 'profile' namespace.
 */
class ProfilesController extends BaseController {
  /**
   * Handles the command for profile creation without prompts.
   * @param options
   * @param done
   */
  create(options, done) {
    const profileName = options.name;
    this.cliManager.createProfile(profileName, options[AuthOptionsNames.EMAIL], options[AuthOptionsNames.PASSWORD], null, options[AuthOptionsNames.HOST], (err) => {
      if (isMFATokenError(err)) {
        this.cliManager.log(LogLevel.WARN, 'Two-factor authentication token is required. Please use \'kinvey init\' to create a profile.');
      }

      if (err) {
        return done(err);
      }

      const cmdResult = new CommandResult()
        .setRawData({ id: profileName })
        .setBasicMsg(OperationType.CREATE, EntityType.PROFILE);
      done(null, cmdResult);
    });
  }

  /**
   * Handles the 'list' command to get and print all saved profiles.
   * @param options
   * @param done
   */
  list(options, done) {
    const profiles = this.cliManager.getProfiles();

    const keys = Object.keys(profiles);
    const data = [];
    keys.forEach((k) => {
      data.push({
        profile: k,
        host: profiles[k].host
      });
    });

    const cmdResult = new CommandResult().setRawData(data);
    done(null, cmdResult);
  }

  /**
   * Handles the 'show' command to get a specific profile and print detailed info.
   * @param {Object} options
   * @param done
   * @returns {*}
   */
  show(options, done) {
    let profile;
    const wantedProfile = options.name;
    const showActiveProfile = isNullOrUndefined(wantedProfile);
    if (showActiveProfile) {
      profile = this.cliManager.getActiveProfile();
    } else {
      profile = this.cliManager.findProfile(wantedProfile);
    }

    if (isEmpty(profile)) {
      const msg = showActiveProfile ? 'Active profile is not set.' : Errors.ProfileNotFound.MESSAGE;
      const err = new KinveyError(Errors.ProfileNotFound.NAME, msg);
      return done(err);
    }

    done(null, new CommandResult().setRawData(profile));
  }

  /**
   * Handles the 'delete' command.
   * @param {Object} options
   * @param done
   * @returns {*}
   */
  deleteProfile(options, done) {
    const activeProfile = this.cliManager.getActiveProfile();
    const profileName = options.name || (activeProfile && activeProfile.name);
    if (isNullOrUndefined(profileName)) {
      return setImmediate(() => { done(getItemError(EntityType.PROFILE)); });
    }

    if (!this.cliManager.profileExists(profileName)) {
      const err = new KinveyError(Errors.ProfileNotFound);
      return done(err);
    }

    this.cliManager.deleteProfile(profileName, (err) => {
      if (err) {
        return done(err);
      }

      const cmdResult = new CommandResult()
        .setRawData({ id: profileName })
        .setBasicMsg(OperationType.DELETE, EntityType.PROFILE);
      done(null, cmdResult);
    });
  }

  /**
   * Handles the 'use' command - sets the active profile.
   * @param options
   * @param done
   */
  use(options, done) {
    const profileName = options.name;
    this.cliManager.setActiveProfile(profileName, (err) => {
      if (err) {
        return done(err);
      }

      const cmdResult = new CommandResult()
        .setRawData({ id: profileName })
        .setBasicMsg(OperationType.ACTIVATE, EntityType.PROFILE);
      done(null, cmdResult);
    });
  }
}

module.exports = ProfilesController;
