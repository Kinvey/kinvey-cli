exports['flex job by specifying a profile and existent jobId should succeed and output default format 1'] = `
[debug] Checking for package updates
[debug] Request:  GET http://localhost:3234/v2/jobs/6fa90d40d78c43f9a8a9a1838de41a37
[debug] Response: GET http://localhost:3234/v2/jobs/6fa90d40d78c43f9a8a9a1838de41a37 200
Job status: COMPLETE

`

exports['flex job by specifying a profile and existent jobId should succeed and output JSON 1'] = `
[debug] Checking for package updates
[debug] Request:  GET http://localhost:3234/v2/jobs/6fa90d40d78c43f9a8a9a1838de41a37
[debug] Response: GET http://localhost:3234/v2/jobs/6fa90d40d78c43f9a8a9a1838de41a37 200
{
  "result": {
    "status": "COMPLETE",
    "progress": "Deploying service.",
    "jobId": "6fa90d40d78c43f9a8a9a1838de41a37"
  }
}

`

exports['flex job by specifying a profile and non-existent jobId should fail 1'] = `
[debug] Checking for package updates
[debug] Request:  GET http://localhost:3234/v2/jobs/123jobDoesntExist
[debug] Response: GET http://localhost:3234/v2/jobs/123jobDoesntExist 404
JobNotFound: The specified job could not be found.

`

exports['flex job by not specifying profile nor credentials when one profile and existent jobId should succeed 1'] = `
[debug] Checking for package updates
[debug] Request:  GET http://localhost:3234/v2/jobs/6fa90d40d78c43f9a8a9a1838de41a37
[debug] Response: GET http://localhost:3234/v2/jobs/6fa90d40d78c43f9a8a9a1838de41a37 200
Job status: COMPLETE

`

exports['flex job by not specifying profile nor credentials when several profiles and existent jobId should fail 1'] = `
kinvey flex job [id]

Get the job status of a deploy/recycle command

Positionals:
  id  Job ID

Options:
  --version                 Show version number                        [boolean]
  --email                   E-mail address of your Kinvey account       [string]
  --password                Password of your Kinvey account             [string]
  --host                    Kinvey dedicated instance hostname          [string]
  --profile                 Profile to use                              [string]
  --output                  Output format             [string] [choices: "json"]
  --silent                  Do not output anything                     [boolean]
  --suppress-version-check  Do not check for package updates           [boolean]
  --verbose                 Output debug messages                      [boolean]
  --color                   Enable/disable colors      [boolean] [default: true]
  -h, --help                Show help                                  [boolean]

You must be authenticated.

`

exports['flex job by specifying credentials as options when valid and existent jobId should succeed 1'] = `
[debug] Checking for package updates
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 200
[debug] Request:  GET http://localhost:3234/v2/jobs/6fa90d40d78c43f9a8a9a1838de41a37
[debug] Response: GET http://localhost:3234/v2/jobs/6fa90d40d78c43f9a8a9a1838de41a37 200
[debug] Request:  DELETE http://localhost:3234/session
[debug] Response: DELETE http://localhost:3234/session 204
[debug] Logged out current user.
Job status: COMPLETE

`

exports['flex job by specifying credentials as options when valid and non-existent jobId should fail 1'] = `
[debug] Checking for package updates
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 200
[debug] Request:  GET http://localhost:3234/v2/jobs/123jobDoesntExist
[debug] Response: GET http://localhost:3234/v2/jobs/123jobDoesntExist 404
[debug] Request:  DELETE http://localhost:3234/session
[debug] Response: DELETE http://localhost:3234/session 204
[debug] Logged out current user.
JobNotFound: The specified job could not be found.

`

exports['flex job by specifying credentials as options when invalid and existent jobId should fail 1'] = `
[debug] Checking for package updates
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 401
InvalidCredentials: Credentials are invalid. Please authenticate.

`
