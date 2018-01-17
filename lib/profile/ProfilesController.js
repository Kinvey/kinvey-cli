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
const { isEmpty, isMFATokenError, isNullOrUndefined } = require('../Utils');

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
        this.cliManager.log(LogLevel.DEBUG, 'Two-factor authentication token is required. Please use \'kinvey init\' to create a profile.');
      }

      const cmdResult = new CommandResult()
        .setError(err)
        .setRawData({ id: profileName })
        .setBasicMsg(OperationType.CREATE, EntityType.PROFILE);
      this.cliManager.processCommandResult(cmdResult, done);
    });
  }

  /**
   * Handles the 'list' command to get and print all saved profiles.
   * @param done
   */
  list(done) {
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
    this.cliManager.processCommandResult(cmdResult, done);
  }

  /**
   * Handles the 'show' command to get a specific profile and print detailed info.
   * @param {String} [wantedProfile] If not set, uses the active profile.
   * @param done
   * @returns {*}
   */
  show(wantedProfile, done) {
    let profile;
    const showActiveProfile = isNullOrUndefined(wantedProfile);
    if (showActiveProfile) {
      profile = this.cliManager.getActiveProfile();
    } else {
      profile = this.cliManager.findProfile(wantedProfile);
    }

    if (isEmpty(profile)) {
      const msg = showActiveProfile ? 'Active profile is not set.' : Errors.ProfileNotFound.MESSAGE;
      const err = new KinveyError(Errors.ProfileNotFound.NAME, msg);
      return this.cliManager.processCommandResult(new CommandResult().setError(err), done);
    }

    profile.name = wantedProfile || profile.name;
    this.cliManager.processCommandResult(new CommandResult().setRawData(profile), done);
  }

  /**
   * Handles the 'delete' command.
   * @param {String} profileName
   * @param done
   * @returns {*}
   */
  deleteProfile(profileName, done) {
    if (!this.cliManager.profileExists(profileName)) {
      const err = new KinveyError(Errors.ProfileNotFound);
      return this.cliManager.processCommandResult(new CommandResult().setError(err), done);
    }

    this.cliManager.deleteProfile(profileName, (err) => {
      const cmdResult = new CommandResult()
        .setError(err)
        .setRawData({ id: profileName })
        .setBasicMsg(OperationType.DELETE, EntityType.PROFILE);
      this.cliManager.processCommandResult(cmdResult, done);
    });
  }

  /**
   * Handles the 'use' command - sets the active profile.
   * @param profileName
   * @param done
   */
  use(profileName, done) {
    this.cliManager.setActiveProfile(profileName, (err) => {
      const cmdResult = new CommandResult()
        .setError(err)
        .setRawData({ id: profileName })
        .setBasicMsg(OperationType.ACTIVATE, EntityType.PROFILE);
      this.cliManager.processCommandResult(cmdResult, done);
    });
  }
}


module.exports = ProfilesController;
