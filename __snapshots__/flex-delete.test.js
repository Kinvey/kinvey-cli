exports['flex delete when active profile is set and project config is set without explicit profile and serviceId should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Request:  GET http://localhost:3234/v4/services/12378kdl2
[debug] Response: GET http://localhost:3234/v4/services/12378kdl2 200
[debug] Request:  DELETE http://localhost:3234/v4/services/12378kdl2
[debug] Response: DELETE http://localhost:3234/v4/services/12378kdl2 204
[debug] Writing contents to file projectSetupPath
[debug] Deleted service from project settings.
Deleted service: 12378kdl2

`

exports['flex delete when active profile is set and project config is set with explicit profile and without serviceId should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'nonActiveProfile'
[debug] Request:  GET http://localhost:3234/v4/services/12378kdl2
[debug] Response: GET http://localhost:3234/v4/services/12378kdl2 200
[debug] Request:  DELETE http://localhost:3234/v4/services/12378kdl2
[debug] Response: DELETE http://localhost:3234/v4/services/12378kdl2 204
[debug] Writing contents to file projectSetupPath
[debug] Deleted service from project settings.
{
  "result": {
    "id": "12378kdl2"
  }
}

`

exports['flex delete when active profile is set and project config is set without explicit profile and with non-existent serviceId should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Request:  GET http://localhost:3234/v4/services/124
[debug] Response: GET http://localhost:3234/v4/services/124 200
[error] NotFound: Could not find internal flex service with identifier '124'.

`

exports['flex delete when active profile is set and project config is set when one-time session and existent serviceId should succeed 1'] = `
[debug] Checking for package updates
[debug] Logging in user: janeDoe@mail.com
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 200
[debug] Request:  GET http://localhost:3234/v4/services/12378kdl2
[debug] Response: GET http://localhost:3234/v4/services/12378kdl2 200
[debug] Request:  DELETE http://localhost:3234/v4/services/12378kdl2
[debug] Response: DELETE http://localhost:3234/v4/services/12378kdl2 204
[debug] Request:  DELETE http://localhost:3234/session
[debug] Response: DELETE http://localhost:3234/session 204
[debug] Logged out current user.
Deleted service: 12378kdl2

`

exports['flex delete when profiles nor project config are set when one-time session and existent serviceId should succeed 1'] = `
[debug] Checking for package updates
[debug] Logging in user: janeDoe@mail.com
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 200
[debug] Request:  GET http://localhost:3234/v4/services/12378kdl2
[debug] Response: GET http://localhost:3234/v4/services/12378kdl2 200
[debug] Request:  DELETE http://localhost:3234/v4/services/12378kdl2
[debug] Response: DELETE http://localhost:3234/v4/services/12378kdl2 204
[debug] Request:  DELETE http://localhost:3234/session
[debug] Response: DELETE http://localhost:3234/session 204
[debug] Logged out current user.
Deleted service: 12378kdl2

`
