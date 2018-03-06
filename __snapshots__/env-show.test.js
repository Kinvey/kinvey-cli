exports['env show without profile with credentials as options, existent app and env should succeed 1'] = `
[debug] Checking for package updates
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 200
[debug] Request:  GET http://localhost:3234/v2/apps
[debug] Response: GET http://localhost:3234/v2/apps 200
[debug] Request:  GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e/environments
[debug] Response: GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e/environments 200
[debug] Request:  DELETE http://localhost:3234/session
[debug] Response: DELETE http://localhost:3234/session 204
[debug] Logged out current user.
key        value                           
---------  --------------------------------
id         kid_Sy4yRNV_M                   
name       Development                     
appSecret  f006f2fda0fd4fc7b154e12a15ae81fe


`

exports['env show with profile when active app is set active env is set without env arg should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Request:  GET http://localhost:3234/v2/environments/kid_Sy4yRNV_M
[debug] Response: GET http://localhost:3234/v2/environments/kid_Sy4yRNV_M 200
key        value                           
---------  --------------------------------
id         kid_Sy4yRNV_M                   
name       Development                     
appSecret  f006f2fda0fd4fc7b154e12a15ae81fe


`

exports['env show with profile when active app is set active env is set with non-existent env id should take precedence and fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Request:  GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e 200
[debug] Request:  GET http://localhost:3234/v2/environments/kid_JjJJjg2cN
[debug] Response: GET http://localhost:3234/v2/environments/kid_JjJJjg2cN 404
[debug] Request:  GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e/environments
[debug] Response: GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e/environments 200
[error] NotFound: Could not find environment with identifier 'kid_JjJJjg2cN'.

`

exports['env show with profile when active app is set active env is not set using existent env id should succeed and output default format 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Request:  GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e 200
[debug] Request:  GET http://localhost:3234/v2/environments/kid_Sy4yRNV_M
[debug] Response: GET http://localhost:3234/v2/environments/kid_Sy4yRNV_M 200
key        value                           
---------  --------------------------------
id         kid_Sy4yRNV_M                   
name       Development                     
appSecret  f006f2fda0fd4fc7b154e12a15ae81fe


`

exports['env show with profile when active app is set active env is not set using existent env id should succeed and output JSON 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Request:  GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e 200
[debug] Request:  GET http://localhost:3234/v2/environments/kid_Sy4yRNV_M
[debug] Response: GET http://localhost:3234/v2/environments/kid_Sy4yRNV_M 200
{
  "result": {
    "id": "kid_Sy4yRNV_M",
    "app": "885f5d307afd4168bebca1a64f815c1e",
    "name": "Development",
    "appSecret": "f006f2fda0fd4fc7b154e12a15ae81fe",
    "masterSecret": "f09347efa9394ffdb4b0e8a39bc518f8",
    "apiVersion": 3,
    "numberOfCollaborators": 0,
    "numberOfAdmins": 1
  }
}

`

exports['env show with profile when active app is set active env is not set using existent env name should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Request:  GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e 200
[debug] Request:  GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e/environments
[debug] Response: GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e/environments 200
key        value                           
---------  --------------------------------
id         kid_Sy4yRNV_M                   
name       Development                     
appSecret  f006f2fda0fd4fc7b154e12a15ae81fe


`

exports['env show with profile when active app is set active env is not set using existent env name and non-existent app name should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Request:  GET http://localhost:3234/v2/apps
[debug] Response: GET http://localhost:3234/v2/apps 200
[error] NotFound: Entity not found.

`

exports['env show with profile when active app is set active env is not set using non-existent env name should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Request:  GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e 200
[debug] Request:  GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e/environments
[debug] Response: GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e/environments 200
[error] NotFound: Could not find environment with identifier 'noSuchName'.

`

exports['env show with profile when active app is set active env is not set using non-existent env id should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Request:  GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e 200
[debug] Request:  GET http://localhost:3234/v2/environments/kid_JjJJjg2cN
[debug] Response: GET http://localhost:3234/v2/environments/kid_JjJJjg2cN 404
[debug] Request:  GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e/environments
[debug] Response: GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e/environments 200
[error] NotFound: Could not find environment with identifier 'kid_JjJJjg2cN'.

`

exports['env show with profile when active app is not set using existent env name and existent app name should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Request:  GET http://localhost:3234/v2/apps
[debug] Response: GET http://localhost:3234/v2/apps 200
[debug] Request:  GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e/environments
[debug] Response: GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e/environments 200
key        value                           
---------  --------------------------------
id         kid_Sy4yRNV_M                   
name       Development                     
appSecret  f006f2fda0fd4fc7b154e12a15ae81fe


`

exports['env show with profile when active app is not set using existent env name and existent app id should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Request:  GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e 200
[debug] Request:  GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e/environments
[debug] Response: GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e/environments 200
key        value                           
---------  --------------------------------
id         kid_Sy4yRNV_M                   
name       Development                     
appSecret  f006f2fda0fd4fc7b154e12a15ae81fe


`

exports['env show with profile when active app is not set using existent env id and no app should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
kinvey env show [env]

Show detailed info for a specified environment or for the active one

Positionals:
  env  Env ID/name                                                      [string]

Options:
  --version                 Show version number                        [boolean]
  --email                   E-mail address of your Kinvey account       [string]
  --password                Password of your Kinvey account             [string]
  --instanceId              Instance ID                                 [string]
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

exports['env show with profile when active app is not set without env and without app should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
kinvey env show [env]

Show detailed info for a specified environment or for the active one

Positionals:
  env  Env ID/name                                                      [string]

Options:
  --version                 Show version number                        [boolean]
  --email                   E-mail address of your Kinvey account       [string]
  --password                Password of your Kinvey account             [string]
  --instanceId              Instance ID                                 [string]
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
