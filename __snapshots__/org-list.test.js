exports['org list by not specifying a profile when one should use it when there are orgs should succeed and output default 1'] = `
[debug] Checking for package updates
[debug] Using profile 'orgProfile0'
[debug] Request:  GET http://localhost:3234/v2/organizations
[debug] Response: GET http://localhost:3234/v2/organizations 200
Count: 2

id                                name   
--------------------------------  -------
f71b0d5e60684b48b8265e7fa50302b9  My Team
123                               TestOrg



`

exports['org list by not specifying a profile when one should use it when there are orgs should succeed and output JSON 1'] = `
[debug] Checking for package updates
[debug] Using profile 'orgProfile0'
[debug] Request:  GET http://localhost:3234/v2/organizations
[debug] Response: GET http://localhost:3234/v2/organizations 200
{
  "result": [
    {
      "name": "My Team",
      "creator": "39229488331a4af9046486a9bbfa5e8e",
      "creationTime": "2017-06-21T19:49:15.784Z",
      "restrictions": {
        "defaultPlanLevel": "enterprise"
      },
      "security": {
        "requireApprovals": true,
        "requireEmailVerification": false,
        "requireTwoFactorAuth": false
      },
      "id": "f71b0d5e60684b48b8265e7fa50302b9"
    },
    {
      "name": "TestOrg",
      "creator": "39229488331a4af9046486a9bbfa5e8e",
      "creationTime": "2016-11-01T05:47:56.247Z",
      "restrictions": {
        "defaultPlanLevel": "development"
      },
      "security": {
        "requireApprovals": false,
        "requireEmailVerification": false,
        "requireTwoFactorAuth": false
      },
      "id": "123"
    }
  ]
}

`

exports['org list by not specifying a profile when one should use it when no orgs should succeed and output default 1'] = `
[debug] Checking for package updates
[debug] Using profile 'orgProfile0'
[debug] Request:  GET http://localhost:3234/v2/organizations
[debug] Response: GET http://localhost:3234/v2/organizations 200
Count: 0






`

exports['org list by not specifying a profile when one should use it when no orgs should succeed and output JSON 1'] = `
[debug] Checking for package updates
[debug] Using profile 'orgProfile0'
[debug] Request:  GET http://localhost:3234/v2/organizations
[debug] Response: GET http://localhost:3234/v2/organizations 200
{
  "result": []
}

`

exports['org list by specifying a profile should use it and output default 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToBeUsed'
[debug] Request:  GET http://localhost:3234/v2/organizations
[debug] Response: GET http://localhost:3234/v2/organizations 200
Count: 2

id                                name   
--------------------------------  -------
f71b0d5e60684b48b8265e7fa50302b9  My Team
123                               TestOrg



`

exports['org list by specifying a profile when active is set and no profile option should use active and succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Request:  GET http://localhost:3234/v2/organizations
[debug] Response: GET http://localhost:3234/v2/organizations 200
Count: 2

id                                name   
--------------------------------  -------
f71b0d5e60684b48b8265e7fa50302b9  My Team
123                               TestOrg



`

exports['org list by specifying a profile when active is set and profile specified should use specified and succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToBeUsed'
[debug] Request:  GET http://localhost:3234/v2/organizations
[debug] Response: GET http://localhost:3234/v2/organizations 200
Count: 2

id                                name   
--------------------------------  -------
f71b0d5e60684b48b8265e7fa50302b9  My Team
123                               TestOrg



`

exports['org list by specifying credentials as options when valid should succeed 1'] = `
[debug] Checking for package updates
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 200
[debug] Request:  GET http://localhost:3234/v2/organizations
[debug] Response: GET http://localhost:3234/v2/organizations 200
[debug] Request:  DELETE http://localhost:3234/session
[debug] Response: DELETE http://localhost:3234/session 204
[debug] Logged out current user.
Count: 2

id                                name   
--------------------------------  -------
f71b0d5e60684b48b8265e7fa50302b9  My Team
123                               TestOrg



`
