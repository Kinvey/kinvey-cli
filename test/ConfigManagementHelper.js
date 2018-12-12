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
const { APIRuntimeToCLIRuntime, BackendCollectionPermission, CollectionHook, ConfigFiles } = require('./../lib/Constants');
const TestsHelper = require('./TestsHelper');
const { getObjectByOmitting, isEmpty, isNullOrUndefined, writeJSON } = require('./../lib/Utils');

let ConfigManagementHelper = {};

function passConfigFileToCli(cmd, configContent, filePath, done) {
  async.series([
    (next) => {
      writeJSON({ file: filePath, data: configContent }, next);
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

function exportEntityAsJson(cmd, done) {
  const fileName = `${TestsHelper.randomStrings.plainString(10)}.json`;
  const filePath = path.join(TestsHelper.ConfigFilesDir, fileName);
  const finalCmd = `${cmd} ${filePath} --output json`;

  TestsHelper.execCmdWoMocks(finalCmd, null, (err) => {
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
}

const service = {};
service.createPackageJsonForFlexProject = function createPackageJsonForFlexProject(pkgJson, done) {
  if (!pkgJson) {
    return setImmediate(done);
  }

  const projectPath = path.join(process.cwd(), 'test/integration-no-mock/flex-project');
  writeJSON({ file: path.join(projectPath, 'package.json'), data: pkgJson }, done);
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
      const cmd = `service push --service ${serviceId} ${filePath} --output json --verbose`;
      passConfigFileToCli(cmd, serviceConfig, filePath, next);
    }
  ], (err, results) => {
    done(err, results.pop());
  });
};

service.exportConfig = function exportConfig({ serviceId, relativePath = '' }, done) {
  const fileName = `${TestsHelper.randomStrings.plainString(10)}.json`;
  const filePath = path.join(TestsHelper.ConfigFilesDir, relativePath, fileName);
  const cmd = `service export ${filePath} --service ${serviceId} --output json`;
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

service.assertFlexServiceStatus = function assertFlexServiceStatus(id, expectedVersion, expectedStatus, done) {
  ApiService.services.status(id, (err, actual) => {
    if (err) {
      return done(err);
    }

    try {
      expect(actual.version, 'Version').to.exist;
      expect(actual.version).to.equal(expectedVersion);
      if (expectedStatus) {
        expect(actual.status.toLowerCase()).to.equal(expectedStatus.toLowerCase());
      }
    } catch (ex) {
      return done(ex);
    }

    done();
  });
};

service.assertFlexServiceStatusRetryable = function assertFlexServiceStatusRetryable(id, expectedVersion, expectedStatus, done) {
  async.retry(
    { times: 9, interval: 20000 }, // 9 times every 20 sec
    (next) => {
      service.assertFlexServiceStatus(id, expectedVersion, expectedStatus, next);
    },
    done
  );
};

service.assertRapidDataService = function (id, serviceConfig, serviceName, done) {
  ApiService.services.get(id, (err, actual) => {
    if (err) {
      return done(err);
    }

    try {
      const expected = serviceConfig;
      expect(actual.type).to.equal(ConfigFiles.ConfigToBackendServiceType[serviceConfig.type]);
      if (expected.description) {
        expect(actual.description).to.equal(expected.description);
      } else {
        expect(actual.description).to.not.exist;
      }


      // assert env-related settings
      expect(actual.backingServers).to.be.an.array;
      expect(actual.backingServers.length).to.equal(1);

      const actualDefaultEnv = actual.backingServers[0];
      const envName = Object.keys(serviceConfig.environments)[0];
      const srvEnv = serviceConfig.environments[envName];

      const expectedEnvWoMapping = getObjectByOmitting(srvEnv, ['mapping']);
      const actualEnvWoMapping = getObjectByOmitting(actualDefaultEnv, ['_id', 'mapping', 'name']);
      expect(actualEnvWoMapping).to.deep.equal(expectedEnvWoMapping);

      // assert mapping
      const envId = actualDefaultEnv._id;
      const expectedDefEnvMapping = clonedeep(srvEnv.mapping);
      if (expectedDefEnvMapping) {
        Object.keys(expectedDefEnvMapping).forEach((serviceObjectName) => {
          expectedDefEnvMapping[serviceObjectName].backingServer = envId;
        });
      }

      expect(actualDefaultEnv.mapping).to.deep.equal(expectedDefEnvMapping);
    } catch (ex) {
      return done(ex);
    }

    done();
  });
};

const env = {};
env.buildSettings = function buildSettings() {
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

env.buildExternalCollection = function buildExternalCollection(serviceName, svcEnvIdentifier, serviceObject, collName, permissions) {
  collName = collName || TestsHelper.randomStrings.collName();
  permissions = permissions || 'shared';

  return {
    name: collName,
    type: 'external',
    permissions,
    service: serviceName,
    serviceEnvironment: svcEnvIdentifier,
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
  const cmd = `appenv create ${envName} ${filePath} --app ${appName} --output json`;
  passConfigFileToCli(cmd, env, filePath, done);
};

env.modifyFromConfig = function modifyEnvFromConfig(config, envIdentifier, appIdentifier, done) {
  const fileName = `${TestsHelper.randomStrings.plainString(10)}.json`;
  const filePath = path.join(TestsHelper.ConfigFilesDir, fileName);
  let cmd = `appenv push ${filePath} --output json`;
  if (envIdentifier) {
    cmd = `${cmd} --env ${envIdentifier}`;
  }

  if (appIdentifier) {
    cmd = `${cmd} --app ${appIdentifier}`;
  }

  passConfigFileToCli(cmd, config, filePath, done);
};

env.exportEnv = function (envIdentifier, appIdentifier, done) {
  const fileName = `${TestsHelper.randomStrings.plainString(10)}.json`;
  const filePath = path.join(TestsHelper.ConfigFilesDir, fileName);
  let cmd = `appenv export ${filePath} --output json`;
  if (envIdentifier) {
    cmd = `${cmd} --env ${envIdentifier}`;
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

    expect(actualColls.length).to.equal(expCollCount);

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
        expect(actualHook.code).to.equal(expectedCode);

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

env.assertAllCommonCodeModules = function assertAllCommonCodeModules(envId, configCommonCode, done) {
  const modules = Object.keys(configCommonCode);

  async.eachSeries(
    modules,
    (currentModuleName, next) => {
      ApiService.businessLogic.commonCode.get(envId, currentModuleName, (err, actual) => {
        if (err) {
          return next(err);
        }

        const expected = Object.assign({ name: currentModuleName }, configCommonCode[currentModuleName]);
        expect(actual).to.deep.equal(expected);
        next();
      });
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
        expect(actual.code).to.equal(expectedCode);

        if (expected.schedule) { // due to api peculiarities
          if (!expected.schedule.interval) {
            expect(actual.schedule).to.equal(expected.schedule.start);
          } else {
            expect(actual.schedule.start).to.equal(expected.schedule.start);
            expect(actual.schedule.interval).to.equal(expected.schedule.interval);
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

        expect(actual.name).to.equal(expected.name);
        expect(actual.description).to.equal(expected.description);

        if (!isEmpty(expected.groups)) {
          expect(actual.groups.length).to.equal(expected.groups.length);

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
  env.assertExportedSettings(expected.settings, actual.settings);

  const expectedFirstLevelProps = Object.keys(expected);
  async.eachSeries(
    expectedFirstLevelProps,
    (expectedProp, next) => {
      const currentExpected = expected[expectedProp];
      const currentActual = actual[expectedProp];

      switch (expectedProp) {
        case 'collectionHooks':
          env.assertExportedCollHooks(currentExpected, currentActual, next);
          break;
        case 'commonCode':
          env.assertExportedEntitiesWithCode(currentExpected, currentActual, next);
          break;
        case 'customEndpoints':
          env.assertExportedEntitiesWithCode(currentExpected, currentActual, next);
          break;
        case 'roles':
          env.assertExportedRoles(currentExpected, currentActual, next);
          break;
        default:
          try {
            expect(actual[expectedProp]).to.deep.equal(expected[expectedProp]);
          } catch (ex) {
            next(ex);
          }

          next();
      }
    },
    done
  );
};

env.assertExportedSettings = function assertExportedSettings(expected, actual) {
  expect(actual).to.be.an.object;

  if (!expected) {
    const defaultSettings = { apiVersion: 3 };
    expect(actual).to.deep.equal(defaultSettings);
  } else {
    // it's possible that it needs adjusting
    expect(actual).to.deep.equal(expected);
  }
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
  expect(actualWoCode).to.deep.equal(expectedWoCode);

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

      expect(actualCode).to.equal(expectedCode);
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

env.assertExportedEntitiesWithCode = function assertExportedEntitiesWithCode(expected, actual, done) {
  expect(actual).to.be.an.object;

  const expectedIdentifier = Object.keys(expected);
  expect(Object.keys(actual).length).to.equal(expectedIdentifier.length);

  async.each(
    expectedIdentifier,
    (currentIdentifier, next) => {
      env.assertExportedEntityWithCode(expected[currentIdentifier], actual[currentIdentifier], next);
    },
    done
  );
};

env.assertExportedRoles = function assertExportedRoles(expected, actual, done) {
  const expectedRoleNames = Object.keys(expected);
  const actualRoleNames = Object.keys(actual);
  const expectedCount = expectedRoleNames.length;
  expect(actualRoleNames.length).to.equal(expectedCount);

  for (let i = 0; i < expectedCount; i += 1) {
    const expectedRole = Object.assign({ name: expectedRoleNames[i] }, expected[expectedRoleNames[i]]);
    const actualRoleName = actualRoleNames.find(x => x === expectedRole.name);
    if (!actualRoleName) {
      return done(new Error(`Failed to find role with name '${expectedRole.name}'.`));
    }

    const actualRole = actual[actualRoleName];
    expect(actualRole).to.deep.equal(actualRole);
  }

  done();
  /* eslint-enable */
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

app.createFromConfig = function createAppFromConfig(appName, appConfig, orgIdentifier, done) {
  const fileName = `${TestsHelper.randomStrings.plainString(10)}.json`;
  const filePath = path.join(TestsHelper.ConfigFilesDir, fileName);
  let cmd = `app create ${appName} ${filePath} --output json`;
  if (orgIdentifier) {
    cmd += ` --org ${orgIdentifier}`;
  }
  passConfigFileToCli(cmd, appConfig, filePath, done);
};

app.modifyFromConfig = function modifyFromConfig(appIdentifier, appConfig, done) {
  const fileName = `${TestsHelper.randomStrings.plainString(10)}.json`;
  const filePath = path.join(TestsHelper.ConfigFilesDir, fileName);
  let cmd = `app push ${filePath} --output json`;
  if (appIdentifier) {
    cmd += ` --app ${appIdentifier}`;
  }
  passConfigFileToCli(cmd, appConfig, filePath, done);
};

app.assertApp = function assertApp({ config, id, orgIdentifier, expectedName, expectOrg, collListPerEnv }, done) {
  let actualApp;
  let assertEnvsDetails = true;

  async.series([
    (next) => {
      ApiService.apps.get(id, (err, data) => {
        if (err) {
          return next(err);
        }

        actualApp = data;
        expect(actualApp.name).to.equal(expectedName);

        if (expectOrg) {
          expect(actualApp.organizationId).to.exist;
        } else {
          expect(actualApp.organizationId).to.not.exist;
        }

        // assert settings
        if (!isEmpty(config.settings) && !isEmpty(config.settings.realtime)) {
          expect(actualApp.realtime.enabled).to.equal(config.settings.realtime.enabled);
        } else {
          expect(actualApp.realtime).to.not.exist;
        }


        if (config.settings && config.settings.sessionTimeoutInSeconds) {
          expect(actualApp.sessionTimeoutInSeconds).to.equal(config.settings.sessionTimeoutInSeconds);
        }

        // assert env count
        const expEnvsCount = isEmpty(config.environments) ? 1 : (Object.keys(config.environments).length);
        expect(actualApp.environments.length).to.equal(expEnvsCount);

        if (isEmpty(config.environments)) { // then only the default env ('Development') is created
          assertEnvsDetails = false;
        }

        next();
      });
    },
    (next) => {
      if (!assertEnvsDetails) {
        return setImmediate(next);
      }

      const configEnvNames = Object.keys(config.environments);
      async.eachSeries(
        configEnvNames,
        (currName, cb) => {
          const configEnv = config.environments[currName];
          const actualEnv = actualApp.environments.find(x => x.name.toLowerCase() === currName.toLowerCase());
          if (!actualEnv) {
            return cb(new Error(`Failed to find env '${currName}'`));
          }

          env.assertEnvOnly(configEnv, actualEnv.id, currName, (err) => {
            if (err) {
              return cb(err);
            }

            env.assertCollections(actualEnv.id, collListPerEnv[currName], collListPerEnv[currName].length + 2, null, cb);
          });
        },
        next
      );
    },
    (next) => {
      ApiService.services.getAllByApp(actualApp, (err, data) => {
        if (err) {
          return next(err);
        }

        const actualServices = [];
        data.forEach((x) => {
          if (x.access.writers.apps && x.access.writers.apps.find(appId => appId === actualApp.id)) {
            actualServices.push(x);
          }
        });

        const expectedServices = config.services;
        if (!expectedServices) {
          expect(actualServices.length).to.equal(0);
          return setImmediate(next);
        }

        const expServiceNames = Object.keys(expectedServices);
        async.eachSeries(
          expServiceNames,
          (currName, cb) => {
            const actualService = actualServices.find(x => x.name === currName);
            if (!actualService) {
              return cb(new Error(`Failed to find actual service with name '${currName}'.`));
            }

            const actualId = actualService.id;
            const serviceConfig = expectedServices[currName];
            service.assertService(actualId, serviceConfig, currName, cb);
          },
          next
        );
      });
    }
  ], done);
};

app.exportApp = function exportApp(appIdentifier, done) {
  let cmd = 'app export';
  if (appIdentifier) {
    cmd = `${cmd} --app ${appIdentifier}`;
  }

  exportEntityAsJson(cmd, done);
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

const org = {};
org.exportOrg = function exportOrg(orgIdentifier, done) {
  let cmd = 'org export';
  if (orgIdentifier) {
    cmd = `${cmd} --org ${orgIdentifier}`;
  }

  exportEntityAsJson(cmd, done);
};

service.assertFlexSvcEnv = function assertFlexSvcEnv(actual, expected, serviceType) {
  expect(actual).to.be.an('object').that.is.not.empty;

  const isFlexInternal = serviceType === 'internal';
  if (isFlexInternal) {
    expect(actual.host).to.exist;
  } else {
    expect(actual.host).to.equal(expected.host);
  }

  expect(actual.description).to.equal(expected.description);
  expect(actual.secret).to.equal(expected.secret);
  expect(actual.environmentVariables).to.deep.equal(expected.environmentVariables);

  if (expected.runtime) {
    expect(APIRuntimeToCLIRuntime[actual.runtime]).to.equal(expected.runtime);
  }
};

service.assertSvcEnvs = function assertSvcEnvs(actualService, config, done) {
  config = config || {};
  ApiService.svcEnvs.get(actualService.id, null, (err, actual) => {
    if (err) {
      return done(err);
    }

    const expSvcEnvsNames = Object.keys(config);
    const expSvcEnvsCount = expSvcEnvsNames.length;
    expect(actual.length).to.equal(expSvcEnvsCount);

    const isFlex = actualService.type === 'internal' || actualService.type === 'external';

    for (const expName of expSvcEnvsNames) {
      const actualSvcEnv = actual.find(x => x.name === expName);
      if (!actualSvcEnv) {
        return done(new Error(`Could not find svc env with name '${expName}'.`));
      }

      const expSvcEnv = config[expName];
      if (isFlex) {
        service.assertFlexSvcEnv(actualSvcEnv, expSvcEnv, actualService.type);
      } else {
        service.assertRapidDataSvcEnv(actualSvcEnv, Object.assign({ name: expName }, expSvcEnv));
      }
    }

    done();
  });
};

service.assertService = function assertService(id, serviceConfig, serviceName, done) {
  let actualService;

  async.series([
    (next) => {
      ApiService.services.get(id, (err, actual) => {
        if (err) {
          return done(err);
        }

        actualService = actual;
        expect(serviceName).to.equal(actual.name);
        if (isNullOrUndefined(serviceConfig.description)) {
          expect(actual.description).to.be.null;
        } else {
          expect(actual.description).to.equal(serviceConfig.description);
        }

        expect(actual.type).to.equal(ConfigFiles.ConfigToBackendServiceType[serviceConfig.type]);

        next();
      });
    },
    (next) => {
      service.assertSvcEnvs(actualService, serviceConfig.environments, next);
    }
  ], done);
};

service.getDefaultSvcEnvId = function getDefaultSvcEnvId(serviceId, done) {
  ApiService.svcEnvs.get(serviceId, null, (err, data) => {
    if (err) {
      return done(err);
    }

    if (isEmpty(data)) {
      return done(new Error('No svc environments found.'));
    }

    done(null, data[0].id);
  });
};

service.assertFlexServiceStatus = function assertFlexServiceStatus(id, svcEnvId, expectedVersion, expectedStatus, done) {
  ApiService.services.status(id, svcEnvId, (err, actual) => {
    if (err) {
      return done(err);
    }

    try {
      expect(actual.version, 'Version').to.exist;
      expect(actual.version).to.equal(expectedVersion);
      if (expectedStatus) {
        expect(actual.status.toLowerCase()).to.equal(expectedStatus.toLowerCase());
      }
    } catch (ex) {
      return done(ex);
    }

    done();
  });
};

service.assertFlexServiceStatusRetryable = function assertFlexServiceStatusRetryable(id, svcEnvId, expectedVersion, expectedStatus, done) {
  async.series([
    (next) => {
      if (svcEnvId) {
        return setImmediate(next);
      }

      service.getDefaultSvcEnvId(id, (err, envId) => {
        if (err) {
          return next(err);
        }

        svcEnvId = envId;
        next();
      });
    },
    (next) => {
      async.retry(
        { times: 9, interval: 20000 }, // 6 times every 20 sec
        (cb) => {
          service.assertFlexServiceStatus(id, svcEnvId, expectedVersion, expectedStatus, cb);
        },
        next
      );
    }
  ], done);
};

service.assertRapidDataSvcEnv = function assertRapidDataSvcEnv(actual, expected) {
  expect(actual.description).to.equal(expected.description);

  const actualEnvWoId = getObjectByOmitting(actual, ['id']);
  expect(actualEnvWoId).to.deep.equal(expected);
};

const testHooks = {};
testHooks.removeService = function removeService(id, done) {
  if (!id) {
    console.log('Skipping service removal as service ID is not set.');
    return setImmediate(done);
  }

  ApiService.services.remove(id, done);
};

org.assertSettings = function assertSettings(actual) {
  expect(actual.schemaVersion).to.exist;
  expect(actual.configType).to.equal('organization');

  const exportedSettings = actual.settings;
  expect(exportedSettings).to.be.an('object').and.not.empty;
  expect(exportedSettings.security).to.be.an('object');
  expect(exportedSettings.security.requireApprovals).to.be.a('boolean');
  expect(exportedSettings.security.requireEmailVerification).to.be.a('boolean');
  expect(exportedSettings.security.requireTwoFactorAuth).to.be.a('boolean');
};

ConfigManagementHelper = {
  app,
  env,
  org,
  roles,
  service,
  common: {
    buildConfigEntityFromList,
    EndpointsRelatedTestsTimeout: 65000
  },
  testHooks
};

module.exports = ConfigManagementHelper;
