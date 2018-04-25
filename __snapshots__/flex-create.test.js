exports['flex create with active profile with a name, secret and app should succeed and output default format 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: 885f5d307afd4168bebca1a64f815c1e
[debug] Request:  GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e 200
[debug] Request:  POST http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e/data-links
[debug] Response: POST http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e/data-links 201
Created service: 12378kdl2

`

exports['flex create with active profile with a name, secret and app should succeed and output JSON 1'] = `
{
  "result": {
    "id": "12378kdl2"
  }
}

`

exports['flex create with active profile without a name should fail 1'] = `
kinvey flex create <name>

Create a Flex service

Positionals:
  name  Flex service name                                             [required]

Options:
  --version                 Show version number                        [boolean]
  --email                   E-mail address of your Kinvey account       [string]
  --password                Password of your Kinvey account             [string]
  --2fa, --2Fa              Two-factor authentication token             [string]
  --instanceId              Instance ID                                 [string]
  --profile                 Profile to use                              [string]
  --output                  Output format             [string] [choices: "json"]
  --silent                  Do not output anything                     [boolean]
  --suppress-version-check  Do not check for package updates           [boolean]
  --verbose                 Output debug messages                      [boolean]
  --no-color                Disable colors                             [boolean]
  -h, --help                Show help                                  [boolean]
  --app                     App ID/name                                 [string]
  --org                     Org ID/name                                 [string]
  --secret                  Shared secret                    [string] [required]

Not enough non-option arguments: got 0, need at least 1

`

exports['flex create with active profile without a secret should fail 1'] = `
kinvey flex create <name>

Create a Flex service

Positionals:
  name  Flex service name                                             [required]

Options:
  --version                 Show version number                        [boolean]
  --email                   E-mail address of your Kinvey account       [string]
  --password                Password of your Kinvey account             [string]
  --2fa, --2Fa              Two-factor authentication token             [string]
  --instanceId              Instance ID                                 [string]
  --profile                 Profile to use                              [string]
  --output                  Output format             [string] [choices: "json"]
  --silent                  Do not output anything                     [boolean]
  --suppress-version-check  Do not check for package updates           [boolean]
  --verbose                 Output debug messages                      [boolean]
  --no-color                Disable colors                             [boolean]
  -h, --help                Show help                                  [boolean]
  --app                     App ID/name                                 [string]
  --org                     Org ID/name                                 [string]
  --secret                  Shared secret                    [string] [required]

Missing required argument: secret

`

exports['flex create with active profile without an app and org should fail 1'] = `
[error] Error: Either '--app' or '--org' option must be set.

`

exports['flex create with active profile with both app and org should fail 1'] = `
kinvey flex create <name>

Create a Flex service

Positionals:
  name  Flex service name                                             [required]

Options:
  --version                 Show version number                        [boolean]
  --email                   E-mail address of your Kinvey account       [string]
  --password                Password of your Kinvey account             [string]
  --2fa, --2Fa              Two-factor authentication token             [string]
  --instanceId              Instance ID                                 [string]
  --profile                 Profile to use                              [string]
  --output                  Output format             [string] [choices: "json"]
  --silent                  Do not output anything                     [boolean]
  --suppress-version-check  Do not check for package updates           [boolean]
  --verbose                 Output debug messages                      [boolean]
  --no-color                Disable colors                             [boolean]
  -h, --help                Show help                                  [boolean]
  --app                     App ID/name                                 [string]
  --org                     Org ID/name                                 [string]
  --secret                  Shared secret                    [string] [required]

Arguments app and org are mutually exclusive

`

exports['flex create with one-time session with name, secret and org should succeed 1'] = `
[debug] Checking for package updates
[debug] Logging in user: janeDoe@mail.com
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 200
[debug] Using organization: f71b0d5e60684b48b8265e7fa50302b9
[debug] Request:  GET http://localhost:3234/v2/organizations/f71b0d5e60684b48b8265e7fa50302b9
[debug] Response: GET http://localhost:3234/v2/organizations/f71b0d5e60684b48b8265e7fa50302b9 200
[debug] Request:  POST http://localhost:3234/v2/organizations/f71b0d5e60684b48b8265e7fa50302b9/data-links
[debug] Response: POST http://localhost:3234/v2/organizations/f71b0d5e60684b48b8265e7fa50302b9/data-links 201
[debug] Request:  DELETE http://localhost:3234/session
[debug] Response: DELETE http://localhost:3234/session 204
[debug] Logged out current user.
Created service: 12378kdl2

`
