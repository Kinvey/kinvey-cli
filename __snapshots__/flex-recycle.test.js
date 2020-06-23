exports['flex recycle by not specifying profile nor credentials when one profile and existent serviceId should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'flexStatusProfile'
[debug] Project configuration file not found: 'projectSetupPath'.
[debug] Request:  GET http://localhost:3234/v4/services/12378kdl2/environments
[debug] Response: GET http://localhost:3234/v4/services/12378kdl2/environments 200
[debug] Request:  POST http://localhost:3234/v4/jobs
[debug] Response: POST http://localhost:3234/v4/jobs 200
Recycle initiated. You can use 'kinvey flex status' to track the recycle progress.

`

exports['flex recycle by not specifying profile nor credentials when several profiles and existent serviceId should fail 1'] = `
kinvey flex recycle

Recycle the Service

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

You must be authenticated.

`

exports['flex recycle by specifying a profile and existent serviceId plus non-existent svcEnv should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToRecycleService'
[debug] Project configuration file not found: 'projectSetupPath'.
[debug] Request:  GET http://localhost:3234/v4/services/12378kdl2/environments
[debug] Response: GET http://localhost:3234/v4/services/12378kdl2/environments 200
[error] NotFound: Could not find service environment with identifier 'nonExistentEnv'.

`

exports['flex recycle by specifying a profile and existent serviceId should succeed and output JSON 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToRecycleService'
[debug] Project configuration file not found: 'projectSetupPath'.
[debug] Request:  GET http://localhost:3234/v4/services/12378kdl2/environments
[debug] Response: GET http://localhost:3234/v4/services/12378kdl2/environments 200
[debug] Request:  POST http://localhost:3234/v4/jobs
[debug] Response: POST http://localhost:3234/v4/jobs 200
{
  "result": null
}

`

exports['flex recycle by specifying a profile and existent serviceId should succeed and output default format 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToRecycleService'
[debug] Project configuration file not found: 'projectSetupPath'.
[debug] Request:  GET http://localhost:3234/v4/services/12378kdl2/environments
[debug] Response: GET http://localhost:3234/v4/services/12378kdl2/environments 200
[debug] Request:  POST http://localhost:3234/v4/jobs
[debug] Response: POST http://localhost:3234/v4/jobs 200
Recycle initiated. You can use 'kinvey flex status' to track the recycle progress.

`

exports['flex recycle by specifying a profile and non-existent serviceId should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToRecycleService'
[debug] Project configuration file not found: 'projectSetupPath'.
[debug] Request:  GET http://localhost:3234/v4/services/12serviceIdThatDoesntExist/environments
[debug] Response: GET http://localhost:3234/v4/services/12serviceIdThatDoesntExist/environments 404
[error] ServiceNotFound: The specified service could not be found.

`

exports['flex recycle by specifying a profile when invalid project is set with existent serviceId as an option should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToRecycleService'
[debug] Request:  GET http://localhost:3234/v4/services/12378kdl2/environments
[debug] Response: GET http://localhost:3234/v4/services/12378kdl2/environments 200
[debug] Request:  POST http://localhost:3234/v4/jobs
[debug] Response: POST http://localhost:3234/v4/jobs 200
Recycle initiated. You can use 'kinvey flex status' to track the recycle progress.

`

exports['flex recycle by specifying a profile when valid project is set without serviceId as an option but with non-existent svcEnv should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToRecycleService'
[debug] Request:  GET http://localhost:3234/v4/services/12378kdl2/environments
[debug] Response: GET http://localhost:3234/v4/services/12378kdl2/environments 200
[error] NotFound: Could not find service environment with identifier 'nonExistentEnv'.

`

exports['flex recycle by specifying a profile when valid project is set without serviceId as an option should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToRecycleService'
[debug] Request:  POST http://localhost:3234/v4/jobs
[debug] Response: POST http://localhost:3234/v4/jobs 200
Recycle initiated. You can use 'kinvey flex status' to track the recycle progress.

`

exports['flex recycle by specifying credentials as options when invalid and existent serviceId should fail 1'] = `
[debug] Checking for package updates
[debug] Logging in user: johnDoe@mail.com
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 401
[error] InvalidCredentials: Invalid e-mail and/or password.

`

exports['flex recycle by specifying credentials as options when valid and existent serviceId should succeed 1'] = `
[debug] Checking for package updates
[debug] Logging in user: janeyDoe@mail.com
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 200
[debug] Request:  GET http://localhost:3234/v4/services/12378kdl2/environments
[debug] Response: GET http://localhost:3234/v4/services/12378kdl2/environments 200
[debug] Request:  POST http://localhost:3234/v4/jobs
[debug] Response: POST http://localhost:3234/v4/jobs 200
[debug] Request:  DELETE http://localhost:3234/session
[debug] Response: DELETE http://localhost:3234/session 204
[debug] Logged out current user.
Recycle initiated. You can use 'kinvey flex status' to track the recycle progress.

`

exports['flex recycle by specifying credentials as options when valid and non-existent serviceId should fail 1'] = `
[debug] Checking for package updates
[debug] Logging in user: janeyDoe@mail.com
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 200
[debug] Request:  GET http://localhost:3234/v4/services/12serviceIdThatDoesntExist/environments
[debug] Response: GET http://localhost:3234/v4/services/12serviceIdThatDoesntExist/environments 404
[debug] Request:  DELETE http://localhost:3234/session
[debug] Response: DELETE http://localhost:3234/session 204
[debug] Logged out current user.
[error] ServiceNotFound: The specified service could not be found.

`
