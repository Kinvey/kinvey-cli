exports['flex job by not specifying profile nor credentials when one profile and existent jobId should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'flexJobProfile'
[debug] Project configuration file not found: 'projectSetupPath'.
[debug] Request:  GET http://localhost:3234/v3/jobs/6fa90d40d78c43f9a8a9a1838de41a37
[debug] Response: GET http://localhost:3234/v3/jobs/6fa90d40d78c43f9a8a9a1838de41a37 200
Job status: COMPLETE

`

exports['flex job by not specifying profile nor credentials when several profiles and existent jobId should fail 1'] = `
kinvey flex job [id]

Get the job status of a deploy/recycle command

Positionals:
  id  Job ID

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

You must be authenticated.

`

exports['flex job by specifying a profile and existent jobId should succeed and output JSON 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToGetJobStatus'
[debug] Project configuration file not found: 'projectSetupPath'.
[debug] Request:  GET http://localhost:3234/v3/jobs/6fa90d40d78c43f9a8a9a1838de41a37
[debug] Response: GET http://localhost:3234/v3/jobs/6fa90d40d78c43f9a8a9a1838de41a37 200
{
  "result": {
    "status": "COMPLETE",
    "progress": "Deploying service.",
    "jobId": "6fa90d40d78c43f9a8a9a1838de41a37"
  }
}

`

exports['flex job by specifying a profile and existent jobId should succeed and output default format 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToGetJobStatus'
[debug] Project configuration file not found: 'projectSetupPath'.
[debug] Request:  GET http://localhost:3234/v3/jobs/6fa90d40d78c43f9a8a9a1838de41a37
[debug] Response: GET http://localhost:3234/v3/jobs/6fa90d40d78c43f9a8a9a1838de41a37 200
Job status: COMPLETE

`

exports['flex job by specifying a profile and non-existent jobId should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToGetJobStatus'
[debug] Project configuration file not found: 'projectSetupPath'.
[debug] Request:  GET http://localhost:3234/v3/jobs/123jobDoesntExist
[debug] Response: GET http://localhost:3234/v3/jobs/123jobDoesntExist 404
[error] JobNotFound: The specified job could not be found.

`

exports['flex job by specifying credentials as options when invalid and existent jobId should fail 1'] = `
[debug] Checking for package updates
[debug] Logging in user: johnDoe@mail.com
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 401
[error] InvalidCredentials: Credentials are invalid. Please authenticate.

`

exports['flex job by specifying credentials as options when valid and existent jobId should succeed 1'] = `
[debug] Checking for package updates
[debug] Logging in user: janeyDoe@mail.com
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 200
[debug] Request:  GET http://localhost:3234/v3/jobs/6fa90d40d78c43f9a8a9a1838de41a37
[debug] Response: GET http://localhost:3234/v3/jobs/6fa90d40d78c43f9a8a9a1838de41a37 200
[debug] Request:  DELETE http://localhost:3234/session
[debug] Response: DELETE http://localhost:3234/session 204
[debug] Logged out current user.
Job status: COMPLETE

`

exports['flex job by specifying credentials as options when valid and non-existent jobId should fail 1'] = `
[debug] Checking for package updates
[debug] Logging in user: janeyDoe@mail.com
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 200
[debug] Request:  GET http://localhost:3234/v3/jobs/123jobDoesntExist
[debug] Response: GET http://localhost:3234/v3/jobs/123jobDoesntExist 404
[debug] Request:  DELETE http://localhost:3234/session
[debug] Response: DELETE http://localhost:3234/session 204
[debug] Logged out current user.
[error] JobNotFound: The specified job could not be found.

`

exports['flex job without additional args and options when active profile is set should suceed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'willBeActive'
[debug] Request:  GET http://localhost:3234/v3/jobs/6fa90d40d78c43f9a8a9a1838de41a37
[debug] Response: GET http://localhost:3234/v3/jobs/6fa90d40d78c43f9a8a9a1838de41a37 200
Job status: COMPLETE

`
