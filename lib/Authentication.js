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

const http = require('http');
const querystring = require('querystring');

const { HTTPMethod, LogLevel } = require('./Constants');
const Utils = require('./Utils');

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

  _loginWithKinvey({ email, password, host, MFAToken }, done) {
    const data = {
      email,
      password
    };

    if (!Utils.isNullOrUndefined(MFAToken)) {
      data.twoFactorToken = MFAToken;
    }

    this.cliManager.sendRequest(
      {
        data,
        host,
        endpoint: Utils.Endpoints.session(),
        method: HTTPMethod.POST
      },
      done
    );
  }

  _loginWithExternalIdentityProvider({ identityProvider, host }, done) {
    const endpoint = Utils.Endpoints.identityProvidersAuthenticate(this.cliManager.config.defaultSchemaVersion, identityProvider.id);
    const mapiHost = host;
    const redirectHost = 'localhost';
    const redirectPort = this.cliManager.config.redirectServerPort;
    const browserUrl = `${mapiHost}${endpoint}?redirect=http://localhost:${redirectPort}/`;

    let sessionValue;
    let server;

    const reqHandler = function (req, res) {
      const query = req.url.substring(req.url.lastIndexOf('?') + 1);

      const parsedQuery = querystring.parse(query);
      if (!Utils.isNullOrUndefined(parsedQuery.session)) {
        sessionValue = parsedQuery.session;
      }

      res.writeHead(200);
      res.end('OK');

      server.close();
    };

    server = http.createServer(reqHandler);
    server.on('error', (e) => {
      done(e);
    });

    server.on('close', () => {
      this.cliManager.log(LogLevel.DEBUG, 'Server is closing');
      done(null, sessionValue);
    });

    server.on('listening', async () => {
      this.cliManager.log(LogLevel.DEBUG, `Server is running on ${redirectHost}:${redirectPort}`);
      await Utils.openBrowser(browserUrl);
    });

    server.listen({ port: redirectPort, host: redirectHost });
  }

  _login(options, done) {
    if (options.identityProvider.name === 'Kinvey') {
      return this._loginWithKinvey(options, done);
    }

    this._loginWithExternalIdentityProvider(options, (err, token) => {
      if (err) {
        return done(err);
      }

      done(null, { token });
    });
  }

  login(options, done) {
    this._login(options, (err, result) => {
      if (err) {
        return done(err, result);
      }

      this.setCurrentUser({
        host: options.host,
        email: result.email,
        token: result.token
      });

      done(null, result);
    });
  }

  logout(done) {
    if (!this.hasCurrentUser()) {
      return setImmediate(() => done());
    }

    const options = {
      endpoint: Utils.Endpoints.session(),
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
