exports['flex recycle by specifying a profile and existent serviceId should succeed and output default format 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToRecycleService'
[debug] Project configuration file not found: 'projectSetupPath'.
[debug] Request:  POST http://localhost:3234/v2/jobs
[debug] Response: POST http://localhost:3234/v2/jobs 200
[debug] Writing contents to file projectSetupPath
[debug] Saved job ID to project settings.
Recycle initiated. Job: idOfJobThatIsRecyclingTheService

`

exports['flex recycle by specifying a profile and existent serviceId should succeed and output JSON 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToRecycleService'
[debug] Request:  POST http://localhost:3234/v2/jobs
[debug] Response: POST http://localhost:3234/v2/jobs 200
[debug] Writing contents to file projectSetupPath
[debug] Saved job ID to project settings.
{
  "result": {
    "id": "idOfJobThatIsRecyclingTheService"
  }
}

`

exports['flex recycle by specifying a profile and non-existent serviceId should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToRecycleService'
[debug] Request:  POST http://localhost:3234/v2/jobs
[debug] Response: POST http://localhost:3234/v2/jobs 404
[error] DataLinkNotFound: The specified data link could not be found.

`

exports['flex recycle by specifying a profile when valid project is set without serviceId as an option should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToRecycleService'
[debug] Request:  POST http://localhost:3234/v2/jobs
[debug] Response: POST http://localhost:3234/v2/jobs 200
[debug] Writing contents to file projectSetupPath
[debug] Saved job ID to project settings.
Recycle initiated. Job: idOfJobThatIsRecyclingTheService

`

exports['flex recycle by specifying a profile when invalid project is set with existent serviceId as an option should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToRecycleService'
[debug] Request:  POST http://localhost:3234/v2/jobs
[debug] Response: POST http://localhost:3234/v2/jobs 200
[debug] Writing contents to file projectSetupPath
[debug] Saved job ID to project settings.
Recycle initiated. Job: idOfJobThatIsRecyclingTheService

`

exports['flex recycle by not specifying profile nor credentials when one profile and existent serviceId should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'flexStatusProfile'
[debug] Project configuration file not found: 'projectSetupPath'.
[debug] Request:  POST http://localhost:3234/v2/jobs
[debug] Response: POST http://localhost:3234/v2/jobs 200
[debug] Writing contents to file projectSetupPath
[debug] Saved job ID to project settings.
Recycle initiated. Job: idOfJobThatIsRecyclingTheService

`

exports['flex recycle by not specifying profile nor credentials when several profiles and existent serviceId should fail 1'] = `
kinvey flex recycle

Recycle the Service

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
  --serviceId               Service ID                                  [string]

You must be authenticated.

`

exports['flex recycle by specifying credentials as options when valid and existent serviceId should succeed 1'] = `
[debug] Checking for package updates
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 200
[debug] Request:  POST http://localhost:3234/v2/jobs
[debug] Response: POST http://localhost:3234/v2/jobs 200
[debug] Request:  DELETE http://localhost:3234/session
[debug] Response: DELETE http://localhost:3234/session 204
[debug] Logged out current user.
Recycle initiated. Job: idOfJobThatIsRecyclingTheService

`

exports['flex recycle by specifying credentials as options when valid and non-existent serviceId should fail 1'] = `
[debug] Checking for package updates
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 200
[debug] Request:  POST http://localhost:3234/v2/jobs
[debug] Response: POST http://localhost:3234/v2/jobs 404
[debug] Request:  DELETE http://localhost:3234/session
[debug] Response: DELETE http://localhost:3234/session 204
[debug] Logged out current user.
[error] DataLinkNotFound: The specified data link could not be found.

`

exports['flex recycle by specifying credentials as options when invalid and existent serviceId should fail 1'] = `
[debug] Checking for package updates
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 401
[error] InvalidCredentials: Credentials are invalid. Please authenticate.

`
