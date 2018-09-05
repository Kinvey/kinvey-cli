exports['appenv delete without profile with credentials as options, existent app and env should succeed 1'] = `
[debug] Checking for package updates
[debug] Logging in user: janeDoe@mail.com
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 200
[debug] Using application: TestApp
[debug] Request:  GET http://localhost:3234/v3/apps
[debug] Response: GET http://localhost:3234/v3/apps 200
[debug] Using environment: Development
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments 200
[debug] Request:  DELETE http://localhost:3234/v3/environments/kid_Sy4yRNV_M
[debug] Response: DELETE http://localhost:3234/v3/environments/kid_Sy4yRNV_M 204
[debug] Request:  DELETE http://localhost:3234/session
[debug] Response: DELETE http://localhost:3234/session 204
[debug] Logged out current user.
Deleted environment: kid_Sy4yRNV_M

`

exports['appenv delete with profile when active app is set active env is set without env arg should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using environment: kid_Sy4yRNV_M
[debug] Request:  GET http://localhost:3234/v3/environments/kid_Sy4yRNV_M
[debug] Response: GET http://localhost:3234/v3/environments/kid_Sy4yRNV_M 200
[debug] Request:  DELETE http://localhost:3234/v3/environments/kid_Sy4yRNV_M
[debug] Response: DELETE http://localhost:3234/v3/environments/kid_Sy4yRNV_M 204
[debug] Writing contents to file globalSetupPath
[debug] Removed active env: kid_Sy4yRNV_M.
Deleted environment: kid_Sy4yRNV_M

`

exports['appenv delete with profile when active app is set active env is set with non-existent env id should take precedence and fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: 885f5d307afd4168bebca1a64f815c1e
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e 200
[debug] Using environment: kid_JjJJjg2cN
[debug] Request:  GET http://localhost:3234/v3/environments/kid_JjJJjg2cN
[debug] Response: GET http://localhost:3234/v3/environments/kid_JjJJjg2cN 404
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments 200
[error] NotFound: Could not find environment with identifier 'kid_JjJJjg2cN'.

`

exports['appenv delete with profile when active app is set active env is not set using existent env id should succeed and output default format 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: 885f5d307afd4168bebca1a64f815c1e
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e 200
[debug] Using environment: kid_Sy4yRNV_M
[debug] Request:  GET http://localhost:3234/v3/environments/kid_Sy4yRNV_M
[debug] Response: GET http://localhost:3234/v3/environments/kid_Sy4yRNV_M 200
[debug] Request:  DELETE http://localhost:3234/v3/environments/kid_Sy4yRNV_M
[debug] Response: DELETE http://localhost:3234/v3/environments/kid_Sy4yRNV_M 204
Deleted environment: kid_Sy4yRNV_M

`

exports['appenv delete with profile when active app is set active env is not set using existent env id should succeed and output JSON 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: 885f5d307afd4168bebca1a64f815c1e
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e 200
[debug] Using environment: kid_Sy4yRNV_M
[debug] Request:  GET http://localhost:3234/v3/environments/kid_Sy4yRNV_M
[debug] Response: GET http://localhost:3234/v3/environments/kid_Sy4yRNV_M 200
[debug] Request:  DELETE http://localhost:3234/v3/environments/kid_Sy4yRNV_M
[debug] Response: DELETE http://localhost:3234/v3/environments/kid_Sy4yRNV_M 204
{
  "result": {
    "id": "kid_Sy4yRNV_M"
  }
}

`

exports['appenv delete with profile when active app is set active env is not set using existent env name should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: 885f5d307afd4168bebca1a64f815c1e
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e 200
[debug] Using environment: Development
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments 200
[debug] Request:  DELETE http://localhost:3234/v3/environments/kid_Sy4yRNV_M
[debug] Response: DELETE http://localhost:3234/v3/environments/kid_Sy4yRNV_M 204
Deleted environment: kid_Sy4yRNV_M

`

exports['appenv delete with profile when active app is set active env is not set using existent env name and non-existent app name should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: noSuchApp
[debug] Request:  GET http://localhost:3234/v3/apps
[debug] Response: GET http://localhost:3234/v3/apps 200
[error] NotFound: Could not find application with identifier 'noSuchApp'.

`

exports['appenv delete with profile when active app is set active env is not set using non-existent env name should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: 885f5d307afd4168bebca1a64f815c1e
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e 200
[debug] Using environment: noSuchName
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments 200
[error] NotFound: Could not find environment with identifier 'noSuchName'.

`

exports['appenv delete with profile when active app is set active env is not set using non-existent env id should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: 885f5d307afd4168bebca1a64f815c1e
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e 200
[debug] Using environment: kid_JjJJjg2cN
[debug] Request:  GET http://localhost:3234/v3/environments/kid_JjJJjg2cN
[debug] Response: GET http://localhost:3234/v3/environments/kid_JjJJjg2cN 404
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments 200
[error] NotFound: Could not find environment with identifier 'kid_JjJJjg2cN'.

`

exports['appenv delete with profile when active app is not set using existent env name and existent app name should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: TestApp
[debug] Request:  GET http://localhost:3234/v3/apps
[debug] Response: GET http://localhost:3234/v3/apps 200
[debug] Using environment: Development
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments 200
[debug] Request:  DELETE http://localhost:3234/v3/environments/kid_Sy4yRNV_M
[debug] Response: DELETE http://localhost:3234/v3/environments/kid_Sy4yRNV_M 204
Deleted environment: kid_Sy4yRNV_M

`

exports['appenv delete with profile when active app is not set using existent env name and existent app id should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: 885f5d307afd4168bebca1a64f815c1e
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e 200
[debug] Using environment: Development
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments 200
[debug] Request:  DELETE http://localhost:3234/v3/environments/kid_Sy4yRNV_M
[debug] Response: DELETE http://localhost:3234/v3/environments/kid_Sy4yRNV_M 204
Deleted environment: kid_Sy4yRNV_M

`

exports['appenv delete with profile when active app is not set using existent env id and no app should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
kinvey appenv delete [env]

Delete a specified environment or the active one

Positionals:
  env  Env ID/name                                                      [string]

Options:
  --version                 Show version number                        [boolean]
  --email                   E-mail address of your Kinvey account       [string]
  --password                Password of your Kinvey account             [string]
  --2fa, --2Fa              Two-factor authentication token             [string]
  --instanceId              Instance ID                                 [string]
  --profile                 Profile to use                              [string]
  --output                  Output format             [string] [choices: "json"]
  --silent                  Do not output anything                     [boolean]
  --suppress-version-check  Do not check for package updates           [boolean]
  --verbose                 Output debug messages                      [boolean]
  --no-color                Disable colors                             [boolean]
  -h, --help                Show help                                  [boolean]
  --app                     App ID/name                                 [string]
  --no-prompt               Do not prompt             [boolean] [default: false]

Application is required. Please set active app or use the --app option.

`

exports['appenv delete with profile when active app is not set without env and without app should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
kinvey appenv delete [env]

Delete a specified environment or the active one

Positionals:
  env  Env ID/name                                                      [string]

Options:
  --version                 Show version number                        [boolean]
  --email                   E-mail address of your Kinvey account       [string]
  --password                Password of your Kinvey account             [string]
  --2fa, --2Fa              Two-factor authentication token             [string]
  --instanceId              Instance ID                                 [string]
  --profile                 Profile to use                              [string]
  --output                  Output format             [string] [choices: "json"]
  --silent                  Do not output anything                     [boolean]
  --suppress-version-check  Do not check for package updates           [boolean]
  --verbose                 Output debug messages                      [boolean]
  --no-color                Disable colors                             [boolean]
  -h, --help                Show help                                  [boolean]
  --app                     App ID/name                                 [string]
  --no-prompt               Do not prompt             [boolean] [default: false]

Application is required. Please set active app or use the --app option.

`
