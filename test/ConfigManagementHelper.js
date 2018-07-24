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

const fs = require('fs');
const path = require('path');

const async = require('async');
const clonedeep = require('lodash.clonedeep');
const moment = require('moment');

const ApiService = require('./ApiService');
const { BackendCollectionPermission, CollectionHook } = require('./../lib/Constants');
const TestsHelper = require('./TestsHelper');
const { getObjectByOmitting, isEmpty, writeJSON } = require('./../lib/Utils');

let ConfigManagementHelper = {};

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

env.createFromConfig = function createEnvFromConfig(envName, env, appName, done) {
  const fileName = `${TestsHelper.randomStrings.plainString(10)}.json`;
  const filePath = path.join(TestsHelper.ConfigFilesDir, fileName);
  const cmd = `env create ${envName} ${filePath} --app ${appName} --output json`;
  passConfigFileToCli(cmd, env, filePath, done);
};

env.modifyFromConfig = function modifyEnvFromConfig(config, envIdentifier, appIdentifier, done) {
  const fileName = `${TestsHelper.randomStrings.plainString(10)}.json`;
  const filePath = path.join(TestsHelper.ConfigFilesDir, fileName);
  let cmd = `env push ${filePath} --output json`;
  if (envIdentifier) {
    cmd = `${cmd} ${envIdentifier}`;
  }

  if (appIdentifier) {
    cmd = `${cmd} --app ${appIdentifier}`;
  }

  passConfigFileToCli(cmd, config, filePath, done);
};

env.exportEnv = function (envIdentifier, appIdentifier, done) {
  const fileName = `${TestsHelper.randomStrings.plainString(10)}.json`;
  const filePath = path.join(TestsHelper.ConfigFilesDir, fileName);
  let cmd = `env export ${filePath} --output json`;
  if (envIdentifier) {
    cmd = `${cmd} ${envIdentifier}`;
  }

  if (appIdentifier) {
    cmd = `${cmd} --app ${appIdentifier}`;
  }

  TestsHelper.execCmdWoMocks(cmd, null, (err) => {
    if (err) {
      return done(err);
    }

    fs.readFile(filePath, null, (err, data) => {
      if (err) {
        return done(err);
      }

      done(null, JSON.parse(data));
    });
  });
};

env.assertEnvOnly = function assertEnvOnly(envFromConfig, envId, envName, done) {
  ApiService.envs.get(envId, (err, actualEnv) => {
    if (err) {
      return done(err);
    }

    expect(actualEnv.name).to.equal(envName);

    const envSettings = envFromConfig.settings;
    if (envSettings && envSettings.emailVerification) {
      expect(actualEnv.emailVerification).to.deep.equal(envSettings.emailVerification);
    } else {
      expect(actualEnv).to.not.have.property('emailVerification');
    }

    let expectedApiVersion = 3;
    if (envSettings && envSettings.apiVersion) {
      expectedApiVersion = envSettings.apiVersion;
    }

    expect(actualEnv.apiVersion).to.equal(expectedApiVersion);

    done();
  });
};

env.buildExpectedPermissionsPerColl = function buildExpectedPermissionsPerColl(collList, rolesNameIdPairs) {
  const expectedPermissionsPerColl = {};

  collList.forEach((coll) => {
    let expectedPermissions;
    const collPermissionsInConfig = coll.permissions;
    if (typeof collPermissionsInConfig === 'string') {
      expectedPermissions = BackendCollectionPermission[collPermissionsInConfig];
    } else {
      expectedPermissions = {};
      const rolesNames = Object.keys(collPermissionsInConfig);
      rolesNames.forEach((roleName) => {
        const permissionsPerRole = Object.keys(collPermissionsInConfig[roleName]);
        permissionsPerRole.forEach((permission) => { // e.g. create, update
          if (!expectedPermissions[permission]) {
            expectedPermissions[permission] = [];
          }

          expectedPermissions[permission].push({
            roleId: rolesNameIdPairs[roleName] || 'all-users',
            type: collPermissionsInConfig[roleName][permission]
          });
        });
      });
    }

    expectedPermissionsPerColl[coll.name] = expectedPermissions;
  });

  return expectedPermissionsPerColl;
};

env.assertCollections = function assertCollections(envId, collList, expCollCount, rolesNameIdPairs, done) {
  ApiService.colls.get(envId, null, (err, actualColls) => {
    if (err) {
      return done(err);
    }

    expect(expCollCount).to.equal(actualColls.length);

    const expectedPermissionsPerColl = env.buildExpectedPermissionsPerColl(collList, rolesNameIdPairs);
    const collsFromConfigCount = collList.length;

    for (let i = 0; i < collsFromConfigCount; i += 1) {
      const expColl = collList[i];
      const actualColl = actualColls.find(x => x.name === expColl.name);
      if (!actualColl) {
        return done(new Error(`Failed to find coll with name '${expColl.name}'.`));
      }

      const expPermissions = expectedPermissionsPerColl[actualColl.name];
      expect(actualColl.permissions).to.deep.equal(expPermissions);

      if (expColl.type === 'internal') {
        expect(actualColl.dataLink).to.be.null;
      } else {
        expect(actualColl.dataLink).to.exist;
        expect(actualColl.dataLink.serviceObjectName).to.equal(expColl.serviceObject);
      }
    }

    done();
  });
};

env.assertCollHooksPerColl = function assertCollHooksPerColl(envId, collName, collHooks, done) {
  const collHooksNames = Object.keys(collHooks);

  async.eachSeries(
    collHooksNames,
    (currentHook, next) => {
      const backendHookName = CollectionHook[currentHook];
      ApiService.businessLogic.collHooks.get(envId, collName, backendHookName, (err, actualHook) => {
        if (err) {
          return next(err);
        }

        const expectedHook = collHooks[currentHook];
        if (expectedHook.type === 'internal') {
          expect(actualHook.host).to.be.null;
        } else {
          expect(actualHook.host).to.not.be.null;
        }

        const defaultCode = `function ${currentHook}(request, response, modules) {\n  response.continue();\n}`;
        const expectedCode = expectedHook.code || defaultCode;
        expect(expectedCode).to.equal(actualHook.code);

        if (expectedHook.type === 'internal') {
          expect(actualHook.host).to.be.null;
        } else {
          expect(actualHook.host).to.not.be.null;
          expect(actualHook.sdkHandlerName).to.equal(expectedHook.handlerName);
        }

        next();
      });
    },
    done
  );
};

env.assertAllCollHooks = function assertAllCollHooks(envId, configHooks, done) {
  const collNames = Object.keys(configHooks);

  async.eachSeries(
    collNames,
    (currentCollName, next) => {
      env.assertCollHooksPerColl(envId, currentCollName, configHooks[currentCollName], next);
    },
    done
  );
};

env.assertEndpoints = function assertEndpoints(envId, configEndpoints, done) {
  const endpointNames = Object.keys(configEndpoints);

  async.eachSeries(
    endpointNames,
    (currentEndpointName, next) => {
      ApiService.businessLogic.endpoints.get(envId, currentEndpointName, (err, actual) => {
        if (err) {
          return done(err);
        }

        const expected = configEndpoints[currentEndpointName];
        if (expected.type === 'internal') {
          expect(actual.host).to.be.null;
        } else {
          expect(actual.host).to.not.be.null;
        }

        const defaultCode = 'function onRequest(request, response, modules) {\n  response.continue();\n}';
        const expectedCode = expected.code || defaultCode;
        expect(expectedCode).to.equal(actual.code);

        if (expected.schedule) { // due to api peculiarities
          if (!expected.schedule.interval) {
            expect(expected.schedule.start).to.equal(actual.schedule);
          } else {
            expect(expected.schedule.start).to.equal(actual.schedule.start);
            expect(expected.schedule.interval).to.equal(actual.schedule.interval);
          }
        } else {
          expect(actual.schedule).to.be.null;
        }

        if (expected.type === 'internal') {
          expect(actual.host).to.be.null;
        } else {
          expect(actual.host).to.not.be.null;
          expect(actual.sdkHandlerName).to.equal(expected.handlerName);
        }

        next();
      });
    },
    done
  );
};

env.assertGroups = function assertGroups(envId, configGroups, done) {
  const groupNames = Object.keys(configGroups);

  async.eachSeries(
    groupNames,
    (currentGroupName, next) => {
      ApiService.groups.get(envId, currentGroupName, (err, actual) => {
        if (err) {
          return next(err);
        }

        expect(actual).to.have.property('_acl');
        expect(actual).to.have.property('_kmd');

        const expected = configGroups[currentGroupName];
        if (isEmpty(expected)) {
          return setImmediate(next);
        }

        expect(expected.name).to.equal(actual.name);
        expect(expected.description).to.equal(actual.description);

        if (!isEmpty(expected.groups)) {
          expect(expected.groups.length).to.equal(actual.groups.length);

          for (const expGroup of expected.groups) {
            const foundGroup = actual.groups.find(x => x._id === expGroup);
            if (!foundGroup) {
              return next(new Error(`Could not find group with identifier '${expGroup}'.`));
            }
          }
        }

        next();
      });
    },
    done
  );
};

env.assertPushSettings = function assertPushSettings(envId, configPushSettings, done) {
  ApiService.push.get(envId, (err, actual) => {
    if (err) {
      return done(err);
    }

    if (!isEmpty(configPushSettings.android)) {
      expect(configPushSettings.android.senderId).to.equal(actual.android.projectId);
      expect(configPushSettings.android.apiKey).to.equal(actual.android.apiKey);
    } else {
      expect(actual.android).to.be.false;
    }

    if (isEmpty(configPushSettings.ios)) {
      expect(actual.ios).to.be.false;
    }

    done();
  });
};

env.assertExportedConfig = function assertExportedConfig(expected, actual, done) {
  const expectedFirstLevelProps = Object.keys(expected);
  async.eachSeries(
    expectedFirstLevelProps,
    (expectedProp, next) => {
      const currentExpected = expected[expectedProp];
      const currentActual = actual[expectedProp];

      switch (expectedProp) {
        case 'collectionHooks':
          env.assertExportedCollHooks(currentExpected, currentActual, done);
          break;
        case 'commonCode':
          env.assertExportedEntityWithCode(currentExpected, currentActual, done);
          break;
        case 'customEndpoints':
          env.assertExportedEntityWithCode(currentExpected, currentActual, done);
          break;
        case 'roles':
          env.assertExportedRoles(currentExpected, currentActual, done);
          break;
        default:
          try {
            expect(expected[expectedProp]).to.deep.equal(actual[expectedProp]);
          } catch (ex) {
            next(ex);
          }

          next();
      }
    },
    done
  );
};

env.assertExportedCollHooks = function assertExportedCollHooks(expected, actual, done) {
  const collNames = Object.keys(expected);
  async.each(
    collNames,
    (currentColl, next) => {
      expect(actual[currentColl]).to.exist;

      const expectedHooksPerColl = Object.keys(expected[currentColl]);
      async.each(
        expectedHooksPerColl,
        (currentHookName, cb) => {
          const actualHook = actual[currentColl][currentHookName];
          expect(actualHook).to.exist;

          const expectedHook = expected[currentColl][currentHookName];
          env.assertExportedEntityWithCode(expectedHook, actualHook, cb);
        },
        next
      );
    },
    done
  );
};

env.assertExportedEntityWithCode = function assertExportedEntityWithCode(expected, actual, done) {
  const expectedWoCode = getObjectByOmitting(expected, ['code']);
  const actualWoCode = getObjectByOmitting(actual, ['codeFile']);
  expect(expectedWoCode).to.deep.equal(actualWoCode);

  env.getCode(expected, (err, expectedCode) => {
    if (err) {
      return done(err);
    }

    if (!expectedCode) {
      return setImmediate(done);
    }

    env.getCode(actual, (err, actualCode) => {
      if (err) {
        return done(err);
      }

      expect(expectedCode).to.equal(actualCode);
      done();
    });
  });
};

env.getCode = function (entityWithCode, done) {
  if (entityWithCode.code) {
    setImmediate(() => { done(null, entityWithCode.code); });
  } else if (entityWithCode.codeFile) {
    fs.readFile(path.join(TestsHelper.ConfigFilesDir, entityWithCode.codeFile), { encoding: 'utf8' }, (err, code) => {
      if (err) {
        return done(err);
      }

      done(null, code);
    });
  } else {
    setImmediate(done);
  }
};

env.assertExportedRoles = function assertExportedRoles(expected, actual, done) {
  const expectedRoleNames = Object.keys(expected);
  const actualRoleNames = Object.keys(actual);
  const expectedCount = expectedRoleNames.length;
  expect(actualRoleNames.length).to.equal(expectedCount);

  for (let i = 0; i < expectedCount; i += 1) {
    const expectedRole = expected[expectedRoleNames[i]];
    const actualRole = actualRoleNames.find(x => x === expected.name);
    if (!actualRole) {
      return done(new Error(`Failed to find role with name '${expectedRole.name}'.`));
    }

    expect(actualRole.description).to.equal(expectedRole.description);
    expect(actualRole.name).to.equal(expectedRole.name || expectedRoleNames[i]);
  }

  done();
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
      const cmd = `service push ${serviceId} ${filePath} --output json --verbose`;
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
      expect(actual.version).to.equal(expectedVersion);
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
    { times: 6, interval: 20000 }, // 6 times every 20 sec
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
