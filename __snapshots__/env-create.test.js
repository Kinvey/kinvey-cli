exports['appenv create when active app is set with a name should succeed and output default format 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: 885f5d307afd4168bebca1a64f815c1e
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e 200
[debug] Request:  POST http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments
[debug] Response: POST http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments 200
Created environment: kid_Sy4yRNV_M

`

exports['appenv create when active app is set with a name should succeed and output JSON 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: 885f5d307afd4168bebca1a64f815c1e
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e 200
[debug] Request:  POST http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments
[debug] Response: POST http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments 200
{
  "result": {
    "id": "kid_Sy4yRNV_M"
  }
}

`

exports['appenv create when active app is set without a name should fail 1'] = `
kinvey appenv create <name>

Create an environment

Positionals:
  name  Env name                                                      [required]

Options:
  --version                 Show version number                        [boolean]
  --email                   E-mail address of your Kinvey account       [string]
  --password                Password of your Kinvey account             [string]
  --2fa, --2Fa              Two-factor authentication token             [string]
  --instance-id             Instance ID                                 [string]
  --profile                 Profile to use                              [string]
  --output                  Output format             [string] [choices: "json"]
  --silent                  Do not output anything                     [boolean]
  --suppress-version-check  Do not check for package updates           [boolean]
  --verbose                 Output debug messages                      [boolean]
  --no-color                Disable colors                             [boolean]
  -h, --help                Show help                                  [boolean]
  --app                     App ID/name                                 [string]

Not enough non-option arguments: got 0, need at least 1

`

exports['appenv create when active app is set with non-existent app id should take precedence and return error 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: 173783d46f3d4bffb1c581d5b203fc7c
[debug] Request:  GET http://localhost:3234/v3/apps/173783d46f3d4bffb1c581d5b203fc7c
[debug] Response: GET http://localhost:3234/v3/apps/173783d46f3d4bffb1c581d5b203fc7c 404
[debug] Request:  GET http://localhost:3234/v3/apps
[debug] Response: GET http://localhost:3234/v3/apps 200
[error] NotFound: Could not find application with identifier '173783d46f3d4bffb1c581d5b203fc7c'.

`

exports['appenv create when active app is set with non-existent app name should take precedence and return error 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: iJustDoNotExist
[debug] Request:  GET http://localhost:3234/v3/apps
[debug] Response: GET http://localhost:3234/v3/apps 200
[error] NotFound: Could not find application with identifier 'iJustDoNotExist'.

`

exports['appenv create when one-time session with existent app name should succeed 1'] = `
[debug] Checking for package updates
[debug] Logging in user: janeDoe@mail.com
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 200
[debug] Using application: TestApp
[debug] Request:  GET http://localhost:3234/v3/apps
[debug] Response: GET http://localhost:3234/v3/apps 200
[debug] Request:  POST http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments
[debug] Response: POST http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments 200
[debug] Request:  DELETE http://localhost:3234/session
[debug] Response: DELETE http://localhost:3234/session 204
[debug] Logged out current user.
Created environment: kid_Sy4yRNV_M

`

exports['appenv create when one-time session without app identifier should fail 1'] = `
[debug] Checking for package updates
kinvey appenv create <name>

Create an environment

Positionals:
  name  Env name                                                      [required]

Options:
  --version                 Show version number                        [boolean]
  --email                   E-mail address of your Kinvey account       [string]
  --password                Password of your Kinvey account             [string]
  --2fa, --2Fa              Two-factor authentication token             [string]
  --instance-id             Instance ID                                 [string]
  --profile                 Profile to use                              [string]
  --output                  Output format             [string] [choices: "json"]
  --silent                  Do not output anything                     [boolean]
  --suppress-version-check  Do not check for package updates           [boolean]
  --verbose                 Output debug messages                      [boolean]
  --no-color                Disable colors                             [boolean]
  -h, --help                Show help                                  [boolean]
  --app                     App ID/name                                 [string]

Application is required. Please set active app or use the --app option.

`
