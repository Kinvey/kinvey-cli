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

const config = require('config');
const api = require('../api.js');
const prompt = require('../../lib/prompt.js');
const user = require('../../lib/user.js');
const util = require('../../lib/util.js');
const constants = require('../../lib/constants');

const loginTestsHelper = {
  assertLoginIsSuccessful(err, mock, token, cb) {
    expect(err).to.not.exist;
    expect(user.isLoggedIn()).to.be.true;
    expect(user.getToken()).to.equal(token);
    expect(mock.isDone()).to.be.true;
    cb();
  },
  setCredentialsInEnvironment(user, password) {
    process.env[constants.EnvironmentVariables.USER] = user;
    process.env[constants.EnvironmentVariables.PASSWORD] = password;
  },
  unsetCredentialsInEnvironment() {
    delete process.env[constants.EnvironmentVariables.USER];
    delete process.env[constants.EnvironmentVariables.PASSWORD];
  }
};

describe('user', () => {
  const invalidEmail = 'invalid@example.com';
  const invalidPassword = 'invalidPass';

  describe('isLoggedIn', () => {
    it('should true if the token was set.', () => {
      user.host = 'abc';
      user.tokens = {
        abc: 123
      };
      expect(user.isLoggedIn()).to.be.true;
    });

    it('should false if the token was not set.', () => {
      user.tokens = null;
      user.host = null;
      expect(user.isLoggedIn()).to.be.false;
    });
  });

  describe('login', () => {
    beforeEach('token', () => {
      user.token = null;
    });
    before('token', () => {
      this.token = '123';
    });
    after('token', () => {
      delete this.token;
    });
    before('email', () => {
      this.email = 'bob@example.com';
    });
    before('password', () => {
      this.password = 'test123';
    });
    after('email', () => {
      delete this.email;
    });
    after('password', () => {
      delete this.password;
    });

    describe('given valid credentials', () => {
      beforeEach('api', () => {
        this.mock = api
          .post('/session', { email: this.email, password: this.password })
          .reply(200, { email: this.email, token: this.token
        });
      });

      afterEach('api', () => {
        delete this.mock;
        loginTestsHelper.unsetCredentialsInEnvironment();
      });

      it('as args should login.', (cb) => {
        user.login(this.email, this.password, null, (err) => {
          loginTestsHelper.assertLoginIsSuccessful(err, this.mock, this.token, cb);
        });
      });

      it('as env variables should login', (cb) => {
        loginTestsHelper.setCredentialsInEnvironment(this.email, this.password);

        user.login(null, null, null, (err) => {
          loginTestsHelper.assertLoginIsSuccessful(err, this.mock, this.token, cb);
        });
      });

      it('as args and invalid as env variables should login', (cb) => {
        loginTestsHelper.setCredentialsInEnvironment(invalidEmail, invalidPassword);

        user.login(this.email, this.password, null, (err) => {
          loginTestsHelper.assertLoginIsSuccessful(err, this.mock, this.token, cb);
        });
      });
    });

    describe('given invalid credentials', () => {
      beforeEach('api', () => {
        this.mock = api.post('/session')
          .reply(401, {
            code: 'InvalidCredentials',
            description: ''
          });
      });
      afterEach('api', () => {
        loginTestsHelper.unsetCredentialsInEnvironment();
        this.mock.done();
        delete this.mock;
      });
      before('stub', () => {
        const stub = sinon.stub(prompt, 'getEmailPassword');
        stub.callsArgWith(2, null, this.email, this.password);
      });
      afterEach('stub', () => {
        prompt.getEmailPassword.reset();
      });
      after('stub', () => {
        prompt.getEmailPassword.restore();
      });

      it('should not retry when credentials are provided as args', (cb) => {
        user.login(invalidEmail, this.password, null, (err) => {
          expect(prompt.getEmailPassword).to.be.calledOnce;
          expect(prompt.getEmailPassword).to.be.calledWith(invalidEmail, this.password);
          cb(err);
        });
      });

      it('should not retry when credentials are provided from environment', (cb) => {
        loginTestsHelper.setCredentialsInEnvironment(invalidEmail, invalidPassword);

        user.login(null, null, null, (err) => {
          expect(err).to.not.exist;
          expect(prompt.getEmailPassword).to.be.calledOnce;
          expect(prompt.getEmailPassword).to.be.calledWith(invalidEmail, invalidPassword);
          cb();
        });
      });
    });

    describe('given incomplete credentials', () => {
      beforeEach('api', () => {
        this.mock = api.post('/session').reply(200, {
          email: this.email,
          token: this.token
        });
      });
      afterEach('api', () => {
        this.mock.done();
        delete this.mock;
      });
      before('stub', () => {
        const stub = sinon.stub(prompt, 'getEmailPassword');
        stub.callsArgWith(2, null, this.email, this.password);
      });
      afterEach('stub', () => {
        prompt.getEmailPassword.reset();
      });
      after('stub', () => {
        prompt.getEmailPassword.restore();
      });
      it('should prompt.', (cb) => {
        user.login(null, this.password, null, ((err) => {
          expect(prompt.getEmailPassword).to.be.calledOnce;
          expect(prompt.getEmailPassword).to.be.calledWith(null, this.password);
          cb(err);
        }));
      });
    });
  });
  describe('2FA login', () => {
    beforeEach('token', () => {
      user.token = null;
    });
    before('token', () => {
      this.token = '123';
    });
    after('token', () => {
      delete this.token;
    });
    before('email', () => {
      this.email = 'bob@example.com';
    });
    before('password', () => {
      this.password = 'test123';
    });
    before('token', () => {
      this.token = 123456;
    });
    after('token', () => {
      delete this.token;
    });
    after('email', () => {
      delete this.email;
    });
    after('password', () => {
      delete this.password;
    });
    describe('given valid token as option', () => {
      beforeEach('api', () => {
        this.mock = api.post('/session').reply(200, {
          email: this.email,
          token: this.token
        });
      });
      afterEach('api', () => {
        this.mock.done();
        delete this.mock;
      });
      it('should login.', (cb) => {
        user.mfaLogin(this.email, this.password, this.token, (err) => {
          expect(user.isLoggedIn()).to.be.true;
          expect(user.getToken()).to.equal(this.token);
          cb(err);
        });
      });
    });
    describe('given invalid credentials', () => {
      beforeEach('api', () => {
        this.mock = api.post('/session')
          .reply(401, {
            code: 'InvalidTwoFactorAuth',
            description: ''
          })
          .post('/session')
          .reply(200, {
            email: this.email,
            token: this.token
          });
      });
      afterEach('api', () => {
        this.mock.done();
        delete this.mock;
      });
      before('stub', () => {
        const stub = sinon.stub(prompt, 'getTwoFactorToken');
        stub.callsArgWith(1, null, this.token);
      });
      afterEach('stub', () => {
        prompt.getTwoFactorToken.reset();
      });
      after('stub', () => {
        prompt.getTwoFactorToken.restore();
      });
      it('should retry.', (cb) => {
        user.mfaLogin(this.email, this.password, null, (err) => {
          expect(prompt.getTwoFactorToken).to.be.calledTwice;
          expect(prompt.getTwoFactorToken).to.be.calledWith(null);
          cb(err);
        });
      });
    });
    describe('given incomplete credentials', () => {
      beforeEach('api', () => {
        this.mock = api.post('/session').reply(200, {
          email: this.email,
          token: this.token
        });
      });
      afterEach('api', () => {
        this.mock.done();
        delete this.mock;
      });
      before('stub', () => {
        const stub = sinon.stub(prompt, 'getTwoFactorToken');
        stub.callsArgWith(1, null, this.token);
      });
      afterEach('stub', () => {
        prompt.getTwoFactorToken.reset();
      });
      after('stub', () => {
        prompt.getTwoFactorToken.restore();
      });
      it('should prompt.', (cb) => {
        user.mfaLogin(this.email, this.password, null, ((err) => {
          expect(prompt.getTwoFactorToken).to.be.calledOnce;
          expect(prompt.getTwoFactorToken).to.be.calledWith(null);
          cb(err);
        }));
      });
    });
  });
  describe('logout', () => {
    before('stub', () => {
      sinon.stub(util, 'writeJSON').callsArg(2);
    });
    afterEach('stub', () => {
      util.writeJSON.reset();
    });
    after('stub', () => {
      util.writeJSON.restore();
    });
    it('should clear token data from session file.', (cb) => {
      user.logout((err) => {
        expect(util.writeJSON).to.be.calledOnce;
        expect(util.writeJSON).to.be.calledWith(config.paths.session, '');
        cb(err);
      });
    });
  });
  describe('refresh', () => {
    before('token', () => {
      this.token = '123';
    });
    after('token', () => {
      delete this.token;
    });
    before('login', () => {
      sinon.stub(user, 'login').callsArg(3);
    });
    afterEach('login', () => {
      user.login.reset();
    });
    after('login', () => {
      user.login.restore();
    });
    before('save', () => {
      sinon.stub(user, 'save').callsArg(0);
    });
    afterEach('save', () => {
      user.save.reset();
    });
    after('save', () => {
      user.save.restore();
    });
    it('should login.', (cb) => {
      user.refresh((err) => {
        expect(user.login).to.be.calledOnce;
        expect(user.login).to.be.calledWith(null, null);
        expect(user.token).to.be.null;
        cb(err);
      });
    });
    it('should save.', (cb) => {
      user.refresh((err) => {
        expect(user.save).to.be.calledOnce;
        cb(err);
      });
    });
  });
  describe('restore', () => {
    beforeEach('token', () => {
      user.token = null;
      user.host = null;
    });
    describe('when the session file exists', () => {
      before('token', () => {
        this.token = '123';
      });
      after('token', () => {
        delete this.token;
      });
      before('host', () => {
        this.host = 'abc';
      });
      after('host', () => {
        delete this.host;
      });
      before('stub', () => {
        const tokens = {};
        tokens[this.host] = this.token;
        sinon.stub(util, 'readJSON').callsArgWith(1, null, {
          tokens
        });
      });
      afterEach('stub', () => {
        util.readJSON.reset();
      });
      after('stub', () => {
        util.readJSON.restore();
      });
      it('should set the user token.', (cb) => {
        user.host = this.host;
        user.restore((err) => {
          expect(util.readJSON).to.be.calledOnce;
          expect(util.readJSON).to.be.calledWith(config.paths.session);
          expect(user.getToken()).to.equal(this.token);
          expect(user.host).to.equal(this.host);
          cb(err);
        });
      });
    });
    describe('when the session file does not exist', () => {
      before('login', () => {
        sinon.stub(user, 'login').callsArg(3);
      });
      afterEach('login', () => {
        user.login.reset();
      });
      after('login', () => {
        user.login.restore();
      });
      before('readJSON', () => {
        sinon.stub(util, 'readJSON').callsArgWith(1, null, {});
      });
      afterEach('readJSON', () => {
        util.readJSON.reset();
      });
      after('readJSON', () => {
        util.readJSON.restore();
      });
      it('should login.', (cb) => {
        user.restore((err) => {
          expect(user.login).to.be.calledOnce;
          expect(user.login).to.be.calledWith(null, null);
          expect(user.token).to.be.null;
          cb(err);
        });
      });
    });
  });
  describe('when the session file is empty', () => {
    before('login', () => {
      sinon.stub(user, 'login').callsArg(3);
    });
    afterEach('login', () => {
      user.login.reset();
    });
    after('login', () => {
      user.login.restore();
    });
    before('readJSON', () => {
      sinon.stub(util, 'readJSON').callsArgWith(1, null, null);
    });
    afterEach('readJSON', () => {
      util.readJSON.reset();
    });
    after('readJSON', () => {
      util.readJSON.restore();
    });
    it('should login.', (cb) => {
      user.restore((err) => {
        expect(user.login).to.be.calledOnce;
        expect(user.login).to.be.calledWith(null, null);
        expect(user.host).to.equal(config.host);
        cb(err);
      });
    });
  });
  describe('save', () => {
    before('stub', () => {
      sinon.stub(util, 'writeJSON').callsArg(2);
    });
    afterEach('stub', () => {
      util.writeJSON.reset();
    });
    after('stub', () => {
      util.writeJSON.restore();
    });
    it('should write the token to file.', (cb) => {
      user.save((err) => {
        const tokens = {
          host: 'https://manage.kinvey.com/',
          tokens: {
            abc: '123'
          }
        };
        tokens.tokens['https://manage.kinvey.com/'] = null;
        expect(util.writeJSON).to.be.calledOnce;
        expect(util.writeJSON).to.be.calledWith(config.paths.session, tokens);
        cb(err);
      });
    });
  });
  describe('setup', () => {
    const email = 'bob@example.com';
    const password = 'test123';

    before('login', () => {
      sinon.stub(user, 'login').callsArg(3);
    });
    afterEach('login', () => {
      user.login.reset();
      loginTestsHelper.unsetCredentialsInEnvironment();
    });
    after('login', () => {
      user.login.restore();
    });
    before('restore', () => {
      sinon.stub(user, 'restore').callsArg(0);
    });
    afterEach('restore', () => {
      user.restore.reset();
    });
    after('restore', () => {
      user.restore.restore();
    });

    it('should restore the user session.', (cb) => {
      user.setup({}, (err) => {
        expect(user.restore).to.be.calledOnce;
        cb(err);
      });
    });

    it('should login given email.', (cb) => {
      user.setup({ email }, (err) => {
        expect(user.login).to.be.calledOnce;
        expect(user.login).to.be.calledWith(email, undefined, undefined);
        cb(err);
      });
    });

    it('should login given password.', (cb) => {
      user.setup({ password }, (err) => {
        expect(user.login).to.be.calledOnce;
        expect(user.login).to.be.calledWith(undefined, password, undefined);
        cb(err);
      });
    });
    it('should login given token.', (cb) => {
      const options = {
        token: '123456'
      };
      user.setup(options, (err) => {
        expect(user.login).to.be.calledOnce;
        expect(user.login).to.be.calledWith(undefined, undefined, options.token);
        cb(err);
      });
    });

    it('should login given email and password in options and invalid ones in environment', (cb) => {
      loginTestsHelper.setCredentialsInEnvironment(invalidEmail, invalidPassword);

      user.setup({ email, password }, (err) => {
        expect(err).to.not.exist;
        expect(user.login).to.be.calledOnce;
        expect(user.login).to.be.calledWith(email, password);
        cb();
      });
    });

    it('should login given email, password, and token.', (cb) => {
      const options = {
        email: 'bob@example.com',
        password: 'test123',
        token: '123456'
      };
      user.setup(options, (err) => {
        expect(user.login).to.be.calledOnce;
        expect(user.login).to.be.calledWith(options.email, options.password, options.token);
        cb(err);
      });
    });
  });
});
