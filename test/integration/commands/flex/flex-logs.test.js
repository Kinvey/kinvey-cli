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

const { AuthOptionsNames, FlexOptionsNames } = require('./../../../../lib/constants');
const { isEmpty } = require('./../../../../lib/utils');
const { execCmdWithAssertion, setup } = require('./../../../tests-helper');

const fixtureUser = require('./../../../fixtures/user.json');
const fixtureInternalDataLink = require('./../../../fixtures/kinvey-dlc.json');

const existentUserOne = fixtureUser.existentOne;
const tokenOne = fixtureUser.tokenOne;
const defaultServiceId = fixtureInternalDataLink.id;

const baseCmd = 'flex logs';

function testFlexLogs(profileName, optionsForCredentials, serviceId, query, validUser, done) {
  let cmd = `${baseCmd} --verbose`;
  if (profileName) {
    cmd = `${cmd} --${AuthOptionsNames.PROFILE} ${profileName}`;
  }

  if (!isEmpty(optionsForCredentials)) {
    cmd = `${cmd} --${AuthOptionsNames.EMAIL} ${optionsForCredentials.email} --${AuthOptionsNames.PASSWORD} ${optionsForCredentials.password}`;
  }

  if (serviceId) {
    cmd = `${cmd} --${FlexOptionsNames.SERVICE_ID} ${serviceId}`;
  }

  const apiOptions = {};

  let queryPart = '';
  if (!isEmpty(query)) {
    if (query[FlexOptionsNames.FROM]) {
      queryPart = ` --${FlexOptionsNames.FROM} ${query.from}`;
    }

    if (query[FlexOptionsNames.TO]) {
      queryPart = `${queryPart} --${FlexOptionsNames.TO} ${query.to}`;
    }

    if (query[FlexOptionsNames.PAGE]) {
      queryPart = `${queryPart} --${FlexOptionsNames.PAGE} ${query.page}`;
      query[FlexOptionsNames.PAGE] += '';
    }

    if (query[FlexOptionsNames.NUMBER]) {
      queryPart = `${queryPart} --${FlexOptionsNames.NUMBER} ${query.number}`;
      // server expects 'limit' instead of number, so this is how the CLI constructs the query
      query.limit = query[FlexOptionsNames.NUMBER] + '';
      delete query[FlexOptionsNames.NUMBER];
    }

    apiOptions.serviceLogsQuery = query;
  }

  cmd = `${cmd} ${queryPart}`;

  if (!isEmpty(validUser)) {
    apiOptions.token = validUser.token;
    apiOptions.existentUser = { email: validUser.email };
  }

  execCmdWithAssertion(cmd, null, apiOptions, true, true, false, done);
}

function buildQueryObject(start, end, pageNum, pageSize) {
  const query = {};

  if (start) {
    query[FlexOptionsNames.FROM] = start;
  }

  if (end) {
    query[FlexOptionsNames.TO] = end;
  }

  if (pageNum) {
    query[FlexOptionsNames.PAGE] = pageNum;
  }

  if (pageSize) {
    query[FlexOptionsNames.NUMBER] = pageSize;
  }

  return query;
}

describe(`${baseCmd}`, () => {
  const nonExistentServiceId = '12serviceIdThatDoesntExist';

  const validUserOne = {
    email: existentUserOne.email,
    token: tokenOne
  };

  before((done) => {
    async.series([
      (next) => {
        setup.clearGlobalSetup(null, next);
      },
      (next) => {
        setup.clearProjectSetup(null, next);
      },
      (next) => {
        setup.createProfiles('flexLogsProfile', next);
      }
    ], done);
  });

  after((done) => {
    setup.clearProjectSetup(null, done);
  });

  after((done) => {
    setup.clearGlobalSetup(null, done);
  });

  describe('without query', () => {
    const noQuery = null;

    describe('by specifying a profile', () => {
      const profileToUse = 'profileToGetLogs';

      before((done) => {
        setup.createProfile(profileToUse, existentUserOne.email, existentUserOne.password, done);
      });

      after((done) => {
        setup.deleteProfileFromSetup(profileToUse, null, done);
      });

      it('and existent serviceId without query should succeed', (done) => {
        testFlexLogs(profileToUse, null, defaultServiceId, noQuery, validUserOne, done);
      });

      it('and non-existent serviceId should fail', (done) => {
        testFlexLogs(profileToUse, null, nonExistentServiceId, noQuery, validUserOne, done);
      });

      describe('when valid project is set', () => {
        before((done) => {
          setup.createProjectSetup(null, done);
        });

        it('without serviceId as an option should succeed', (done) => {
          testFlexLogs(profileToUse, null, null, noQuery, validUserOne, done);
        });

        after((done) => {
          setup.clearProjectSetup(null, done);
        });
      });

      describe('when invalid project is set', () => {
        before((done) => {
          setup.createProjectSetup({ serviceId: nonExistentServiceId }, done);
        });

        it('with existent serviceId as an option should succeed', (done) => {
          // project contains non-existent serviceId; an existent one is provided as an option and it must be used
          testFlexLogs(profileToUse, null, defaultServiceId, noQuery, validUserOne, done);
        });

        after((done) => {
          setup.clearProjectSetup(null, done);
        });
      });

      describe('when project is not set', () => {
        before((done) => {
          setup.createProjectSetup({ serviceId: nonExistentServiceId }, done);
        });

        it('without serviceId as an option should fail', (done) => {
          const cmd = `${baseCmd} --${AuthOptionsNames.PROFILE} ${profileToUse}`;
          const apiOptions = { existentUser: existentUserOne };
          execCmdWithAssertion(cmd, null, apiOptions, true, false, true, (err) => {
            expect(err).to.not.exist;
            done();
          });
        });

        after((done) => {
          setup.clearProjectSetup(null, done);
        });
      });
    });

    describe('by not specifying profile nor credentials', () => {
      it('when one profile and existent serviceId should succeed', (done) => {
        testFlexLogs(null, null, defaultServiceId, noQuery, null, done);
      });
    });

    describe('by not specifying profile nor credentials when several profiles', () => {
      const oneMoreProfile = 'oneMoreProfile';
      before((done) => {
        setup.createProfile(oneMoreProfile, existentUserOne.email, existentUserOne.password, done);
      });

      after((done) => {
        setup.deleteProfileFromSetup(oneMoreProfile, null, done);
      });

      it('and existent serviceId should fail', (done) => {
        const cmd = `${baseCmd} --${FlexOptionsNames.SERVICE_ID} ${defaultServiceId}`;
        execCmdWithAssertion(cmd, null, null, true, false, true, (err) => {
          expect(err).to.not.exist;
          done();
        });
      });
    });

    describe('by specifying credentials as options', () => {
      it('when valid and existent serviceId should succeed', (done) => {
        testFlexLogs(null, existentUserOne, defaultServiceId, noQuery, validUserOne, done);
      });

      it('when valid and non-existent serviceId should fail', (done) => {
        testFlexLogs(null, existentUserOne, nonExistentServiceId, noQuery, validUserOne, done);
      });

      it('when invalid and existent serviceId should fail', (done) => {
        const nonExistentUser = fixtureUser.nonexistent;
        testFlexLogs(null, nonExistentUser, defaultServiceId, noQuery, validUserOne, done);
      });
    });
  });

  describe('with query', () => {
    const activeProfile = 'profileToSetAsActive';
    const noProfile = null;
    const noCredentials = null;

    // lets create one more profile apart from the one created in the beginning of the suite, set it as active and focus on the queries
    before((done) => {
      async.series([
        (next) => {
          setup.createProfile(activeProfile, existentUserOne.email, existentUserOne.password, next);
        },
        (next) => {
          setup.setActiveProfile(activeProfile, false, next);
        }
      ], done);
    });

    it('with valid timestamps and valid paging should succeed', (done) => {
      const start = '2017-08-30T08:06:49.594Z';
      const end = '2017-09-02T08:06:49';
      const pageSize = 5;
      const page = 3;
      const query = buildQueryObject(start, end, page, pageSize);
      testFlexLogs(noProfile, noCredentials, defaultServiceId, query, validUserOne, done);
    });

    it('with valid timestamps and without paging should succeed', (done) => {
      const start = '2017-08-30T08:06:49.594Z';
      const end = '2017-09-02T08:06:49.000Z';
      const query = buildQueryObject(start, end);
      testFlexLogs(noProfile, noCredentials, defaultServiceId, query, validUserOne, done);
    });

    it('with valid timestamps and invalid paging should fail', (done) => {
      const start = '2017-08-30T08:06:49.594Z';
      const end = '2017-09-02T08:06:49.000Z';
      const invalidPage = -1;
      const query = buildQueryObject(start, end, invalidPage);
      testFlexLogs(noProfile, noCredentials, defaultServiceId, query, validUserOne, done);
    });

    it('with valid start timestamp and nothing else should succeed', (done) => {
      const start = '2017-08-30T08:06:49.594Z';
      const query = buildQueryObject(start);
      testFlexLogs(noProfile, noCredentials, defaultServiceId, query, validUserOne, done);
    });

    it('with invalid start timestamp and nothing else should fail', (done) => {
      const start = '2017-30-08';
      const query = buildQueryObject(start);
      testFlexLogs(noProfile, noCredentials, defaultServiceId, query, validUserOne, done);
    });

    it('without timestamps and valid paging should succeed', (done) => {
      const pageSize = 5;
      const page = 3;
      const query = buildQueryObject(null, null, page, pageSize);
      testFlexLogs(noProfile, noCredentials, defaultServiceId, query, validUserOne, done);
    });

    it('without timestamps and page but with valid size should succeed', (done) => {
      const pageSize = 35;
      const query = buildQueryObject(null, null, null, pageSize);
      testFlexLogs(noProfile, noCredentials, defaultServiceId, query, validUserOne, done);
    });
  });
});
