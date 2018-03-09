exports['app show when no active app with existent app id as option should output default format 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: 885f5d307afd4168bebca1a64f815c1e
[debug] Request:  GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e 200
key             value                           
--------------  --------------------------------
id              885f5d307afd4168bebca1a64f815c1e
name            TestApp                         
organizationId  Not set                         
environments    1                               
plan            development                     


`

exports['app show when no active app with existent app id as option should output JSON 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: 885f5d307afd4168bebca1a64f815c1e
[debug] Request:  GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e 200
{
  "result": {
    "name": "TestApp",
    "platform": null,
    "icon": null,
    "url": null,
    "owner": "ccdd0cc6310c44f48fff0a7138488df5",
    "schemaVersion": 2,
    "environments": [
      {
        "id": "kid_Sy4yRNV_M",
        "app": "885f5d307afd4168bebca1a64f815c1e",
        "name": "Development",
        "appSecret": "f006f2fda0fd4fc7b154e12a15ae81fe",
        "masterSecret": "f09347efa9394ffdb4b0e8a39bc518f8",
        "apiVersion": 3,
        "numberOfCollaborators": 0,
        "numberOfAdmins": 1
      }
    ],
    "id": "885f5d307afd4168bebca1a64f815c1e",
    "paymentMethod": null,
    "plan": {
      "level": "development",
      "bl": {
        "external": true,
        "scripts": true,
        "timeout": 2000
      },
      "datalinks": false,
      "authlinks": false,
      "collaborators": 0,
      "environments": 1,
      "scheduledCode": true,
      "support": {
        "debug": false,
        "email": false,
        "phone": false
      },
      "backup": false,
      "push": 5000000,
      "email": 5000000
    }
  }
}

`

exports['app show when no active app without id should return error 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[error] ItemNotSpecified: No application identifier is specified and/or active application is not set.

`

exports['app show when active app without id should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: 885f5d307afd4168bebca1a64f815c1e
[debug] Request:  GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e 200
key             value                           
--------------  --------------------------------
id              885f5d307afd4168bebca1a64f815c1e
name            TestApp                         
organizationId  Not set                         
environments    1                               
plan            development                     


`

exports['app show when active app with non-existent app name should disregard active and return error 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: noSuchName
[debug] Request:  GET http://localhost:3234/v2/apps
[debug] Response: GET http://localhost:3234/v2/apps 200
[error] NotFound: Could not find application with identifier 'noSuchName'.

`

exports['app show when active app with credentials as options and existent name should succeed 1'] = `
[debug] Checking for package updates
[debug] Logging in user: janeyDoe@mail.com
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 200
[debug] Using application: TestApp
[debug] Request:  GET http://localhost:3234/v2/apps
[debug] Response: GET http://localhost:3234/v2/apps 200
[debug] Request:  DELETE http://localhost:3234/session
[debug] Response: DELETE http://localhost:3234/session 204
[debug] Logged out current user.
key             value                           
--------------  --------------------------------
id              885f5d307afd4168bebca1a64f815c1e
name            TestApp                         
organizationId  Not set                         
environments    1                               
plan            development                     


`
