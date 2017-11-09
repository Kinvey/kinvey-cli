const path = require('path');
const os = require('os');

const port = 3234;
const host = `http://localhost:${port}/`;
const globalSetupPath = path.join(os.homedir(), '.kinvey-cli-tests');
const testsConfig = {
  port,
  host,
  defaultSchemaVersion: 2,
  paths: {
    project: path.join(process.cwd(), 'test/integration/project', '.kinvey'),
    package: path.join(process.cwd(), 'test/integration/project'),
    session: globalSetupPath
  }
};

module.exports = testsConfig;
