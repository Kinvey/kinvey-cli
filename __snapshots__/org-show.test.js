exports['org show when active org with credentials as options and existent name should succeed 1'] = `
[debug] Checking for package updates
[debug] Logging in user: janeyDoe@mail.com
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 200
[debug] Using organization: My Team
[debug] Request:  GET http://localhost:3234/v3/organizations
[debug] Response: GET http://localhost:3234/v3/organizations 200
[debug] Request:  DELETE http://localhost:3234/session
[debug] Response: DELETE http://localhost:3234/session 204
[debug] Logged out current user.
key                       value                           
------------------------  --------------------------------
id                        f71b0d5e60684b48b8265e7fa50302b9
name                      My Team                         
plan                      enterprise                      
requireApprovals          true                            
requireEmailVerification  false                           
requireTwoFactorAuth      false                           


`

exports['org show when active org with non-existent org name should disregard active and return error 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using organization: noSuchName
[debug] Request:  GET http://localhost:3234/v3/organizations
[debug] Response: GET http://localhost:3234/v3/organizations 200
[error] NotFound: Could not find organization with identifier 'noSuchName'.

`

exports['org show when active org without id should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using organization: f71b0d5e60684b48b8265e7fa50302b9
[debug] Request:  GET http://localhost:3234/v3/organizations
[debug] Response: GET http://localhost:3234/v3/organizations 200
key                       value                           
------------------------  --------------------------------
id                        f71b0d5e60684b48b8265e7fa50302b9
name                      My Team                         
plan                      enterprise                      
requireApprovals          true                            
requireEmailVerification  false                           
requireTwoFactorAuth      false                           


`

exports['org show when no active org with existent org id as option should output JSON 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using organization: f71b0d5e60684b48b8265e7fa50302b9
[debug] Request:  GET http://localhost:3234/v3/organizations
[debug] Response: GET http://localhost:3234/v3/organizations 200
{
  "result": {
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
  }
}

`

exports['org show when no active org with existent org id as option should output default format 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using organization: f71b0d5e60684b48b8265e7fa50302b9
[debug] Request:  GET http://localhost:3234/v3/organizations
[debug] Response: GET http://localhost:3234/v3/organizations 200
key                       value                           
------------------------  --------------------------------
id                        f71b0d5e60684b48b8265e7fa50302b9
name                      My Team                         
plan                      enterprise                      
requireApprovals          true                            
requireEmailVerification  false                           
requireTwoFactorAuth      false                           


`

exports['org show when no active org without id should return error 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[error] ItemNotSpecified: No organization identifier is specified and active organization is not set.

`
