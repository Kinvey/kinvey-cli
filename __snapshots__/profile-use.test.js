exports['profile use with existent name when several should succeed and output default format 1'] = `
[debug] Checking for package updates
[debug] Writing JSON to file globalSetupPath
[debug] Writing contents to file globalSetupPath
Active profile: testProfileUse0

`

exports['profile use with existent name when one should succeed and output JSON 1'] = `
[debug] Checking for package updates
[debug] Writing JSON to file globalSetupPath
[debug] Writing contents to file globalSetupPath
{
  "result": {
    "id": "testProfileUse0"
  }
}

`

exports['profile use with non-existent name when several should return error 1'] = `
[debug] Checking for package updates
ProfileNotFound: Profile not found. Please verify profile name exists.

`

exports['profile use with non-existent name when none should return error 1'] = `
[debug] Checking for package updates
ProfileNotFound: Profile not found. Please verify profile name exists.

`
