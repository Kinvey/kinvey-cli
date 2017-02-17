
const config = require('config');
const program = require('commander');
const sinon = require('sinon');
const updateNotifier = require('update-notifier').UpdateNotifier;
const cli = require('../bin/kinveyCli.js');
const init = require('../lib/init.js');
const logger = require('../lib/logger.js');
const pkg = require('../package.json');
const request = require('../lib/request.js');

describe(`./${pkg.name}`, () => {
  before('command', () => {
    return program.command('test').action(init);
  });
  after('command', () => {
    logger.config({
      level: 3
    });
    return request.Request = request.Request.defaults({
      baseUrl: config.host
    });
  });
  before('stub', () => {
    return sinon.stub(logger, 'config');
  });
  afterEach('stub', () => {
    return logger.config.reset();
  });
  after('stub', () => {
    return logger.config.restore();
  });
  describe('-s, --silent', () => {
    return it('should not output anything.', () => {
      cli(['node', pkg.name, 'test', '--silent']);
      return expect(logger.config).to.be.calledWith({
        level: 3
      });
    });
  });
  describe('-c, --suppress-version-check', () => {
    before('stub', () => {
      return sinon.stub(updateNotifier.prototype, 'notify');
    });
    afterEach('stub', () => {
      return updateNotifier.prototype.notify.reset();
    });
    after('stub', () => {
      return updateNotifier.prototype.notify.restore();
    });
    return it('should not check for package updates.', () => {
      cli(['node', pkg.name, 'test', '--suppress-version-check']);
      return expect(updateNotifier.prototype.notify).not.to.be.called;
    });
  });
  return describe('-v, --verbose', () => {
    return it('should output debug messages.', () => {
      cli(['node', pkg.name, 'test', '--verbose']);
      return expect(logger.config).to.be.calledWith({
        level: 0
      });
    });
  });
});
