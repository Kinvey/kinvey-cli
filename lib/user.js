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

const async = require('async');
const chalk = require('chalk');
const config = require('config');
const logger = require('./logger.js');
const prompt = require('./prompt.js');
const request = require('./request.js');
const util = require('./util.js');

class User {
  constructor(path) {
    this.token = null;
    this.tokens = {};
    this.host = null;
    this.userPath = path;
  }

  isLoggedIn() {
    if (this.host != null) return (this.tokens != null ? this.tokens[this.host] : null) != null;
    return this.token != null;
  }

  getToken() {
    if (this.host != null) return this.tokens != null ? this.tokens[this.host] : null;
    return this.token;
  }

  login(email, password, token, cb) {
    return async.doUntil((next) => {
      this._loginOnce(email, password, token, next);
      return email = password = null;
    }, () => this.isLoggedIn(), cb);
  }

  logout(cb) {
    logger.debug('Clearing session data from file %s', chalk.cyan(this.userPath));
    return util.writeJSON(this.userPath, '', cb);
  }

  refresh(cb) {
    if ((this.tokens != null) && (this.host != null)) this.tokens[this.host] = null;
    this.token = null;
    return async.series([
      (next) => this.login(null, null, null, next),
      (next) => this.save(next)
    ], (err) => cb(err)
    );
  }

  restore(cb) {
    logger.debug('Restoring session from file %s', chalk.cyan(this.userPath));
    return util.readJSON(this.userPath, (err, data) => {
      // Only load/set host if user has not supplied an override
      if (this.host == null) {
        if (err != null) this.host = config.host;
        else if (data != null && data.host != null) this.host = data.host;
        else this.host = config.host;
      }

      request.Request = request.Request.defaults({
        baseUrl: this.host
      });

      if ((this.host != null) && this.host.indexOf(config.host) === -1) logger.info('host: %s', chalk.cyan(this.host));
      if (data != null && data.tokens != null) this.tokens = data.tokens;

      if (this.tokens != null && this.tokens[this.host] != null) {
        logger.debug('Restored session from file %s', chalk.cyan(this.userPath));
        return cb();
      }

      logger.debug('Failed to restore session from file %s', chalk.cyan(this.userPath));
      return this.refresh(cb);
    });
  }

  save(cb) {
    logger.debug('Saving session to file %s', chalk.cyan(this.userPath));
    return util.writeJSON(this.userPath, {
      tokens: this.tokens,
      host: this.host
    }, cb);
  }

  setup(options, cb) {
    if ((options.email != null) || (options.password != null) || (options.host != null) || (options.token != null)) {
      if (options.host != null) {
        const host = util.formatHost(options.host);
        logger.debug(`Setting host: ${host}`);
        this.host = host;
      } else {
        logger.debug(`Setting host: ${config.host}`);
        this.host = config.host;
      }
      request.Request = request.Request.defaults({
        baseUrl: this.host
      });
      return this.login(options.email, options.password, options.token, cb);
    }

    return this.restore(cb);
  }

  _execLogin(email, password, token, cb) {
    const jsonBody = {
      email,
      password
    };
    if (token != null) jsonBody.twoFactorToken = token;
    return util.makeRequest({
      method: 'POST',
      url: '/session',
      json: jsonBody,
      refresh: false
    }, cb);
  }

  mfaLogin(email, password, token, cb) {
    return async.doUntil((next) => {
      this._mfaLoginOnce(email, password, token, next);
    }, () => this.isLoggedIn(), cb);
  }

  _mfaLoginOnce(email, password, token, cb) {
    return async.waterfall([
      (next) => prompt.getTwoFactorToken(token, next),
      (key, next) => this._execLogin(email, password, key, next)
    ], (err, response) => {
      if (err != null && (err.name === 'InvalidTwoFactorAuth')) {
        logger.warn(err.message);
        return cb();
      } else if (err != null) {
        return cb(err);
      }

      this.completeLogin(response, cb);
    });
  }

  _loginOnce(email, password, token, cb) {
    return async.waterfall([
      (next) => prompt.getEmailPassword(email, password, next),
      (promptEmail, promptPassword, next) => {
        email = promptEmail;
        password = promptPassword;
        this._execLogin(email, password, null, next);
      }
    ], (err, response) => {
      if (err != null && (err.name === 'InvalidTwoFactorAuth')) return this.mfaLogin(email, password, token, cb);
      else if (err != null && (err.name === 'InvalidCredentials' || err.name === 'ValidationError')) {
        return cb();
      } else if (err != null) {
        return cb(err);
      }

      this.completeLogin(response, cb);
    });
  }

  completeLogin(response, cb) {
    logger.info('Welcome back %s', chalk.cyan(response.body.email));
    if (this.host != null) {
      this.tokens[this.host] = response.body.token;
    } else {
      this.token = response.body.token;
    }

    cb();
  }
}

module.exports = new User(config.paths.session);
