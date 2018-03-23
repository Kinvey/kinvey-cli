exports['profile delete by existent name when there is only one should succeed 1'] = `
[debug] Checking for package updates
[debug] Request:  DELETE http://localhost:3234/session
[debug] Response: DELETE http://localhost:3234/session 204
[debug] Logged out current user.
[debug] Writing contents to file globalSetupPath
{
  "result": {
    "id": "testProfileDelete"
  }
}

`

exports['profile delete by existent name when it is the active profile should succeed and clear active 1'] = `
[debug] Checking for package updates
[debug] Request:  DELETE http://localhost:3234/session
[debug] Response: DELETE http://localhost:3234/session 204
[debug] Logged out current user.
[debug] Writing contents to file globalSetupPath
Deleted profile: activeAndMustBeDeleted

`

exports['profile delete by existent name when there are several should delete only one 1'] = `
[debug] Checking for package updates
[debug] Request:  DELETE http://localhost:3234/session
[debug] Response: DELETE http://localhost:3234/session 204
[debug] Logged out current user.
[debug] Writing contents to file globalSetupPath
Deleted profile: testProfileDelete

`

exports['profile delete by non-existent name when there is one should not alter it 1'] = `
[debug] Checking for package updates
[error] ProfileNotFound: Profile not found. Please verify profile name exists.

`

exports['profile delete by non-existent name when none should return error 1'] = `
[debug] Checking for package updates
[error] ProfileNotFound: Profile not found. Please verify profile name exists.

`

exports['profile delete without a name when no active should fail 1'] = `
[debug] Checking for package updates
[error] ItemNotSpecified: No profile identifier is specified and active profile is not set.

`

exports['profile delete without a name when active is set should succeed and clear active 1'] = `
[debug] Checking for package updates
[debug] Request:  DELETE http://localhost:3234/session
[debug] Response: DELETE http://localhost:3234/session 204
[debug] Logged out current user.
[debug] Writing contents to file globalSetupPath
Deleted profile: activeAndMustBeDeleted

`
