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

const EOL = require('os').EOL;

const async = require('async');
const isempty = require('lodash.isempty');
const request = require('request');

let authToken;

function getAuthToken(done) {
  if (authToken) {
    return setImmediate(() => { done(null, authToken); });
  }

  authenticate(null, null, (err, result) => {
    if (err) {
      return done(err);
    }

    done(null, result.token);
  });
}

function getBaseUrl() {
  let instance = process.env.KINVEY_CLI_INSTANCE;
  if (instance && instance.includes('localhost')) {
    return instance;
  }

  if (!instance) {
    instance = 'kvy-us1';
  }

  return `https://${instance}-manage.kinvey.com`;
}

const baseUrl = getBaseUrl();

function getIdPartFromId(id) {
  return id === null || id === undefined ? '' : `/${id}`;
}

function getSchemaVersion() {
  return '/v2';
}

function buildUrl(relativeUrl, id) {
  const url = `${baseUrl}${getSchemaVersion()}/${relativeUrl}${getIdPartFromId(id)}`;
  return url;
}

function getProcessedError(err, response) {
  const isSuccess = !err && response && response.statusCode >= 200 && response.statusCode < 300;
  if (isSuccess) {
    return null;
  }

  if (err) {
    return err;
  }

  // status is not 2xx
  if (response.body) {
    let errMsg = response.body.description || response.body.debug;
    const errors = response.body.errors;
    if (!isempty(errors) && Array.isArray(errors)) {
      errors.forEach((x) => {
        const field = x.field ? `Field: ${x.field}.` : '';
        errMsg += `${EOL}\t${field} ${x.message}`;
      });
    }

    return new Error(`${response.body.code} ${errMsg}`);
  }

  return new Error(`${response.statusCode} ${response.statusMessage}`);
}

function setAuthorizationHeader(options, done) {
  if (options.skipAuth) {
    delete options.skipAuth;
    return setImmediate(done);
  }

  if (options.headers && options.headers.Authorization) {
    return setImmediate(done);
  }

  options.headers = options.headers || {};

  getAuthToken((err, token) => {
    if (err) {
      return done(err);
    }

    options.headers.Authorization = `Kinvey ${token}`;
    done();
  });
}

function makeRequest(options, done) {
  async.series([
    (next) => {
      setAuthorizationHeader(options, next);
    },
    (next) => {
      options.json = true;
      request(options, (err, response) => {
        const errResult = getProcessedError(err, response);
        if (errResult) {
          return next(errResult);
        }

        next(null, response);
      });
    }
  ], (err, results) => {
    if (err) {
      return done(err);
    }

    done(null, results.pop().body);
  });
}

function authenticate(email, password, done) {
  email = email || process.env.KINVEY_CLI_EMAIL;
  password = password || process.env.KINVEY_CLI_PASSWORD;

  const body = {
    email,
    password
  };

  makeRequest(
    {
      body,
      url: `${baseUrl}/session`,
      method: 'POST',
      skipAuth: true
    },
    (err, result) => {
      if (err) {
        return done(err);
      }

      authToken = result.token;

      done(null, result);
    }
  );
}

const apps = {
  get: (id, done) => {
    const url = buildUrl('applications', id);
    makeRequest({ url }, done);
  },
  create: (body, done) => {
    const url = buildUrl('apps');
    makeRequest({ url, body, method: 'POST' }, done);
  }
};

const colls = {
  get: (envId, collName, done) => {
    const url = buildUrl(`environments/${getIdPartFromId(envId)}/collections`, collName);
    makeRequest({ url }, done);
  }
};

const envs = {
  get: (id, done) => {
    const url = buildUrl('environments', id);
    makeRequest({ url }, done);
  }
};

const orgs = {
  get: (id, done) => {
    const url = buildUrl('organizations', id);
    makeRequest({ url }, done);
  }
};

module.exports = {
  apps,
  colls,
  envs,
  orgs,
  general: {
    authenticate,
    makeRequest
  }
};