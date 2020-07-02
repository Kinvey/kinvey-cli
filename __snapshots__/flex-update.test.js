exports['flex update by specifying a profile when invalid project is set with existent service and svc env as options and single env var (set) should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'primaryProfile'
[debug] Request:  GET http://localhost:3234/v4/services/12378kdl2/environments
[debug] Response: GET http://localhost:3234/v4/services/12378kdl2/environments 200
[debug] Request:  GET http://localhost:3234/v4/services/12378kdl2/environments
[debug] Response: GET http://localhost:3234/v4/services/12378kdl2/environments 200
[debug] Request:  PUT http://localhost:3234/v4/services/12378kdl2/environments/0de22ffb3f2243ec8138170844envVar
[debug] Response: PUT http://localhost:3234/v4/services/12378kdl2/environments/0de22ffb3f2243ec8138170844envVar 200
Updated service environment: 0de22ffb3f2243ec8138170844envVar

`

exports['flex update by specifying a profile when valid project is set with both set and replace env vars should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'primaryProfile'
kinvey flex update

Update environment variables and runtime. Causes restart/rebuild of the service

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
  --service                                 Service ID                  [string]
  --env                                     Service environment name/ID [string]
  --replace-vars, --replaceVars             Environment variables (replaces all
                                            already existing). Specify either as
                                            comma-separated list of key-value
                                            pairs (key1=value1,key2=value2) or
                                            in JSON format.
  --set-vars, --setVars                     Environment variables to set.
                                            Specify either as comma-separated
                                            list of key-value pairs
                                            (key1=value1,key2=value2) or in JSON
                                            format.
  --runtime                                 Runtime environment
                        [string] [choices: "node6", "node8", "node10", "node12"]

Arguments replace-vars and set-vars are mutually exclusive

`

exports['flex update by specifying a profile when valid project is set with invalid basic env vars (set) should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'primaryProfile'
kinvey flex update

Update environment variables and runtime. Causes restart/rebuild of the service

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
  --service                                 Service ID                  [string]
  --env                                     Service environment name/ID [string]
  --replace-vars, --replaceVars             Environment variables (replaces all
                                            already existing). Specify either as
                                            comma-separated list of key-value
                                            pairs (key1=value1,key2=value2) or
                                            in JSON format.
  --set-vars, --setVars                     Environment variables to set.
                                            Specify either as comma-separated
                                            list of key-value pairs
                                            (key1=value1,key2=value2) or in JSON
                                            format.
  --runtime                                 Runtime environment
                        [string] [choices: "node6", "node8", "node10", "node12"]

Environment variables must be specified as comma-separated list (e.g. key1=value1,key2=value2) or in valid JSON format.

`

exports['flex update by specifying a profile when valid project is set with invalid runtime should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'primaryProfile'
kinvey flex update

Update environment variables and runtime. Causes restart/rebuild of the service

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
  --service                                 Service ID                  [string]
  --env                                     Service environment name/ID [string]
  --replace-vars, --replaceVars             Environment variables (replaces all
                                            already existing). Specify either as
                                            comma-separated list of key-value
                                            pairs (key1=value1,key2=value2) or
                                            in JSON format.
  --set-vars, --setVars                     Environment variables to set.
                                            Specify either as comma-separated
                                            list of key-value pairs
                                            (key1=value1,key2=value2) or in JSON
                                            format.
  --runtime                                 Runtime environment
                        [string] [choices: "node6", "node8", "node10", "node12"]

Invalid values:
  Argument: runtime, Given: "6.9.1", Choices: "node6", "node8", "node10", "node12"

`

exports['flex update by specifying a profile when valid project is set with valid basic env vars (replace) should succeed and output default format 1'] = `
[debug] Checking for package updates
[debug] Using profile 'primaryProfile'
[debug] Request:  GET http://localhost:3234/v4/services/12378kdl2/environments
[debug] Response: GET http://localhost:3234/v4/services/12378kdl2/environments 200
[debug] Request:  PUT http://localhost:3234/v4/services/12378kdl2/environments/0de22ffb3f2243ec8138170844envVar
[debug] Response: PUT http://localhost:3234/v4/services/12378kdl2/environments/0de22ffb3f2243ec8138170844envVar 200
Updated service environment: 0de22ffb3f2243ec8138170844envVar

`

exports['flex update by specifying a profile when valid project is set with valid basic env vars (set) should succeed and output JSON format 1'] = `
[debug] Checking for package updates
[debug] Using profile 'primaryProfile'
[debug] Request:  GET http://localhost:3234/v4/services/12378kdl2/environments
[debug] Response: GET http://localhost:3234/v4/services/12378kdl2/environments 200
[debug] Request:  PUT http://localhost:3234/v4/services/12378kdl2/environments/0de22ffb3f2243ec8138170844envVar
[debug] Response: PUT http://localhost:3234/v4/services/12378kdl2/environments/0de22ffb3f2243ec8138170844envVar 200
{
  "result": {
    "id": "0de22ffb3f2243ec8138170844envVar"
  }
}

`

exports['flex update by specifying a profile when valid project is set with valid runtime should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'primaryProfile'
[debug] Request:  GET http://localhost:3234/v4/services/12378kdl2/environments
[debug] Response: GET http://localhost:3234/v4/services/12378kdl2/environments 200
[debug] Request:  PUT http://localhost:3234/v4/services/12378kdl2/environments/0de22ffb3f2243ec8138170844envVar
[debug] Response: PUT http://localhost:3234/v4/services/12378kdl2/environments/0de22ffb3f2243ec8138170844envVar 200
Updated service environment: 0de22ffb3f2243ec8138170844envVar

`

exports['flex update by specifying credentials with service but without svc env (when many) should fail 1'] = `
[debug] Checking for package updates
[debug] Logging in user: janeyDoe@mail.com
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 200
[debug] Request:  GET http://localhost:3234/v4/services/12378kdl2/environments
[debug] Response: GET http://localhost:3234/v4/services/12378kdl2/environments 200
[debug] Request:  DELETE http://localhost:3234/session
[debug] Response: DELETE http://localhost:3234/session 204
[debug] Logged out current user.
[error] TooManySvcEnvs: You should choose an environment: dev, prod, stg0, stg1, stg2, stg3, stg5, stg4

`

exports['flex update by specifying credentials with service, svc env and valid complex env vars (set) should succeed 1'] = `
[debug] Checking for package updates
[debug] Logging in user: janeyDoe@mail.com
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 200
[debug] Request:  GET http://localhost:3234/v4/services/12378kdl2/environments
[debug] Response: GET http://localhost:3234/v4/services/12378kdl2/environments 200
[debug] Request:  GET http://localhost:3234/v4/services/12378kdl2/environments
[debug] Response: GET http://localhost:3234/v4/services/12378kdl2/environments 200
[debug] Request:  PUT http://localhost:3234/v4/services/12378kdl2/environments/0de22ffb3f2243ec8138170844envVar
[debug] Response: PUT http://localhost:3234/v4/services/12378kdl2/environments/0de22ffb3f2243ec8138170844envVar 200
[debug] Request:  DELETE http://localhost:3234/session
[debug] Response: DELETE http://localhost:3234/session 204
[debug] Logged out current user.
Updated service environment: 0de22ffb3f2243ec8138170844envVar

`

exports['flex update by specifying credentials without service and svc env should fail 1'] = `
[debug] Checking for package updates
kinvey flex update

Update environment variables and runtime. Causes restart/rebuild of the service

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
  --service                                 Service ID                  [string]
  --env                                     Service environment name/ID [string]
  --replace-vars, --replaceVars             Environment variables (replaces all
                                            already existing). Specify either as
                                            comma-separated list of key-value
                                            pairs (key1=value1,key2=value2) or
                                            in JSON format.
  --set-vars, --setVars                     Environment variables to set.
                                            Specify either as comma-separated
                                            list of key-value pairs
                                            (key1=value1,key2=value2) or in JSON
                                            format.
  --runtime                                 Runtime environment
                        [string] [choices: "node6", "node8", "node10", "node12"]

This project is not configured. Use 'kinvey flex init' to get started. Alternatively, use options: service.

`
