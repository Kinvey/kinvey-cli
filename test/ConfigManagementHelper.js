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

const async = require('async');
const clonedeep = require('lodash.clonedeep');
const moment = require('moment');

const ApiService = require('./ApiService');
const TestsHelper = require('./TestsHelper');

let ConfigManagementHelper = {};

const env = {};
env.buildSettings = function buildSettings(options) {
  return {
    emailVerification: {
      auto: false,
      required: false,
      since: moment().add(1, 'days').toISOString()
    },
    apiVersion: 3
  };
};

env.buildInternalCollection = function buildInternalCollection(name, permissions) {
  const collName = name || TestsHelper.randomStrings.collName();
  const collPermissions = permissions || 'shared';

  return {
    name: collName,
    type: 'internal',
    permissions: collPermissions
  };
};

env.buildExternalCollection = function buildExternalCollection(serviceName, handlerName, collName, permissions) {
  collName = collName || TestsHelper.randomStrings.collName();
  permissions = permissions || 'shared';

  return {
    [collName]: {
      type: 'external',
      permissions,
      service: serviceName,
      handlerName
    }
  };
};

env.buildValidInternalCollectionsList = function buildValidInternalCollectionsList(count, addSystemColl) {
  const result = [];
  for (let i = 0; i < count; i += 1) {
    result.push(ConfigManagementHelper.env.buildInternalCollection());
  }

  if (addSystemColl) {
    result.push(ConfigManagementHelper.env.buildInternalCollection('_blob'));
    result.push(ConfigManagementHelper.env.buildInternalCollection('user'));
  }

  return result;
};

function buildConfigEntityFromList(list) {
  const result = {};

  list.forEach((x) => {
    const entityCopy = clonedeep(x);
    const name = entityCopy.name;
    delete entityCopy.name;
    result[name] = entityCopy;
  });

  return result;
}

const app = {};
app.createInTestsOrg = function (data, done) {
  let orgId;
  data = data || {};

  async.series([
    (next) => {
      if (data.organizationId) {
        return setImmediate(next);
      }

      ApiService.orgs.get(null, (err, orgs) => {
        if (err) {
          return next(err);
        }

        const testOrg = orgs.find(x => x.name === 'CliOrg');
        if (!testOrg) {
          return next(new Error('CliOrg not found.'));
        }

        orgId = testOrg.id;
        next();
      });
    },
    (next) => {
      data.name = data.name || TestsHelper.randomStrings.appName();
      data.organizationId = data.organizationId || orgId;
      ApiService.apps.create(data, next);
    }
  ], (err, results) => {
    if (err) {
      return done(err);
    }

    done(null, results.pop());
  });
};

const roles = {};
roles.buildValidRolesList = function buildValidRolesList(count) {
  const result = [];
  for (let i = 0; i < count; i += 1) {
    result.push({
      name: TestsHelper.randomStrings.plainString(6),
      description: `role description ${i}`
    });
  }

  return result;
};

ConfigManagementHelper = {
  app,
  env,
  roles,
  common: {
    buildConfigEntityFromList
  }
};

module.exports = ConfigManagementHelper;
