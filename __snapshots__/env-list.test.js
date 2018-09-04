exports['appenv list when active app is set should output default format 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: 885f5d307afd4168bebca1a64f815c1e
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e 200
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments 200
Count: 2

id             name       
-------------  -----------
kid_Sy4yRNV_M  Development
kid_Ty4yRNV_O  Staging    



`

exports['appenv list when active app is set should output JSON 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: 885f5d307afd4168bebca1a64f815c1e
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e 200
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments 200
{
  "result": [
    {
      "id": "kid_Sy4yRNV_M",
      "app": "885f5d307afd4168bebca1a64f815c1e",
      "name": "Development",
      "appSecret": "f006f2fda0fd4fc7b154e12a15ae81fe",
      "masterSecret": "f09347efa9394ffdb4b0e8a39bc518f8",
      "apiVersion": 3,
      "numberOfCollaborators": 0,
      "numberOfAdmins": 1
    },
    {
      "id": "kid_Ty4yRNV_O",
      "app": "885f5d307afd4168bebca1a64f815c1e",
      "name": "Staging",
      "appSecret": "f006f2fda0fd4fc7b154e12a15ae81fe",
      "masterSecret": "f09347efa9394ffdb4b0e8a39bc518f8",
      "apiVersion": 3,
      "numberOfCollaborators": 0,
      "numberOfAdmins": 1
    }
  ]
}

`

exports['appenv list when active app is set with non-existent app id should take precedence and return error 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: 173783d46f3d4bffb1c581d5b203fc7c
[debug] Request:  GET http://localhost:3234/v3/apps/173783d46f3d4bffb1c581d5b203fc7c
[debug] Response: GET http://localhost:3234/v3/apps/173783d46f3d4bffb1c581d5b203fc7c 404
[debug] Request:  GET http://localhost:3234/v3/apps
[debug] Response: GET http://localhost:3234/v3/apps 200
[error] NotFound: Could not find application with identifier '173783d46f3d4bffb1c581d5b203fc7c'.

`

exports['appenv list when active app is set with non-existent app name should take precedence and return error 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: iJustDoNotExist
[debug] Request:  GET http://localhost:3234/v3/apps
[debug] Response: GET http://localhost:3234/v3/apps 200
[error] NotFound: Could not find application with identifier 'iJustDoNotExist'.

`

exports['appenv list when one-time session with existent app name should succeed 1'] = `
[debug] Checking for package updates
[debug] Logging in user: janeDoe@mail.com
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 200
[debug] Using application: TestApp
[debug] Request:  GET http://localhost:3234/v3/apps
[debug] Response: GET http://localhost:3234/v3/apps 200
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments 200
[debug] Request:  DELETE http://localhost:3234/session
[debug] Response: DELETE http://localhost:3234/session 204
[debug] Logged out current user.
Count: 2

id             name       
-------------  -----------
kid_Sy4yRNV_M  Development
kid_Ty4yRNV_O  Staging    



`

exports['appenv list when one-time session without app identifier should fail 1'] = `
[debug] Checking for package updates
kinvey appenv list

List environments per app

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

Application is required. Please set active app or use the --app option.

`
