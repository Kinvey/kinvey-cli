exports['flex status by specifying a profile and existent serviceId should succeed 1'] = `
debug:  Checking for package updates
debug:  Request:  GET http://localhost:3234/v2/data-links/12378kdl2/status
debug:  Response: GET http://localhost:3234/v2/data-links/12378kdl2/status 200
Status of FSR service 12378kdl2 (Service name is not available.)

  Status:   ONLINE [v1.4.2]

  Requested on:   Wed Nov 01 2017 10:42:31 GMT+0200 (FLE Standard Time)
  Deployed by:   davy.jones@mail.com (Davy Jones)


`

exports['flex status by specifying a profile and non-existent serviceId should fail 1'] = `
debug:  Checking for package updates
debug:  Request:  GET http://localhost:3234/v2/data-links/z793f26c8I_DONT_EXIST/status
debug:  Response: GET http://localhost:3234/v2/data-links/z793f26c8I_DONT_EXIST/status 404
error:  DataLinkNotFound: The specified data link could not be found.

`

exports['flex status by specifying a profile when valid project is set without serviceId as an option should succeed 1'] = `
debug:  Checking for package updates
debug:  Request:  GET http://localhost:3234/v2/data-links/12378kdl2/status
debug:  Response: GET http://localhost:3234/v2/data-links/12378kdl2/status 200
Status of FSR service 12378kdl2 (TestKinveyDatalink)

  Status:   ONLINE [v1.4.2]

  Requested on:   Wed Nov 01 2017 10:42:31 GMT+0200 (FLE Standard Time)
  Deployed by:   davy.jones@mail.com (Davy Jones)


`

exports['flex status by specifying a profile when invalid project is set with existent serviceId as an option should succeed 1'] = `
debug:  Checking for package updates
debug:  Request:  GET http://localhost:3234/v2/data-links/12378kdl2/status
debug:  Response: GET http://localhost:3234/v2/data-links/12378kdl2/status 200
Status of FSR service 12378kdl2 (Service name is not available.)

  Status:   ONLINE [v1.4.2]

  Requested on:   Wed Nov 01 2017 10:42:31 GMT+0200 (FLE Standard Time)
  Deployed by:   davy.jones@mail.com (Davy Jones)


`

exports['flex status by not specifying profile nor credentials when one profile and existent serviceId should succeed 1'] = `
debug:  Checking for package updates
debug:  Request:  GET http://localhost:3234/v2/data-links/12378kdl2/status
debug:  Response: GET http://localhost:3234/v2/data-links/12378kdl2/status 200
Status of FSR service 12378kdl2 (Service name is not available.)

  Status:   ONLINE [v1.4.2]

  Requested on:   Wed Nov 01 2017 10:42:31 GMT+0200 (FLE Standard Time)
  Deployed by:   davy.jones@mail.com (Davy Jones)


`

exports['flex status by not specifying profile nor credentials when several profiles and existent serviceId should fail 1'] = `
kinvey flex status

Return the health of a Flex Service cluster

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
  --serviceId               Service ID                                  [string]

You must be authenticated.

`

exports['flex status by specifying credentials as options when valid and existent serviceId should succeed 1'] = `
debug:  Checking for package updates
debug:  Request:  POST http://localhost:3234/session
debug:  Response: POST http://localhost:3234/session 200
debug:  Request:  GET http://localhost:3234/v2/data-links/12378kdl2/status
debug:  Response: GET http://localhost:3234/v2/data-links/12378kdl2/status 200
Status of FSR service 12378kdl2 (Service name is not available.)

  Status:   ONLINE [v1.4.2]

  Requested on:   Wed Nov 01 2017 10:42:31 GMT+0200 (FLE Standard Time)
  Deployed by:   davy.jones@mail.com (Davy Jones)

debug:  Request:  DELETE http://localhost:3234/session
debug:  Response: DELETE http://localhost:3234/session 204
debug:  Logged out current user.

`

exports['flex status by specifying credentials as options when valid and non-existent serviceId should fail 1'] = `
debug:  Checking for package updates
debug:  Request:  POST http://localhost:3234/session
debug:  Response: POST http://localhost:3234/session 200
debug:  Request:  GET http://localhost:3234/v2/data-links/z793f26c8I_DONT_EXIST/status
debug:  Response: GET http://localhost:3234/v2/data-links/z793f26c8I_DONT_EXIST/status 404
debug:  Request:  DELETE http://localhost:3234/session
debug:  Response: DELETE http://localhost:3234/session 204
debug:  Logged out current user.
error:  DataLinkNotFound: The specified data link could not be found.

`

exports['flex status by specifying credentials as options when invalid and existent serviceId should fail 1'] = `
debug:  Checking for package updates
debug:  Request:  POST http://localhost:3234/session
debug:  Response: POST http://localhost:3234/session 401
error:  InvalidCredentials: Credentials are invalid. Please authenticate.

`
