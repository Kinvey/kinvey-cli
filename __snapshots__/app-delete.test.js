exports['app delete with profile using existent app id should succeed and output default format 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Request:  GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e 200
[debug] Request:  DELETE http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: DELETE http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e 204
Deleted application: 885f5d307afd4168bebca1a64f815c1e

`

exports['app delete with profile using existent app id should succeed and output JSON 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Request:  GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e 200
[debug] Request:  DELETE http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: DELETE http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e 204
{
  "result": {
    "id": "885f5d307afd4168bebca1a64f815c1e"
  }
}

`

exports['app delete with profile using existent app name should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Request:  GET http://localhost:3234/v2/apps
[debug] Response: GET http://localhost:3234/v2/apps 200
[debug] Request:  DELETE http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: DELETE http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e 204
Deleted application: 885f5d307afd4168bebca1a64f815c1e

`

exports['app delete with profile using non-existent app name should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Request:  GET http://localhost:3234/v2/apps
[debug] Response: GET http://localhost:3234/v2/apps 200
[error] NotFound: Could not find application with identifier 'noSuchName'.

`

exports['app delete with profile using non-existent app id should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Request:  GET http://localhost:3234/v2/apps/f1a003439ed940608a1c82895cc0ef1e
[debug] Response: GET http://localhost:3234/v2/apps/f1a003439ed940608a1c82895cc0ef1e 404
[debug] Request:  GET http://localhost:3234/v2/apps
[debug] Response: GET http://localhost:3234/v2/apps 200
[error] NotFound: Could not find application with identifier 'f1a003439ed940608a1c82895cc0ef1e'.

`

exports['app delete without profile with credentials as options should succeed 1'] = `
[debug] Checking for package updates
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 200
[debug] Request:  GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e 200
[debug] Request:  DELETE http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: DELETE http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e 204
[debug] Request:  DELETE http://localhost:3234/session
[debug] Response: DELETE http://localhost:3234/session 204
[debug] Logged out current user.
Deleted application: 885f5d307afd4168bebca1a64f815c1e

`
