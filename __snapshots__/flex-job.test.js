exports['flex job by specifying a profile and existent jobId should succeed 1'] = `
debug:  Checking for package updates
debug:  Failed to restore project settings.
debug:  Request:  GET http://localhost:3234/v2/jobs/6fa90d40d78c43f9a8a9a1838de41a37
debug:  Response: GET http://localhost:3234/v2/jobs/6fa90d40d78c43f9a8a9a1838de41a37 200
info:  Job status: COMPLETE

`

exports['flex job by specifying a profile and non-existent jobId should fail 1'] = `
debug:  Checking for package updates
debug:  Failed to restore project settings.
debug:  Request:  GET http://localhost:3234/v2/jobs/123jobDoesntExist
debug:  Response: GET http://localhost:3234/v2/jobs/123jobDoesntExist 404
error:  JobNotFound: The specified job could not be found.

`

exports['flex job by not specifying profile nor credentials when one profile and existent jobId should succeed 1'] = `
debug:  Checking for package updates
debug:  Failed to restore project settings.
debug:  Request:  GET http://localhost:3234/v2/jobs/6fa90d40d78c43f9a8a9a1838de41a37
debug:  Response: GET http://localhost:3234/v2/jobs/6fa90d40d78c43f9a8a9a1838de41a37 200
info:  Job status: COMPLETE

`

exports['flex job by not specifying profile nor credentials when several profiles and existent jobId should fail 1'] = `
bincli.js flex job [id]

Options:
  --version                 Show version number                        [boolean]
  --email                   E-mail address of your Kinvey account       [string]
  --password                Password of your Kinvey account             [string]
  --host                    Host of the Kinvey service                  [string]
  --profile                 Profile to use                              [string]
  --silent                  Do not output anything                     [boolean]
  --suppress-version-check  Do not check for package updates           [boolean]
  --verbose                 Output debug messages                      [boolean]
  -h, --help                Show help                                  [boolean]

You must be authenticated. (CHANGE ERR MSG)

`

exports['flex job by specifying credentials as options when valid and existent jobId should succeed 1'] = `
debug:  Checking for package updates
debug:  Failed to restore project settings.
debug:  Request:  POST http://localhost:3234/session
debug:  Response: POST http://localhost:3234/session 200
debug:  Request:  GET http://localhost:3234/v2/jobs/6fa90d40d78c43f9a8a9a1838de41a37
debug:  Response: GET http://localhost:3234/v2/jobs/6fa90d40d78c43f9a8a9a1838de41a37 200
info:  Job status: COMPLETE
debug:  Request:  DELETE http://localhost:3234/session
debug:  Response: DELETE http://localhost:3234/session 204
debug:  Logged out current user.

`

exports['flex job by specifying credentials as options when valid and non-existent jobId should fail 1'] = `
debug:  Checking for package updates
debug:  Failed to restore project settings.
debug:  Request:  POST http://localhost:3234/session
debug:  Response: POST http://localhost:3234/session 200
debug:  Request:  GET http://localhost:3234/v2/jobs/123jobDoesntExist
debug:  Response: GET http://localhost:3234/v2/jobs/123jobDoesntExist 404
debug:  Request:  DELETE http://localhost:3234/session
debug:  Response: DELETE http://localhost:3234/session 204
debug:  Logged out current user.
error:  JobNotFound: The specified job could not be found.

`

exports['flex job by specifying credentials as options when invalid and existent jobId should fail 1'] = `
debug:  Checking for package updates
debug:  Failed to restore project settings.
debug:  Request:  POST http://localhost:3234/session
debug:  Response: POST http://localhost:3234/session 401
error:  InvalidCredentials: Credentials are invalid. Please authenticate.

`
