
const sinon = require('sinon');
const command = require('./fixtures/command.js');
const service = require('../lib/service.js');
const deploy = require('../cmd/deploy.js');
const pkg = require('../package.json');
const project = require('../lib/project.js');
const user = require('../lib/user.js');

describe(`./${pkg.name} deploy`, () => {
  before('user', () => {
    return sinon.stub(user, 'setup').callsArg(1);
  });
  afterEach('user', () => {
    return user.setup.reset();
  });
  after('user', () => {
    return user.setup.restore();
  });

  before('project', () => {
    return sinon.stub(project, 'restore').callsArg(0);
  });
  afterEach('project', () => {
    return project.restore.reset();
  });
  after('project', () => {
    return project.restore.restore();
  });

  before('validate', () => {
    return sinon.stub(service, 'validate').callsArg(1);
  });
  afterEach('validate', () => {
    return service.validate.reset();
  });
  after('validate', () => {
    return service.validate.restore();
  });

  before('deploy', () => {
    return sinon.stub(service, 'deploy').callsArg(1);
  });
  afterEach('deploy', () => {
    return service.deploy.reset();
  });
  after('deploy', () => {
    return service.deploy.restore();
  });

  it('should setup the user.', (cb) => {
    return deploy.call(command, command, (err) => {
      expect(user.setup).to.be.calledOnce;
      return cb(err);
    });
  });
  it('should restore the project.', (cb) => {
    return deploy.call(command, command, (err) => {
      expect(project.restore).to.be.calledOnce;
      return cb(err);
    });
  });
  it('should validate the service.', (cb) => {
    return deploy.call(command, command, (err) => {
      expect(service.validate).to.be.calledOnce;
      return cb(err);
    });
  });
  return it('should deploy the service.', (cb) => {
    return deploy.call(command, command, (err) => {
      expect(service.deploy).to.be.calledOnce;
      return cb(err);
    });
  });
});
