exports['app list when there are apps should output default format 1'] = `
[debug] Checking for package updates
[debug] Logging in user: janeDoe@mail.com
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 200
[debug] Request:  GET http://localhost:3234/v2/apps
[debug] Response: GET http://localhost:3234/v2/apps 200
[debug] Request:  DELETE http://localhost:3234/session
[debug] Response: DELETE http://localhost:3234/session 204
[debug] Logged out current user.
Count: 2

id                                name     organizationId  environments
--------------------------------  -------  --------------  ------------
123                               MyApp    Not set         1           
885f5d307afd4168bebca1a64f815c1e  TestApp  Not set         1           



`

exports['app list when there are apps should output JSON 1'] = `
[debug] Checking for package updates
[debug] Logging in user: janeDoe@mail.com
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 200
[debug] Request:  GET http://localhost:3234/v2/apps
[debug] Response: GET http://localhost:3234/v2/apps 200
[debug] Request:  DELETE http://localhost:3234/session
[debug] Response: DELETE http://localhost:3234/session 204
[debug] Logged out current user.
{
  "result": [
    {
      "id": "123",
      "name": "MyApp",
      "environments": [
        {
          "id": "kid123",
          "name": "TestEnvironment"
        }
      ]
    },
    {
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
  ]
}

`

exports['app list when no apps should succeed 1'] = `
[debug] Checking for package updates
[debug] Logging in user: janeDoe@mail.com
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 200
[debug] Request:  GET http://localhost:3234/v2/apps
[debug] Response: GET http://localhost:3234/v2/apps 200
[debug] Request:  DELETE http://localhost:3234/session
[debug] Response: DELETE http://localhost:3234/session 204
[debug] Logged out current user.
Count: 0






`
