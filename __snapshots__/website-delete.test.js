exports['website delete using active profile with existent site ID should output default format 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Request:  GET http://localhost:3234/v4/sites/b85fe52ca1434d148b5c5f8199fceb9e
[debug] Response: GET http://localhost:3234/v4/sites/b85fe52ca1434d148b5c5f8199fceb9e 200
[debug] Request:  DELETE http://localhost:3234/v4/sites/b85fe52ca1434d148b5c5f8199fceb9e
[debug] Response: DELETE http://localhost:3234/v4/sites/b85fe52ca1434d148b5c5f8199fceb9e 204
Deleted website: b85fe52ca1434d148b5c5f8199fceb9e

`

exports['website delete using active profile with existent site name should output JSON 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Request:  GET http://localhost:3234/v4/sites
[debug] Response: GET http://localhost:3234/v4/sites 200
[debug] Request:  DELETE http://localhost:3234/v4/sites/b85fe52ca1434d148b5c5f8199fceb9e
[debug] Response: DELETE http://localhost:3234/v4/sites/b85fe52ca1434d148b5c5f8199fceb9e 204
{
  "result": {
    "id": "b85fe52ca1434d148b5c5f8199fceb9e"
  }
}

`

exports['website delete using active profile with existent site name should output default format 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Request:  GET http://localhost:3234/v4/sites
[debug] Response: GET http://localhost:3234/v4/sites 200
[debug] Request:  DELETE http://localhost:3234/v4/sites/b85fe52ca1434d148b5c5f8199fceb9e
[debug] Response: DELETE http://localhost:3234/v4/sites/b85fe52ca1434d148b5c5f8199fceb9e 204
Deleted website: b85fe52ca1434d148b5c5f8199fceb9e

`

exports['website delete using active profile with non-existent site ID when no sites at all should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Request:  GET http://localhost:3234/v4/sites/bbbfe52ca1434d148b5c5f8199999999
[debug] Response: GET http://localhost:3234/v4/sites/bbbfe52ca1434d148b5c5f8199999999 404
[debug] Request:  GET http://localhost:3234/v4/sites
[debug] Response: GET http://localhost:3234/v4/sites 200
[error] NotFound: Could not find website with identifier 'bbbfe52ca1434d148b5c5f8199999999'.

`

exports['website delete using active profile with non-existent site name should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Request:  GET http://localhost:3234/v4/sites
[debug] Response: GET http://localhost:3234/v4/sites 200
[error] NotFound: Could not find website with identifier 'no such name'.

`

exports['website delete using active profile without site identifier should fail 1'] = `
kinvey website delete

Delete the specified website

Options:
  --version                                 Show version number        [boolean]
  --email                                   E-mail address of your Kinvey
                                            account                     [string]
  --password                                Password of your Kinvey account
                                                                        [string]
  --2fa, --2Fa                              Two-factor authentication token
                                                                        [string]
  --instance-id, --instanceId               Instance ID                 [string]
  --profile                                 Profile to use              [string]
  --output                                  Output format
                                                      [string] [choices: "json"]
  --silent                                  Do not output anything     [boolean]
  --suppress-version-check,                 Do not check for package updates
  --suppressVersionCheck                                               [boolean]
  --verbose                                 Output debug messages      [boolean]
  --no-color, --noColor                     Disable colors             [boolean]
  -h, --help                                Show help                  [boolean]
  --website                                 Website ID/name  [string] [required]
  --no-prompt, --noPrompt                   Do not prompt
                                                      [boolean] [default: false]

Missing required argument: website

`

exports['website delete using one-time session with existent site name should output default format 1'] = `
[debug] Checking for package updates
[debug] Logging in user: janeyDoe@mail.com
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 200
[debug] Request:  GET http://localhost:3234/v4/sites
[debug] Response: GET http://localhost:3234/v4/sites 200
[debug] Request:  DELETE http://localhost:3234/v4/sites/b85fe52ca1434d148b5c5f8199fceb9e
[debug] Response: DELETE http://localhost:3234/v4/sites/b85fe52ca1434d148b5c5f8199fceb9e 204
[debug] Request:  DELETE http://localhost:3234/session
[debug] Response: DELETE http://localhost:3234/session 204
[debug] Logged out current user.
Deleted website: b85fe52ca1434d148b5c5f8199fceb9e

`

exports['website delete without auth should fail 1'] = `
[debug] Checking for package updates
kinvey website delete

Delete the specified website

Options:
  --version                                 Show version number        [boolean]
  --email                                   E-mail address of your Kinvey
                                            account                     [string]
  --password                                Password of your Kinvey account
                                                                        [string]
  --2fa, --2Fa                              Two-factor authentication token
                                                                        [string]
  --instance-id, --instanceId               Instance ID                 [string]
  --profile                                 Profile to use              [string]
  --output                                  Output format
                                                      [string] [choices: "json"]
  --silent                                  Do not output anything     [boolean]
  --suppress-version-check,                 Do not check for package updates
  --suppressVersionCheck                                               [boolean]
  --verbose                                 Output debug messages      [boolean]
  --no-color, --noColor                     Disable colors             [boolean]
  -h, --help                                Show help                  [boolean]
  --website                                 Website ID/name  [string] [required]
  --no-prompt, --noPrompt                   Do not prompt
                                                      [boolean] [default: false]

You must be authenticated.

`
