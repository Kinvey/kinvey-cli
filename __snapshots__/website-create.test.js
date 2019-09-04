exports['website create using active profile with a name and app id should succeed and output JSON 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: 885f5d307afd4168bebca1a64f815c1e
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e 200
[debug] Request:  POST http://localhost:3234/v3/sites
[debug] Response: POST http://localhost:3234/v3/sites 201
[debug] Request:  POST http://localhost:3234/v3/sites/9caf90c31c4449f195a1a40acc979cf0/environments
[debug] Response: POST http://localhost:3234/v3/sites/9caf90c31c4449f195a1a40acc979cf0/environments 201
{
  "result": {
    "id": "9caf90c31c4449f195a1a40acc979cf0"
  }
}

`

exports['website create using active profile with a name and org ID should succeed and output JSON 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using organization: f71b0d5e60684b48b8265e7fa50302b9
[debug] Request:  GET http://localhost:3234/v3/organizations/f71b0d5e60684b48b8265e7fa50302b9
[debug] Response: GET http://localhost:3234/v3/organizations/f71b0d5e60684b48b8265e7fa50302b9 200
[debug] Request:  POST http://localhost:3234/v3/sites
[debug] Response: POST http://localhost:3234/v3/sites 201
[debug] Request:  POST http://localhost:3234/v3/sites/9caf90c31c4449f195a1a40acc979cf0/environments
[debug] Response: POST http://localhost:3234/v3/sites/9caf90c31c4449f195a1a40acc979cf0/environments 201
{
  "result": {
    "id": "9caf90c31c4449f195a1a40acc979cf0"
  }
}

`

exports['website create using active profile with a name and org name should succeed and output default format 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using organization: My Team
[debug] Request:  GET http://localhost:3234/v3/organizations
[debug] Response: GET http://localhost:3234/v3/organizations 200
[debug] Request:  POST http://localhost:3234/v3/sites
[debug] Response: POST http://localhost:3234/v3/sites 201
[debug] Request:  POST http://localhost:3234/v3/sites/9caf90c31c4449f195a1a40acc979cf0/environments
[debug] Response: POST http://localhost:3234/v3/sites/9caf90c31c4449f195a1a40acc979cf0/environments 201
Created website: 9caf90c31c4449f195a1a40acc979cf0

`

exports['website create using active profile with name and app name should succeed and output default format 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: TestApp
[debug] Request:  GET http://localhost:3234/v3/apps
[debug] Response: GET http://localhost:3234/v3/apps 200
[debug] Request:  POST http://localhost:3234/v3/sites
[debug] Response: POST http://localhost:3234/v3/sites 201
[debug] Request:  POST http://localhost:3234/v3/sites/9caf90c31c4449f195a1a40acc979cf0/environments
[debug] Response: POST http://localhost:3234/v3/sites/9caf90c31c4449f195a1a40acc979cf0/environments 201
Created website: 9caf90c31c4449f195a1a40acc979cf0

`

exports['website create using active profile with name and non-existent app name should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: noSuchApp
[debug] Request:  GET http://localhost:3234/v3/apps
[debug] Response: GET http://localhost:3234/v3/apps 200
[error] NotFound: Could not find application with identifier 'noSuchApp'.

`

exports['website create using active profile with name only should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[error] AppOrOrgRequired: Either '--app' or '--org' option must be set.

`

exports['website create using active profile with name, app id, historyApiRouting and indexPage should succeed and output default format 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: 885f5d307afd4168bebca1a64f815c1e
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e 200
[debug] Request:  POST http://localhost:3234/v3/sites
[debug] Response: POST http://localhost:3234/v3/sites 201
[debug] Request:  POST http://localhost:3234/v3/sites/9caf90c31c4449f195a1a40acc979cf0/environments
[debug] Response: POST http://localhost:3234/v3/sites/9caf90c31c4449f195a1a40acc979cf0/environments 201
Created website: 9caf90c31c4449f195a1a40acc979cf0

`

exports['website create using active profile with name, app name, historyApiRouting and errorPage should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[error] Cannot set errorPage when historyApiRouting is enabled.

`

exports['website create using active profile without a name should fail 1'] = `
kinvey website create <name>

Create a website

Positionals:
  name  Website name                                                  [required]

Options:
  --version                                 Show version number        [boolean]
  --email                                   E-mail address of your Kinvey
                                            account                     [string]
  --password                                Password of your Kinvey account
                                                                        [string]
  --2fa, --2Fa                              Two-factor authentication token
                                                                        [string]
  --instance-id, --instanceId               Instance ID                 [string]
  --profile                                 Profile to use              [string]
  --output                                  Output format
                                                      [string] [choices: "json"]
  --silent                                  Do not output anything     [boolean]
  --suppress-version-check,                 Do not check for package updates
  --suppressVersionCheck                                               [boolean]
  --verbose                                 Output debug messages      [boolean]
  --no-color, --noColor                     Disable colors             [boolean]
  -h, --help                                Show help                  [boolean]
  --app                                     App ID/name                 [string]
  --org                                     Org ID/name                 [string]
  --indexPage                               Index page                  [string]
  --errorPage                               Error page                  [string]
  --historyApiRouting                       Enable server support for History
                                            API routing
                                                      [boolean] [default: false]

Not enough non-option arguments: got 0, need at least 1

`

exports['website create using one-time session with a name and app name should succeed and output default format 1'] = `
[debug] Checking for package updates
[debug] Logging in user: janeyDoe@mail.com
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 200
[debug] Using application: TestApp
[debug] Request:  GET http://localhost:3234/v3/apps
[debug] Response: GET http://localhost:3234/v3/apps 200
[debug] Request:  POST http://localhost:3234/v3/sites
[debug] Response: POST http://localhost:3234/v3/sites 201
[debug] Request:  POST http://localhost:3234/v3/sites/9caf90c31c4449f195a1a40acc979cf0/environments
[debug] Response: POST http://localhost:3234/v3/sites/9caf90c31c4449f195a1a40acc979cf0/environments 201
[debug] Request:  DELETE http://localhost:3234/session
[debug] Response: DELETE http://localhost:3234/session 204
[debug] Logged out current user.
Created website: 9caf90c31c4449f195a1a40acc979cf0

`

exports['website create without auth should fail 1'] = `
[debug] Checking for package updates
kinvey website create <name>

Create a website

Positionals:
  name  Website name                                                  [required]

Options:
  --version                                 Show version number        [boolean]
  --email                                   E-mail address of your Kinvey
                                            account                     [string]
  --password                                Password of your Kinvey account
                                                                        [string]
  --2fa, --2Fa                              Two-factor authentication token
                                                                        [string]
  --instance-id, --instanceId               Instance ID                 [string]
  --profile                                 Profile to use              [string]
  --output                                  Output format
                                                      [string] [choices: "json"]
  --silent                                  Do not output anything     [boolean]
  --suppress-version-check,                 Do not check for package updates
  --suppressVersionCheck                                               [boolean]
  --verbose                                 Output debug messages      [boolean]
  --no-color, --noColor                     Disable colors             [boolean]
  -h, --help                                Show help                  [boolean]
  --app                                     App ID/name                 [string]
  --org                                     Org ID/name                 [string]
  --indexPage                               Index page                  [string]
  --errorPage                               Error page                  [string]
  --historyApiRouting                       Enable server support for History
                                            API routing
                                                      [boolean] [default: false]

You must be authenticated.

`
