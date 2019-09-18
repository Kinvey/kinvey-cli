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

const snapshot = require('snap-shot-it');

const { ConfigType } = require('../../../lib/Constants');
const SchemaValidator = require('../../../lib/SchemaValidator');
const validOrgAllOptions = require('../../fixtures/config-files/org-valid-all-options.json');
const validOrgSettingsOnly = require('../../fixtures/config-files/org-valid-settings-only.json');
const invalidOrg = require('../../fixtures/config-files/org-invalid.json');
const validAppAllOptions = require('../../fixtures/config-files/app-valid-all-options.json');
const invalidApp = require('../../fixtures/config-files/app-invalid.json');
const validEnvAllOptions = require('../../fixtures/config-files/env-valid-all-options.json');
const validEnvSomeOptions = require('../../fixtures/config-files/env-valid-some-options.json');
const invalidEnv = require('../../fixtures/config-files/env-invalid.json');
const validInternalFlexAllOptions = require('../../fixtures/config-files/flex-internal-valid-all-options.json');
const validInternalFlexSomeOptions = require('../../fixtures/config-files/flex-internal-valid-some-options.json');
const invalidInternalFlex = require('../../fixtures/config-files/flex-internal-invalid.json');
const validExternalFlexAllOptions = require('../../fixtures/config-files/flex-external-valid-all-options.json');
const validRapidDataSpSomeOptions = require('../../fixtures/config-files/rapid-data-sp-valid-some-options.json');
const invalidRapidDataSp = require('../../fixtures/config-files/rapid-data-sp-invalid.json');
const invalidRapidDataSpSomeOptions = require('../../fixtures/config-files/rapid-data-sp-invalid-some-options.json');

describe('schema validator', () => {
  describe('env', () => {
    it('with valid env with all options should succeed', (done) => {
      SchemaValidator.validate(ConfigType.ENV, validEnvAllOptions, null, (err) => {
        expect(err).to.not.exist;
        done();
      });
    });

    it('with valid env with some options should succeed', (done) => {
      SchemaValidator.validate(ConfigType.ENV, validEnvSomeOptions, null, (err) => {
        expect(err).to.not.exist;
        done();
      });
    });

    it('with invalid env should fail', (done) => {
      SchemaValidator.validate(ConfigType.ENV, invalidEnv, null, (err) => {
        expect(err).to.exist;
        expect(err.name).to.equal('ValidationError');

        const actualMsg = err.message.replace(/\r\n/g, '\n');
        try {
          snapshot(actualMsg);
        } catch (ex) {
          return done(ex);
        }

        done();
      });
    });
  });

  describe('service', () => {
    it('with valid internal flex service with all options should succeed', (done) => {
      SchemaValidator.validate(ConfigType.SERVICE, validInternalFlexAllOptions, null, (err) => {
        expect(err).to.not.exist;
        done();
      });
    });

    it('with valid internal flex with some options should succeed', (done) => {
      SchemaValidator.validate(ConfigType.SERVICE, validInternalFlexSomeOptions, null, (err) => {
        expect(err).to.not.exist;
        done();
      });
    });

    it('with invalid internal flex should fail', (done) => {
      SchemaValidator.validate(ConfigType.SERVICE, invalidInternalFlex, null, (err) => {
        expect(err).to.exist;
        expect(err.name).to.equal('ValidationError');

        const actualMsg = err.message.replace(/\r\n/g, '\n');
        try {
          snapshot(actualMsg);
        } catch (ex) {
          return done(ex);
        }

        done();
      });
    });

    it('with valid external flex service with all options should succeed', (done) => {
      SchemaValidator.validate(ConfigType.SERVICE, validExternalFlexAllOptions, null, (err) => {
        expect(err).to.not.exist;
        done();
      });
    });

    it('with valid rapid data (sharepoint) with some options should succeed', (done) => {
      SchemaValidator.validate(ConfigType.SERVICE, validRapidDataSpSomeOptions, null, (err) => {
        expect(err).to.not.exist;
        done();
      });
    });

    it('with invalid rapid data (wrong type) should fail', (done) => {
      SchemaValidator.validate(ConfigType.SERVICE, invalidRapidDataSp, null, (err) => {
        expect(err).to.exist;
        expect(err.name).to.equal('ValidationError');

        const actualMsg = err.message.replace(/\r\n/g, '\n');
        try {
          snapshot(actualMsg);
        } catch (ex) {
          return done(ex);
        }

        done();
      });
    });

    it('with invalid rapid data (sharepoint) should fail', (done) => {
      SchemaValidator.validate(ConfigType.SERVICE, invalidRapidDataSpSomeOptions, null, (err) => {
        expect(err).to.exist;
        expect(err.name).to.equal('ValidationError');

        const actualMsg = err.message.replace(/\r\n/g, '\n');
        try {
          snapshot(actualMsg);
        } catch (ex) {
          return done(ex);
        }

        done();
      });
    });
  });

  describe('app', () => {
    it('with valid app with all options and some envs should succeed', (done) => {
      SchemaValidator.validate(ConfigType.APP, validAppAllOptions, null, (err) => {
        expect(err).to.not.exist;
        done();
      });
    });

    it('with invalid app should fail', (done) => {
      SchemaValidator.validate(ConfigType.APP, invalidApp, null, (err) => {
        expect(err).to.exist;
        expect(err.name).to.equal('ValidationError');

        const actualMsg = err.message.replace(/\r\n/g, '\n');
        try {
          snapshot(actualMsg);
        } catch (ex) {
          return done(ex);
        }

        done();
      });
    });
  });

  describe('org', () => {
    it('with valid org with all options, some apps and some services should succeed', (done) => {
      SchemaValidator.validate(ConfigType.ORG, validOrgAllOptions, null, (err) => {
        expect(err).to.not.exist;
        done();
      });
    });

    it('with valid org with some settings, empty apps and no services should succeed', (done) => {
      SchemaValidator.validate(ConfigType.ORG, validOrgSettingsOnly, null, (err) => {
        expect(err).to.not.exist;
        done();
      });
    });

    it('with invalid org should fail', (done) => {
      SchemaValidator.validate(ConfigType.ORG, invalidOrg, null, (err) => {
        expect(err).to.exist;
        expect(err.name).to.equal('ValidationError');

        const actualMsg = err.message.replace(/\r\n/g, '\n');
        try {
          snapshot(actualMsg);
        } catch (ex) {
          return done(ex);
        }

        done();
      });
    });
  });
});
