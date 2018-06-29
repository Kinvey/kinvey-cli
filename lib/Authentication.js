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

const { HTTPMethod, LogLevel } = require('./Constants');
const { Endpoints, isNullOrUndefined } = require('./Utils');

/**
 * Handles authentication: set/unset current user, login/logout.
 */
class Authentication {
  constructor(cliManager) {
    this.cliManager = cliManager;
    this._currentUser = null;
  }

  getCurrentUser() {
    return this._currentUser;
  }

  setCurrentUser({ email, token, host }) {
    this._currentUser = {
      email,
      token,
      host
    };
  }

  hasCurrentUser() {
    return this._currentUser && this._currentUser.token;
  }

  login(email, password, MFAToken, host, done) {
    const data = {
      email,
      password
    };

    if (!isNullOrUndefined(MFAToken)) {
      data.twoFactorToken = MFAToken;
    }

    this.cliManager.sendRequest(
      {
        data,
        host,
        endpoint: Endpoints.session(),
        method: HTTPMethod.POST
      },
      (err, result) => {
        if (err) {
          return done(err, result);
        }

        this.setCurrentUser({
          host,
          email: data.email,
          token: result.token
        });

        done(null, result);
      }
    );
  }

  logout(done) {
    if (!this.hasCurrentUser()) {
      return setImmediate(() => done());
    }

    const options = {
      endpoint: Endpoints.session(),
      method: HTTPMethod.DELETE
    };

    this.cliManager.sendRequest(options, (err) => {
      this._currentUser = null;
      if (!err) {
        this.cliManager.log(LogLevel.DEBUG, 'Logged out current user.');
      }

      done(err);
    });
  }
}

module.exports = Authentication;
