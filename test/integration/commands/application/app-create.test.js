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

const { Namespace, OrgOptionsName } = require('./../../../../lib/Constants');
const fixtureApp = require('./../../../fixtures/app.json');
const fixtureOrg = require('./../../../fixtures/org');
const { setup, testers } = require('../../../TestsHelper');

const baseCmd = `${Namespace.APP} create`;
const activeProfile = 'activeProfile';
const appName = fixtureApp.name;

function testAppCreate(options, flags, name, done) {
  testers.execCmdWithIdentifier(baseCmd, options, flags, name, null, done);
}

describe(baseCmd, () => {
  const defaultFlags = testers.getDefaultFlags();

  before((done) => {
    async.series([
      (next) => {
        setup.clearGlobalSetup(null, next);
      },
      (next) => {
        setup.setActiveProfile(activeProfile, true, next);
      }
    ], done);
  });

  after((done) => {
    setup.clearGlobalSetup(null, done);
  });

  it('with a name without org should fail', (done) => {
    testAppCreate(null, defaultFlags, appName, done);
  });

  it('with a name and existent org identifier (name) should succeed', (done) => {
    testAppCreate({ [OrgOptionsName.ORG]: JSON.stringify(fixtureOrg.name) }, defaultFlags, appName, done);
  });

  it('with a name and existent org identifier (ID) should succeed and output JSON', (done) => {
    const options = Object.assign(testers.getJsonOptions(), { [OrgOptionsName.ORG]: fixtureOrg.id });
    testAppCreate(options, defaultFlags, appName, done);
  });

  it('without a name should fail', (done) => {
    testAppCreate({ [OrgOptionsName.ORG]: fixtureOrg.id }, defaultFlags, null, done);
  });
});
