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

const cloneDeep = require('lodash.clonedeep');

const { AuthOptionsNames, CommonOptionsNames, EnvironmentVariables, OutputFormat } = require('./../../../../lib/Constants');
const testsConfig = require('../../../TestsConfig');
const { assertions, execCmdWithAssertion, setup, testTooManyArgs } = require('../../../TestsHelper');

const fixtureUser = require('./../../../fixtures/user.json');
const mockServer = require('../../../mockServer');
const path = require('path');

const suppose = require('suppose');
const fs = require('fs');
const assert = require('assert');

const outputFile = './output.txt';
const existentUser = fixtureUser.existent;
const nonExistentUser = fixtureUser.nonexistent;

const baseCmd = 'profile create';
const initCommand = 'init';


describe('init', () => {
    const expectedValidUser = {
        host: testsConfig.host,
        email: existentUser.email,
        token: fixtureUser.token
    };

    const defaultProfileName = 'testProfile';
    const expectedProfile = assertions.buildExpectedProfile(defaultProfileName, expectedValidUser.host, expectedValidUser.email, expectedValidUser.token);
    const expectedProfiles = assertions.buildExpectedProfiles(expectedProfile);
    const defaultExpectedSetup = assertions.buildExpectedGlobalSetup({}, expectedProfiles);

    const defaultEnv = {
        NODE_CONFIG: JSON.stringify(testsConfig)
    };

    const defaultEnvWithDebug = {
        env: defaultEnv,
        debug: fs.createWriteStream(outputFile)
    };


    let ms = {};
    const cliPath = path.join('bin', 'kinvey');

    before((done) => {
        setup.clearGlobalSetup(null, (err) => {
            if (err) {
                return done(err);
            }

            mockServer(null, (err, server) => {
                if (err) {
                    return done(err);
                }

                ms = server;
                done();
            });
        });
    });

    after((done) => {
        setup.clearGlobalSetup(null, done);
    });

    describe('with valid credentials', () => {
        it('should create a valid profile', (done) => {
            suppose(cliPath, [initCommand], defaultEnvWithDebug)
                .when(/\? E-mail \(email\) /).respond(`${existentUser.email}\n`)
                .when(/\? Password /).respond(`${existentUser.password}\n`)
                .when(/\? Instance ID \(optional\) /).respond('\n')
                .when(/\? Profile name /).respond(`${defaultProfileName}\n`)
                .on('error', done)
                .end((exitCode) => {
                    expect(exitCode).to.equal(0);
                    fs.readFile(outputFile, (err, data) => {

                        if (err) {
                            return done(err);
                        }
                        const fileContent = String.fromCharCode.apply(null, data);
                        expect(fileContent).to.contain(`Created profile: ${defaultProfileName}`);
                        assertions.assertGlobalSetup(defaultExpectedSetup, testsConfig.paths.session, (err) => {
                            expect(err).to.not.exist;
                            done();
                        });
                    });
                });
        });
    });
});
