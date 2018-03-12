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

const sinon = require('sinon');

const ProjectSetup = require('../../../lib/ProjectSetup');
const Utils = require('../../../lib/Utils');

const projectPath = 'fakePath';
const serviceId = '123';
const flexNs = {
  serviceId,
  serviceName: 'Monday',
  domain: 'app',
  domainEntityId: '5678',
  schemaVersion: 2
};

describe('ProjectSetup', () => {
  const key = 'testUser';

  it('when only serviceId should set correctly flex namespace', () => {
    const setup = new ProjectSetup(projectPath);
    setup.setFlexNamespace(key, { serviceId });
    const actual = setup.getFlexNamespace(key);
    expect(actual).to.be.an('object');
    expect(actual.serviceId).to.equal(serviceId);
  });

  it('when all properties and a few redundant should set correctly flex namespace', () => {
    const setup = new ProjectSetup(projectPath);
    const flexNsWithRedundantProps = Object.assign({}, flexNs);
    flexNsWithRedundantProps.firstProp = 'hey';
    flexNsWithRedundantProps.secondProp = 0;
    setup.setFlexNamespace(key, flexNsWithRedundantProps);
    const actual = setup.getFlexNamespace(key);
    expect(actual).to.be.an('object');
    expect(actual).to.deep.equal(flexNs);
  });

  describe('load', () => {
    const sandbox = sinon.sandbox.create();

    afterEach('resetStubs', () => {
      sandbox.reset();
    });

    after('cleanupStubs', () => {
      sandbox.restore();
    });

    it('should return error if one occurs', () => {
      sandbox.stub(Utils, 'readJSONSync').throws();
      const setup = new ProjectSetup(projectPath);
      const actual = setup.load();
      expect(actual).to.exist;
      expect(actual).to.be.an('error');
    });
  });
});
