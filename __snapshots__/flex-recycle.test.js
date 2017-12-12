exports['flex recycle by not specifying profile nor credentials when one profile and existent serviceId should succeed 1'] = `
debug:  Checking for package updates
debug:  Request:  POST http://localhost:3234/v2/jobs
debug:  Response: POST http://localhost:3234/v2/jobs 200
info:  Recycle initiated, received job idOfJobThatIsRecyclingTheService
debug:  Writing JSON to file projectSetupPath
debug:  Writing contents to file projectSetupPath
info:  Saved job ID to project settings.

`

exports['flex recycle by specifying a profile and existent serviceId should succeed 1'] = `
debug:  Checking for package updates
debug:  Request:  POST http://localhost:3234/v2/jobs
debug:  Response: POST http://localhost:3234/v2/jobs 200
info:  Recycle initiated, received job idOfJobThatIsRecyclingTheService
debug:  Writing JSON to file projectSetupPath
debug:  Writing contents to file projectSetupPath
info:  Saved job ID to project settings.

`

exports['flex recycle by specifying a profile and non-existent serviceId should fail 1'] = `
debug:  Checking for package updates
debug:  Request:  POST http://localhost:3234/v2/jobs
debug:  Response: POST http://localhost:3234/v2/jobs 404
error:  DataLinkNotFound: The specified data link could not be found.

`

exports['flex recycle by specifying a profile when valid project is set without serviceId as an option should succeed 1'] = `
debug:  Checking for package updates
debug:  Request:  POST http://localhost:3234/v2/jobs
debug:  Response: POST http://localhost:3234/v2/jobs 200
info:  Recycle initiated, received job idOfJobThatIsRecyclingTheService
debug:  Writing JSON to file projectSetupPath
debug:  Writing contents to file projectSetupPath
info:  Saved job ID to project settings.

`

exports['flex recycle by specifying a profile when invalid project is set with existent serviceId as an option should succeed 1'] = `
debug:  Checking for package updates
debug:  Request:  POST http://localhost:3234/v2/jobs
debug:  Response: POST http://localhost:3234/v2/jobs 200
info:  Recycle initiated, received job idOfJobThatIsRecyclingTheService
debug:  Writing JSON to file projectSetupPath
debug:  Writing contents to file projectSetupPath
info:  Saved job ID to project settings.

`

exports['flex recycle by not specifying profile nor credentials when several profiles and existent serviceId should fail 1'] = `
kinvey flex recycle

Recycle the Service

Options:
  --version                 Show version number                        [boolean]
  --email                   E-mail address of your Kinvey account       [string]
  --password                Password of your Kinvey account             [string]
  --host                    Kinvey dedicated instance hostname          [string]
  --profile                 Profile to use                              [string]
  --silent                  Do not output anything                     [boolean]
  --suppress-version-check  Do not check for package updates           [boolean]
  --verbose                 Output debug messages                      [boolean]
  -h, --help                Show help                                  [boolean]
  --serviceId               Service ID                                  [string]

You must be authenticated.

`

exports['flex recycle by specifying credentials as options when valid and existent serviceId should succeed 1'] = `
debug:  Checking for package updates
debug:  Request:  POST http://localhost:3234/session
debug:  Response: POST http://localhost:3234/session 200
debug:  Request:  POST http://localhost:3234/v2/jobs
debug:  Response: POST http://localhost:3234/v2/jobs 200
info:  Recycle initiated, received job idOfJobThatIsRecyclingTheService
debug:  Writing JSON to file projectSetupPath
debug:  Writing contents to file projectSetupPath
info:  Saved job ID to project settings.
debug:  Request:  DELETE http://localhost:3234/session
debug:  Response: DELETE http://localhost:3234/session 204
debug:  Logged out current user.

`

exports['flex recycle by specifying credentials as options when valid and non-existent serviceId should fail 1'] = `
debug:  Checking for package updates
debug:  Request:  POST http://localhost:3234/session
debug:  Response: POST http://localhost:3234/session 200
debug:  Request:  POST http://localhost:3234/v2/jobs
debug:  Response: POST http://localhost:3234/v2/jobs 404
debug:  Request:  DELETE http://localhost:3234/session
debug:  Response: DELETE http://localhost:3234/session 204
debug:  Logged out current user.
error:  DataLinkNotFound: The specified data link could not be found.

`

exports['flex recycle by specifying credentials as options when invalid and existent serviceId should fail 1'] = `
debug:  Checking for package updates
debug:  Request:  POST http://localhost:3234/session
debug:  Response: POST http://localhost:3234/session 401
error:  InvalidCredentials: Credentials are invalid. Please authenticate.

`
