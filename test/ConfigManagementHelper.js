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

const path = require('path');

const async = require('async');
const clonedeep = require('lodash.clonedeep');
const moment = require('moment');

const ApiService = require('./ApiService');
const TestsHelper = require('./TestsHelper');
const { writeJSON } = require('./../lib/Utils');

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

env.buildExternalCollection = function buildExternalCollection(serviceName, serviceObject, collName, permissions) {
  collName = collName || TestsHelper.randomStrings.collName();
  permissions = permissions || 'shared';

  return {
    name: collName,
    type: 'external',
    permissions,
    service: serviceName,
    serviceObject
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

function passConfigFileToCli(cmd, configContent, filePath, done) {
  async.series([
    (next) => {
      writeJSON(filePath, configContent, next);
    },
    (next) => {
      TestsHelper.execCmdWoMocks(cmd, null, (err, data) => {
        if (err) {
          return next(err);
        }

        const parsedData = JSON.parse(data);
        const id = parsedData.result.id;
        next(null, id);
      });
    }
  ], (err, results) => {
    if (err) {
      return done(err);
    }

    done(null, results.pop());
  });
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

const service = {};
service.createPackageJsonForFlexProject = function createPackageJsonForFlexProject(pkgJson, done) {
  if (!pkgJson) {
    return setImmediate(done);
  }

  const projectPath = path.join(process.cwd(), 'test/integration-no-mock/flex-project');
  writeJSON(path.join(projectPath, 'package.json'), pkgJson, done);
};

service.createFromConfig = function createServiceFromConfig(serviceName, serviceConfig, serviceDomain, appOrOrgIdentifier, pkgJson, done) {
  async.series([
    (next) => {
      service.createPackageJsonForFlexProject(pkgJson, next);
    },
    (next) => {
      const fileName = `${TestsHelper.randomStrings.plainString(10)}.json`;
      const filePath = path.join(TestsHelper.ConfigFilesDir, fileName);
      const cmd = `service create ${serviceName} ${filePath} --${serviceDomain} ${appOrOrgIdentifier} --output json`;
      passConfigFileToCli(cmd, serviceConfig, filePath, next);
    }
  ], (err, results) => {
    done(err, results.pop());
  });
};

service.modifyFromConfig = function modifyServiceFromConfig(serviceId, serviceConfig, pkgJson, done) {
  async.series([
    (next) => {
      service.createPackageJsonForFlexProject(pkgJson, next);
    },
    (next) => {
      const fileName = `${TestsHelper.randomStrings.plainString(10)}.json`;
      const filePath = path.join(TestsHelper.ConfigFilesDir, fileName);
      const cmd = `service push ${serviceId} ${filePath} --output json`;
      passConfigFileToCli(cmd, serviceConfig, filePath, next);
    }
  ], (err, results) => {
    done(err, results.pop());
  });
};

service.assertFlexService = function assertFlexService(id, serviceConfig, serviceName, done) {
  ApiService.services.get(id, (err, actual) => {
    if (err) {
      return done(err);
    }

    expect(serviceName).to.equal(actual.name);
    expect(serviceConfig.description).to.equal(actual.description);

    const isFlexInternal = serviceConfig.type === 'flex-internal';
    const expectedType = isFlexInternal ? 'internal' : 'external';
    expect(expectedType).to.equal(actual.type);

    expect(actual.backingServers).to.be.an.array;
    expect(actual.backingServers[0]).to.exist;
    expect(serviceConfig.secret).to.equal(actual.backingServers[0].secret);

    if (isFlexInternal) {
      expect(actual.backingServers[0].host).to.exist;
    } else {
      expect(serviceConfig.host).to.equal(actual.backingServers[0].host);
    }

    done();
  });
};

service.assertFlexServiceStatus = function assertFlexServiceStatus(id, expectedVersion, expectedStatus, done) {
  ApiService.services.status(id, (err, actual) => {
    if (err) {
      return done(err);
    }

    try {
      expect(actual.version).to.exist;
      expect(expectedVersion).to.equal(actual.version);
      if (expectedStatus) {
        expect(actual.status).to.equal(expectedStatus);
      }
    } catch (ex) {
      return done(ex);
    }

    done();
  });
};

service.assertFlexServiceStatusRetryable = function assertFlexServiceStatusRetryable(id, expectedVersion, expectedStatus, done) {
  async.retry(
    { times: 10, interval: 6000 },
    (next) => {
      service.assertFlexServiceStatus(id, expectedVersion, expectedStatus, next);
    },
    done
  );
};

ConfigManagementHelper = {
  app,
  env,
  roles,
  service,
  common: {
    buildConfigEntityFromList
  }
};

module.exports = ConfigManagementHelper;
