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

const { CommonOptionsNames, OutputFormat } = require('./../../../../lib/Constants');
const { assertions, buildCmd, execCmdWithAssertion, setup, testTooManyArgs } = require('../../../TestsHelper');

const baseCmd = 'flex delete';

describe(`${baseCmd}`, () => {
  before((done) => {
    setup.clearProjectSetup(null, done);
  });

  after((done) => {
    setup.clearProjectSetup(null, done);
  });

  describe('when project is not set', () => {
    it('should succeed and output default format', (done) => {
      const cmd = buildCmd(baseCmd, null, null, [CommonOptionsNames.VERBOSE]);

      execCmdWithAssertion(cmd, null, null, true, true, false, (err) => {
        expect(err).to.not.exist;

        assertions.assertProjectSetup(null, null, (err) => {
          expect(err).to.not.exist;
          done();
        });
      });
    });

    it('should succeed and output JSON', (done) => {
      const cmd = buildCmd(baseCmd, null, { [CommonOptionsNames.OUTPUT]: OutputFormat.JSON }, [CommonOptionsNames.VERBOSE]);

      execCmdWithAssertion(cmd, null, null, true, true, false, (err) => {
        expect(err).to.not.exist;

        assertions.assertProjectSetup(null, null, (err) => {
          expect(err).to.not.exist;
          done();
        });
      });
    });
  });

  describe('when project is set', () => {
    before((done) => {
      setup.createProjectSetup('testName', null, done);
    });

    after((done) => {
      setup.clearProjectSetup(null, done);
    });

    it('should succeed', (done) => {
      const cmd = buildCmd(baseCmd, null, null, [CommonOptionsNames.VERBOSE]);

      execCmdWithAssertion(cmd, null, null, true, true, false, (err) => {
        expect(err).to.not.exist;

        assertions.assertProjectSetup(null, null, (err) => {
          expect(err).to.not.exist;
          done();
        });
      });
    });

    it('with too many args should fail', (done) => {
      testTooManyArgs(baseCmd, 1, done);
    });
  });
});
