exports['flex create with active profile with a name, org and invalid env vars should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
kinvey flex create <name>

Create a Flex service

Positionals:
  name  Flex service name                                             [required]

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
  --org                                     Org ID/name                 [string]
  --secret                                  Shared secret               [string]
  --env                                     Service environment name
                                               [string] [default: "Development"]
  --vars, --set-vars                        Environment variables. Specify
                                            either as comma-separated list of
                                            key-value pairs
                                            (key1=value1,key2=value2) or in JSON
                                            format.
  --runtime                                 Runtime environment
                        [string] [choices: "node6", "node8", "node10", "node12"]

Environment variables must be specified as comma-separated list (e.g. key1=value1,key2=value2) or in valid JSON format.

`

exports['flex create with active profile with a name, org and invalid runtime should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
kinvey flex create <name>

Create a Flex service

Positionals:
  name  Flex service name                                             [required]

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
  --org                                     Org ID/name                 [string]
  --secret                                  Shared secret               [string]
  --env                                     Service environment name
                                               [string] [default: "Development"]
  --vars, --set-vars                        Environment variables. Specify
                                            either as comma-separated list of
                                            key-value pairs
                                            (key1=value1,key2=value2) or in JSON
                                            format.
  --runtime                                 Runtime environment
                        [string] [choices: "node6", "node8", "node10", "node12"]

Invalid values:
  Argument: runtime, Given: "node8.11.1", Choices: "node6", "node8", "node10", "node12"

`

exports['flex create with active profile with a name, secret, basic env vars and org should succeed and output default format 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using organization: f71b0d5e60684b48b8265e7fa50302b9
[debug] Request:  GET http://localhost:3234/v4/organizations/f71b0d5e60684b48b8265e7fa50302b9
[debug] Response: GET http://localhost:3234/v4/organizations/f71b0d5e60684b48b8265e7fa50302b9 200
[debug] Request:  POST http://localhost:3234/v4/services
[debug] Response: POST http://localhost:3234/v4/services 201
[debug] Request:  POST http://localhost:3234/v4/services/12378kdl2/environments
[debug] Response: POST http://localhost:3234/v4/services/12378kdl2/environments 201
Created service: 12378kdl2. Secret: 123

`

exports['flex create with active profile with a name, secret, basic env vars, runtime and org should succeed and output default format 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using organization: f71b0d5e60684b48b8265e7fa50302b9
[debug] Request:  GET http://localhost:3234/v4/organizations/f71b0d5e60684b48b8265e7fa50302b9
[debug] Response: GET http://localhost:3234/v4/organizations/f71b0d5e60684b48b8265e7fa50302b9 200
[debug] Request:  POST http://localhost:3234/v4/services
[debug] Response: POST http://localhost:3234/v4/services 201
[debug] Request:  POST http://localhost:3234/v4/services/12378kdl2/environments
[debug] Response: POST http://localhost:3234/v4/services/12378kdl2/environments 201
Created service: 12378kdl2. Secret: 123

`

exports['flex create with active profile with a name, secret, complex env vars and org should succeed and output JSON 1'] = `
{
  "result": {
    "id": "12378kdl2",
    "secret": "123"
  }
}

`

exports['flex create with active profile without a name should fail 1'] = `
kinvey flex create <name>

Create a Flex service

Positionals:
  name  Flex service name                                             [required]

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
  --org                                     Org ID/name                 [string]
  --secret                                  Shared secret               [string]
  --env                                     Service environment name
                                               [string] [default: "Development"]
  --vars, --set-vars                        Environment variables. Specify
                                            either as comma-separated list of
                                            key-value pairs
                                            (key1=value1,key2=value2) or in JSON
                                            format.
  --runtime                                 Runtime environment
                        [string] [choices: "node6", "node8", "node10", "node12"]

Not enough non-option arguments: got 0, need at least 1

`

exports['flex create with active profile without a secret should succeed 1'] = `
Created service: 12378kdl2. Secret: auto-generated

`

exports['flex create with active profile without an org should fail 1'] = `
kinvey flex create <name>

Create a Flex service

Positionals:
  name  Flex service name                                             [required]

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
  --org                                     Org ID/name                 [string]
  --secret                                  Shared secret               [string]
  --env                                     Service environment name
                                               [string] [default: "Development"]
  --vars, --set-vars                        Environment variables. Specify
                                            either as comma-separated list of
                                            key-value pairs
                                            (key1=value1,key2=value2) or in JSON
                                            format.
  --runtime                                 Runtime environment
                        [string] [choices: "node6", "node8", "node10", "node12"]

Organization is required. Please use 'kinvey flex init' to setup the project, use the --org option or set active org.

`

exports['flex create with one-time session with name, secret and org should succeed 1'] = `
[debug] Checking for package updates
[debug] Logging in user: janeDoe@mail.com
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 200
[debug] Using organization: f71b0d5e60684b48b8265e7fa50302b9
[debug] Request:  GET http://localhost:3234/v4/organizations/f71b0d5e60684b48b8265e7fa50302b9
[debug] Response: GET http://localhost:3234/v4/organizations/f71b0d5e60684b48b8265e7fa50302b9 200
[debug] Request:  POST http://localhost:3234/v4/services
[debug] Response: POST http://localhost:3234/v4/services 201
[debug] Request:  POST http://localhost:3234/v4/services/12378kdl2/environments
[debug] Response: POST http://localhost:3234/v4/services/12378kdl2/environments 201
[debug] Request:  DELETE http://localhost:3234/session
[debug] Response: DELETE http://localhost:3234/session 204
[debug] Logged out current user.
Created service: 12378kdl2. Secret: 123

`
