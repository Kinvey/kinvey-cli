exports['profile create with valid credentials set as options should create 1'] = `
debug:  Checking for package updates
debug:  Request:  POST http://localhost:3234/session
debug:  Response: POST http://localhost:3234/session 200
debug:  Writing JSON to file globalSetupPath
debug:  Writing contents to file globalSetupPath
info:  Successfully created profile with name 'testProfile'.

`

exports['profile create with valid credentials set as options and existent profile name should override 1'] = `
debug:  Checking for package updates
debug:  Overriding profile with name 'testProfile'.
debug:  Request:  POST http://localhost:3234/session
debug:  Response: POST http://localhost:3234/session 200
debug:  Writing JSON to file globalSetupPath
debug:  Writing contents to file globalSetupPath
info:  Successfully created profile with name 'testProfile'.

`

exports['profile create with valid credentials set as environment variables should create 1'] = `
debug:  Checking for package updates
debug:  Request:  POST http://localhost:3234/session
debug:  Response: POST http://localhost:3234/session 200
debug:  Writing JSON to file globalSetupPath
debug:  Writing contents to file globalSetupPath
info:  Successfully created profile with name 'testProfile'.

`

exports['profile create with valid credentials set as options and as environment variables should create 1'] = `
debug:  Checking for package updates
debug:  Request:  POST http://localhost:3234/session
debug:  Response: POST http://localhost:3234/session 200
debug:  Writing JSON to file globalSetupPath
debug:  Writing contents to file globalSetupPath
info:  Successfully created profile with name 'testProfile'.

`

exports['profile create with valid credentials set as options + host should create 1'] = `
debug:  Checking for package updates
debug:  Request:  POST http://localhost:6080/session
debug:  Response: POST http://localhost:6080/session 200
debug:  Writing JSON to file globalSetupPath
debug:  Writing contents to file globalSetupPath
info:  Successfully created profile with name 'testProfile'.

`

exports['profile create with invalid credentials set as options should fail 1'] = `
debug:  Checking for package updates
debug:  Request:  POST http://localhost:3234/session
debug:  Response: POST http://localhost:3234/session 401
error:  InvalidCredentials: Credentials are invalid. Please authenticate.

`

exports['profile create with insufficient info without password should fail 1'] = `
debug:  Checking for package updates
debug:  Request:  POST http://localhost:3234/session
debug:  Response: POST http://localhost:3234/session 422
error:  ValidationError: Validation failed.

`

exports['profile create with insufficient info without profile name should fail 1'] = `
bin\cli.js profile create <name>

Options:
  --version                 Show version number                        [boolean]
  --email                   E-mail address of your Kinvey account       [string]
  --password                Password of your Kinvey account             [string]
  --host                    Host of the Kinvey service                  [string]
  --profile                 Profile to use                              [string]
  --silent                  Do not output anything                     [boolean]
  --suppress-version-check  Do not check for package updates           [boolean]
  --verbose                 Output debug messages                      [boolean]
  -h, --help                Show help                                  [boolean]

Not enough non-option arguments: got 0, need at least 1

`
