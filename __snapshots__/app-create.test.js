exports['app create with a name and existent org identifier (name) should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using organization: My Team
[debug] Request:  GET http://localhost:3234/v2/organizations
[debug] Response: GET http://localhost:3234/v2/organizations 200
[debug] Request:  POST http://localhost:3234/v2/apps
[debug] Response: POST http://localhost:3234/v2/apps 201
Created application: 885f5d307afd4168bebca1a64f815c1e

`

exports['app create with a name should succeed and output default format 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Request:  POST http://localhost:3234/v2/apps
[debug] Response: POST http://localhost:3234/v2/apps 201
Created application: 885f5d307afd4168bebca1a64f815c1e

`

exports['app create with a name and existent org identifier (ID) should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using organization: f71b0d5e60684b48b8265e7fa50302b9
[debug] Request:  GET http://localhost:3234/v2/organizations/f71b0d5e60684b48b8265e7fa50302b9
[debug] Response: GET http://localhost:3234/v2/organizations/f71b0d5e60684b48b8265e7fa50302b9 200
[debug] Request:  POST http://localhost:3234/v2/apps
[debug] Response: POST http://localhost:3234/v2/apps 201
Created application: 885f5d307afd4168bebca1a64f815c1e

`

exports['app create with a name should succeed and output JSON 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Request:  POST http://localhost:3234/v2/apps
[debug] Response: POST http://localhost:3234/v2/apps 201
{
  "result": {
    "id": "885f5d307afd4168bebca1a64f815c1e"
  }
}

`

exports['app create without a name should fail 1'] = `
kinvey app create <name>

Create an application

Positionals:
  name  App name                                                      [required]

Options:
  --version                 Show version number                        [boolean]
  --email                   E-mail address of your Kinvey account       [string]
  --password                Password of your Kinvey account             [string]
  --2fa, --2Fa              Two-factor authentication token             [string]
  --instance-id             Instance ID                                 [string]
  --profile                 Profile to use                              [string]
  --output                  Output format             [string] [choices: "json"]
  --silent                  Do not output anything                     [boolean]
  --suppress-version-check  Do not check for package updates           [boolean]
  --verbose                 Output debug messages                      [boolean]
  --no-color                Disable colors                             [boolean]
  -h, --help                Show help                                  [boolean]
  --org                     Org ID/name                                 [string]

Not enough non-option arguments: got 0, need at least 1

`
