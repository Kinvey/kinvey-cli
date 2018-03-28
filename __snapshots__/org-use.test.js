exports['org use by not specifying a profile when one should use it with existent org id should succeed and output default format 1'] = `
[debug] Checking for package updates
[debug] Using profile 'orgProfile0'
[debug] Using organization: f71b0d5e60684b48b8265e7fa50302b9
[debug] Request:  GET http://localhost:3234/v2/organizations/f71b0d5e60684b48b8265e7fa50302b9
[debug] Response: GET http://localhost:3234/v2/organizations/f71b0d5e60684b48b8265e7fa50302b9 200
[debug] Writing contents to file globalSetupPath
Active organization: f71b0d5e60684b48b8265e7fa50302b9

`

exports['org use by not specifying a profile when one should use it with existent org id should succeed and output JSON 1'] = `
[debug] Checking for package updates
[debug] Using profile 'orgProfile0'
[debug] Using organization: f71b0d5e60684b48b8265e7fa50302b9
[debug] Request:  GET http://localhost:3234/v2/organizations/f71b0d5e60684b48b8265e7fa50302b9
[debug] Response: GET http://localhost:3234/v2/organizations/f71b0d5e60684b48b8265e7fa50302b9 200
[debug] Writing contents to file globalSetupPath
{
  "result": {
    "id": "f71b0d5e60684b48b8265e7fa50302b9"
  }
}

`

exports['org use by not specifying a profile when one should use it with existent org name should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'orgProfile0'
[debug] Using organization: My Team
[debug] Request:  GET http://localhost:3234/v2/organizations
[debug] Response: GET http://localhost:3234/v2/organizations 200
[debug] Writing contents to file globalSetupPath
Active organization: f71b0d5e60684b48b8265e7fa50302b9

`

exports['org use by not specifying a profile when one should use it with non-existent org name should return error 1'] = `
[debug] Checking for package updates
[debug] Using profile 'orgProfile0'
[debug] Using organization: noSuchName
[debug] Request:  GET http://localhost:3234/v2/organizations
[debug] Response: GET http://localhost:3234/v2/organizations 200
[error] NotFound: Could not find organization with identifier 'noSuchName'.

`

exports['org use by specifying a profile should use it and succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToBeUsed'
[debug] Using organization: f71b0d5e60684b48b8265e7fa50302b9
[debug] Request:  GET http://localhost:3234/v2/organizations/f71b0d5e60684b48b8265e7fa50302b9
[debug] Response: GET http://localhost:3234/v2/organizations/f71b0d5e60684b48b8265e7fa50302b9 200
[debug] Writing contents to file globalSetupPath
Active organization: f71b0d5e60684b48b8265e7fa50302b9

`

exports['org use by specifying a profile when active is set and no profile option should use active and succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using organization: f71b0d5e60684b48b8265e7fa50302b9
[debug] Request:  GET http://localhost:3234/v2/organizations/f71b0d5e60684b48b8265e7fa50302b9
[debug] Response: GET http://localhost:3234/v2/organizations/f71b0d5e60684b48b8265e7fa50302b9 200
[debug] Writing contents to file globalSetupPath
Active organization: f71b0d5e60684b48b8265e7fa50302b9

`

exports['org use by specifying a profile when active is set and profile specified should use specified and succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToBeUsed'
[debug] Using organization: f71b0d5e60684b48b8265e7fa50302b9
[debug] Request:  GET http://localhost:3234/v2/organizations/f71b0d5e60684b48b8265e7fa50302b9
[debug] Response: GET http://localhost:3234/v2/organizations/f71b0d5e60684b48b8265e7fa50302b9 200
[debug] Writing contents to file globalSetupPath
Active organization: f71b0d5e60684b48b8265e7fa50302b9

`

exports['org use by specifying a profile when active is set with credentials as options should fail and output default format 1'] = `
[debug] Checking for package updates
[error] ProfileRequired: Profile is required. Please set active profile or use the --profile option.

`
