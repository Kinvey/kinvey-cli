const fixtureUser = require('./fixtures/user.json');
const fixtureApps = require('./fixtures/apps.json');
const fixtureApp = require('./fixtures/app.json');
const fixtureServices = require('./fixtures/datalinks.json');
const config = require('config');
const nock = require('nock');

class MockServer {
  constructor(requireAuth, url = config.host) {
    this.server = nock(url);
    this.requireAuth = requireAuth;
    return this;
  }

  _isAuth(headers) {
    if (!this.requireAuth) {
      return true;
    }

    return headers && headers.authorization === `Kinvey ${fixtureUser.token}`;
  }

  _buildReply(reqHeaders, successReply) {
    if (this._isAuth(reqHeaders)) {
      return successReply;
    }

    return [
      401,
      { code: 'InvalidCredentials', description: '' }
    ];
  }

  login(validCredentials = fixtureUser.existent, invalidCredentials = fixtureUser.nonexistent) {
    this.server
      .post('/session', validCredentials)
      .reply(200, { email: validCredentials.email, token: fixtureUser.token })
      .post('/session', invalidCredentials)
      .reply(401, { code: 'InvalidCredentials', description: '' });
  }

  apps() {
    const self = this;

    this.server
      .get('/apps')
      .reply(function() {
        return self._buildReply(this.req.headers, [200, fixtureApps]);
      });
  }
///v2/apps/123/data-links
  dataLinks(appId = fixtureApp.id) {
    const self = this;
    this.server
      .get(`/v2/apps/${appId}/data-links`)
      .reply(function() {
        return self._buildReply(this.req.headers, [200, fixtureServices]);
      });
  }

  static clearAll() {
    nock.cleanAll();
  }
}

module.exports = MockServer;