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

const chalk = require('chalk');

const BaseController = require('../BaseController');
const { AuthOptionsNames, LogLevel, PrintFormat } = require('../Constants');
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
    this.cliManager.createProfile(options.name, options[AuthOptionsNames.EMAIL], options[AuthOptionsNames.PASSWORD], null, options[AuthOptionsNames.HOST], (err) => {
      if (isMFATokenError(err)) {
        this.cliManager.log(LogLevel.WARN, 'Two-factor authentication token is required. Please use \'kinvey init\' to create a profile.');
      }

      this.cliManager.processCommandResult(err, null, done);
    });
  }

  /**
   * Handles the 'list' command to get and print all saved profiles.
   * @param done
   */
  list(done) {
    const profiles = this.cliManager.getProfiles();

    const keys = Object.keys(profiles);
    const profilesCount = keys.length;
    const msgProfilesPart = profilesCount === 1 ? 'profile' : 'profiles';
    this.cliManager.log(LogLevel.INFO, `You have ${profilesCount} ${msgProfilesPart}.\n`);
    const output = [];
    keys.forEach((k) => {
      output.push({
        profile: k,
        host: profiles[k].host
      });
    });

    this.cliManager.print(PrintFormat.TABLE, output);

    this.cliManager.processCommandResult(null, profiles, done);
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
      const msg = showActiveProfile ? 'Active profile is not set.' : `Could not find profile with name '${wantedProfile}'.`;
      this.cliManager.log(LogLevel.INFO, msg);
      return this.cliManager.processCommandResult(null, null, done);
    }

    profile.name = wantedProfile || profile.name;
    this.cliManager.print(PrintFormat.TABLE, profile);
  }

  /**
   * Handles the 'delete' command.
   * @param {String} profileName
   * @param done
   * @returns {*}
   */
  deleteProfile(profileName, done) {
    if (!this.cliManager.profileExists(profileName)) {
      this.cliManager.log(LogLevel.INFO, `Could not find profile with name '${profileName}'.`);
      return this.cliManager.processCommandResult(null, null, done);
    }

    this.cliManager.deleteProfile(profileName, (err) => {
      if (!err) {
        this.cliManager.log(LogLevel.INFO, `Successfully deleted profile with name '${profileName}'.`);
      }

      this.cliManager.processCommandResult(err, null, done);
    });
  }

  /**
   * Handles the 'use' command - sets the active profile.
   * @param profileName
   * @param done
   */
  use(profileName, done) {
    this.cliManager.setActiveProfile(profileName, (err) => {
      this.cliManager.processCommandResult(err, null, done);
    });
  }
}


module.exports = ProfilesController;
