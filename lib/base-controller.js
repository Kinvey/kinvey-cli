class BaseController {
  constructor({ cliManager }) {
    this.cliManager = cliManager;
  }

  processAuthOptions(options, done) {
    this.cliManager.setCurrentUserFromOptions(options, done);
  }
}

module.exports = BaseController;
