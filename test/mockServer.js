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

const express = require('express');
const bodyParser = require('body-parser');
const isEqual = require('lodash.isequal');

const { HTTPMethod, ServiceStatus } = require('./../lib/Constants');
const fixtureUser = require('./fixtures/user.json');
const fixtureApps = require('./fixtures/apps.json');
const fixtureApp = require('./fixtures/app.json');
const fixtureEnvs = require('./fixtures/envs.json');
const fixtureEnv = require('./fixtures/env.json');
const fixtureCollections = require('./fixtures/collections.json');
const fixtureCollection = require('./fixtures/collection.json');
const fixtureOrgs = require('./fixtures/orgs.json');
const fixtureServices = require('./fixtures/datalinks.json');
const fixtureInternalFlexService = require('./fixtures/internal-flex-service.json');
const fixtureJob = require('./fixtures/job.json');
const fixtureJobs = require('./fixtures/jobs.json');
const fixtureInternalDataLink = require('./fixtures/kinvey-dlc.json');
const fixtureLogs = require('./fixtures/logs.json');

const testsConfig = require('./TestsConfig');

const existentUserOne = fixtureUser.existentOne;

let server;

function runServer(app, port, done) {
  server = app.listen(port, (err) => {
    if (done) {
      // console.log(`Mock server running on ${port}`);
      return done(err, server);
    }

    console.log(`Mock server running on ${port}`);
  });
}

function isAuthenthicated(headers, expectedToken) {
  if (!headers) {
    return false;
  }

  const expectedHeaderValue = `Kinvey ${expectedToken}`;
  return headers.authorization === expectedHeaderValue;
}

function build(
  {
    schemaVersion = testsConfig.defaultSchemaVersion,
    port = testsConfig.port,
    existentUser = fixtureUser.existent,
    token = fixtureUser.token,
    nonExistentUser = fixtureUser.nonexistent,
    serviceStatus = ServiceStatus.ONLINE,
    orgs = fixtureOrgs,
    apps = fixtureApps,
    service = fixtureInternalFlexService,
    envs = fixtureEnvs,
    colls = fixtureCollections,
    jobType = 'recycleDataLink',
    serviceLogsQuery = {},
    domainType = 'apps',
    domainEntityId = fixtureApp.id,
    require2FAToken = false,
    twoFactorToken = fixtureUser.validTwoFactorToken
  },
  done
) {
  const versionPart = `v${schemaVersion}`;

  const app = express();

  app.use(bodyParser.json());

  app.use((req, res, next) => {
    const requiresAuth = !(req.method === HTTPMethod.POST && req.url === '/session');
    if (requiresAuth) {
      const isAuth = isAuthenthicated(req.headers, token);
      if (!isAuth) {
        return res.status(401).send({
          code: 'Unauthorized',
          description: 'You need to be logged in to execute this request.'
        });
      }
    }

    next();
  });

  // LOGIN/LOGOUT
  app.post('/session', (req, res) => {
    if (!req.body) {
      return res.sendStatus(400);
    }

    const errTwoFactorToken = {
      code: 'InvalidTwoFactorAuth',
      description: 'Two-factor authentication is required, but a token was missing from your request.'
    };

    if (require2FAToken && req.body.twoFactorToken !== twoFactorToken.toString()) {
      return res.status(403).send(errTwoFactorToken);
    }

    const email = req.body.email;
    const pass = req.body.password;
    if (email === existentUser.email && pass === existentUser.password) {
      return res.send({ email: existentUser.email, token: fixtureUser.token });
    } else if (email === existentUserOne.email && pass === existentUserOne.password) {
      return res.send({ email: existentUserOne.email, token: fixtureUser.tokenOne });
    } else if (email === nonExistentUser.email && pass === nonExistentUser.password) {
      return res.send(401);
    }

    const errRes = {
      code: 'ValidationError',
      description: 'Validation failed.',
      errors: [{
        field: 'password',
        message: 'Missing required property: password'
      }]
    };

    res.status(422).send(errRes);
  });

  app.delete('/session', (req, res) => res.sendStatus(204));

  // SERVICES
  app.get(`/${versionPart}/data-links/:id/status`, (req, res) => {
    const id = req.params.id;
    if (id !== fixtureInternalDataLink.id) {
      return res.status(404).send({
        code: 'DataLinkNotFound',
        description: 'The specified data link could not be found.'
      });
    }

    const result = {
      status: serviceStatus,
      requestedAt: '2017-11-06T03:42:31.970Z',
      deployUserInfo:
        { firstName: 'Davy',
          lastName: 'Jones',
          email: 'davy.jones@mail.com'
        },
      version: '1.4.2'
    };

    res.send(result);
  });

  app.get(`/${versionPart}/data-links/:id/logs`, (req, res) => {
    const id = req.params.id;
    if (id !== fixtureInternalDataLink.id) {
      return res.status(404).send({
        code: 'DataLinkNotFound',
        description: 'The specified data link could not be found.'
      });
    }

    const query = req.query;
    if (!isEqual(query, serviceLogsQuery)) {
      return res.status(400).send({ description: `CLI sent bad query: ${JSON.stringify(query)}` });
    }

    res.send(fixtureLogs);
  });

  app.get(`/${versionPart}/data-links/:id`, (req, res) => {
    const id = req.params.id;
    if (id) {
      const wantedService = fixtureServices.find(x => x.id === id);
      return res.send(wantedService);
    }

    res.send(fixtureServices);
  });

  app.delete(`/${versionPart}/data-links/:id`, (req, res) => {
    const id = req.params.id;
    if (id === service.id) {
      return res.sendStatus(204);
    }

    res.status(404).send({
      code: 'DataLinkNotFound',
      description: 'The specified data link could not be found.'
    });
  });

  // JOBS
  app.get(`/${versionPart}/jobs/:id`, (req, res) => {
    const id = req.params.id;
    if (!id) {
      return res.send([]);
    }

    const wantedJob = fixtureJobs.find(x => x.jobId === id);
    if (wantedJob) {
      res.send(wantedJob);
    } else {
      res.status(404).send({
        code: 'JobNotFound',
        description: 'The specified job could not be found.'
      });
    }
  });

  app.post(`/${versionPart}/jobs`, (req, res) => {
    const body = req.body;
    const isAsExpected = body && body.type === jobType && body.params && body.params.dataLinkId === fixtureInternalDataLink.id;
    if (!isAsExpected) {
      if (body.params.dataLinkId !== fixtureInternalDataLink.id) {
        return res.status(404).send({
          code: 'DataLinkNotFound',
          description: 'The specified data link could not be found.'
        });
      }

      return res.status(400).send({ description: `CLI has constructed bad job: ${JSON.stringify(body)}` });
    }

    res.send({ job: 'idOfJobThatIsRecyclingTheService' });
  });

  // SERVICES BY APP/ORG
  app.get(`/${versionPart}/${domainType}/${domainEntityId}/data-links`, (req, res) => {
    res.send(fixtureServices);
  });

  app.post(`/${versionPart}/${domainType}/${domainEntityId}/data-links`, (req, res) => {
    const body = req.body;
    if (!body.name || body.name !== service.name || body.type !== service.type || !Array.isArray(body.backingServers)
      || !body.backingServers[0] || !body.backingServers[0].secret) {
      return res.sendStatus(400);
    }

    res.status(201).send(service);
  });

  // ENVS BY APP
  app.get(`/${versionPart}/apps/:id/environments`, (req, res) => {
    const id = req.params.id;
    const wantedApp = apps.find(x => x.id === id);
    if (!wantedApp) {
      return res.status(404).send({
        code: 'AppNotFound',
        description: 'The specified app could not be found.'
      });
    }

    res.send(envs);
  });

  app.post(`/${versionPart}/apps/:id/environments`, (req, res) => {
    const id = req.params.id;
    const wantedApp = apps.find(x => x.id === id);
    if (!wantedApp) {
      return res.status(404).send({
        code: 'AppNotFound',
        description: 'The specified app could not be found.'
      });
    }

    if (!req.body.name || req.body.name !== fixtureEnv.name) {
      return res.sendStatus(400);
    }

    res.send(fixtureEnv);
  });

  // COLLECTIONS
  app.get(`/${versionPart}/environments/:id/collections`, (req, res) => {
    const id = req.params.id;
    const wantedEnv = envs.find(x => x.id === id);
    if (wantedEnv) {
      return res.send(colls);
    }

    res.status(404).send({
      code: 'EnvironmentNotFound',
      description: 'The specified environment could not be found.'
    });
  });

  app.post(`/${versionPart}/environments/:id/collections`, (req, res) => {
    const id = req.params.id;
    const wantedEnv = envs.find(x => x.id === id);
    if (!wantedEnv) {
      return res.status(404).send({
        code: 'EnvironmentNotFound',
        description: 'The specified environment could not be found.'
      });
    }

    if (!req.body.name || req.body.name !== fixtureCollection.name) {
      return res.sendStatus(400);
    }

    res.send(fixtureCollection);
  });

  app.delete(`/${versionPart}/environments/:id/collections/:name`, (req, res) => {
    const id = req.params.id;
    const wantedEnv = envs.find(x => x.id === id);
    if (!wantedEnv) {
      return res.status(404).send({
        code: 'EnvironmentNotFound',
        description: 'The specified environment could not be found.'
      });
    }

    if (req.params.name !== fixtureCollection.name) {
      return res.status(404).send({
        code: 'CollectionNotFound',
        description: 'The specified collection could not be found.'
      });
    }

    res.sendStatus(204);
  });

  // ENVS
  app.get(`/${versionPart}/environments/:id`, (req, res) => {
    const id = req.params.id;
    const wantedEnv = envs.find(x => x.id === id);
    if (wantedEnv) {
      return res.send(wantedEnv);
    }

    res.status(404).send({
      code: 'EnvironmentNotFound',
      description: 'The specified environment could not be found.'
    });
  });

  app.delete(`/${versionPart}/environments/:id`, (req, res) => {
    const id = req.params.id;
    const wantedEnv = envs.find(x => x.id === id);
    if (wantedEnv) {
      return res.sendStatus(204);
    }

    res.status(404).send({
      code: 'EnvironmentNotFound',
      description: 'The specified environment could not be found.'
    });
  });

  // APPS
  app.get(`/${versionPart}/apps/:id`, (req, res) => {
    const id = req.params.id;
    const wantedApp = apps.find(x => x.id === id);
    if (wantedApp) {
      return res.send(wantedApp);
    }

    res.status(404).send({
      code: 'AppNotFound',
      description: 'The specified app could not be found.'
    });
  });

  app.delete(`/${versionPart}/apps/:id`, (req, res) => {
    const id = req.params.id;
    if (apps.find(x => x.id === id)) {
      return res.sendStatus(204);
    }

    res.status(404).send({
      code: 'AppNotFound',
      description: 'The specified app could not be found.'
    });
  });

  app.get(`/${versionPart}/apps`, (req, res) => {
    res.send(apps);
  });

  app.post(`/${versionPart}/apps`, (req, res) => {
    if (!req.body.name || req.body.name !== fixtureApp.name) {
      return res.sendStatus(400);
    }

    res.status(201).send(fixtureApp);
  });

  // ORGS
  app.get(`/${versionPart}/organizations/:id`, (req, res) => {
    const id = req.params.id;
    if (id) {
      return res.send(orgs.find(x => x.id === id));
    }

    res.status(404).send({
      code: 'OrganizationNotFound',
      description: 'The specified organization could not be found.'
    });
  });

  app.get(`/${versionPart}/organizations`, (req, res) => {
    res.send(orgs);
  });

  app.all('/', (req, res) => {
    res.send(404);
  });

  if (server && server.listening === true) {
    server.close(() => {
      runServer(app, port, done);
    });
  } else {
    runServer(app, port, done);
  }
}

// build({});


module.exports = (options, done) => {
  options = options || {};
  return build(options, done);
};
