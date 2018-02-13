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

exports['profile delete without a name should fail 1'] = `
kinvey profile delete <name>

Delete profile by name

Positionals:
  name  Profile name                                                  [required]

Options:
  --version                 Show version number                        [boolean]
  --email                   E-mail address of your Kinvey account       [string]
  --password                Password of your Kinvey account             [string]
  --instanceId              Instance ID                                 [string]
  --profile                 Profile to use                              [string]
  --output                  Output format             [string] [choices: "json"]
  --silent                  Do not output anything                     [boolean]
  --suppress-version-check  Do not check for package updates           [boolean]
  --verbose                 Output debug messages                      [boolean]
  --no-color                Disable colors                             [boolean]
  -h, --help                Show help                                  [boolean]

Not enough non-option arguments: got 0, need at least 1

`
