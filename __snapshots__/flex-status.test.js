exports['flex status by specifying a profile and existent serviceId should succeed and output JSON 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToGetServiceStatus'
[debug] Project configuration file not found: 'projectSetupPath'.
[debug] Request:  GET http://localhost:3234/v2/data-links/12378kdl2/status
[debug] Response: GET http://localhost:3234/v2/data-links/12378kdl2/status 200
{
  "result": {
    "status": "ONLINE",
    "requestedAt": "2017-11-06T03:42:31.970Z",
    "deployUserInfo": {
      "firstName": "Davy",
      "lastName": "Jones",
      "email": "davy.jones@mail.com"
    },
    "version": "1.4.2"
  }
}

`

exports['flex status by specifying a profile and non-existent serviceId should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToGetServiceStatus'
[debug] Project configuration file not found: 'projectSetupPath'.
[debug] Request:  GET http://localhost:3234/v2/data-links/z793f26c8I_DONT_EXIST/status
[debug] Response: GET http://localhost:3234/v2/data-links/z793f26c8I_DONT_EXIST/status 404
[error] DataLinkNotFound: The specified data link could not be found.

`

exports['flex status by not specifying profile nor credentials when several profiles and existent serviceId should fail 1'] = `
kinvey flex status [serviceId]

Return the health of a Flex Service cluster

Positionals:
  serviceId  Service ID                                                 [string]

Options:
  --version                 Show version number                        [boolean]
  --email                   E-mail address of your Kinvey account       [string]
  --password                Password of your Kinvey account             [string]
  --2fa, --2Fa              Two-factor authentication token             [string]
  --instanceId              Instance ID                                 [string]
  --profile                 Profile to use                              [string]
  --output                  Output format             [string] [choices: "json"]
  --silent                  Do not output anything                     [boolean]
  --suppress-version-check  Do not check for package updates           [boolean]
  --verbose                 Output debug messages                      [boolean]
  --no-color                Disable colors                             [boolean]
  -h, --help                Show help                                  [boolean]

You must be authenticated.

`

exports['flex status by specifying credentials as options when valid and existent serviceId should succeed 1'] = `
[debug] Checking for package updates
[debug] Logging in user: janeyDoe@mail.com
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 200
[debug] Request:  GET http://localhost:3234/v2/data-links/12378kdl2/status
[debug] Response: GET http://localhost:3234/v2/data-links/12378kdl2/status 200
[debug] Request:  DELETE http://localhost:3234/session
[debug] Response: DELETE http://localhost:3234/session 204
[debug] Logged out current user.
key            value                                
-------------  -------------------------------------
status         ONLINE                               
version        1.4.2                                
id             12378kdl2                            
requestedAt    replaced_value
deployerEmail  davy.jones@mail.com                  
deployerName   Davy Jones                           


`

exports['flex status by specifying credentials as options when valid and non-existent serviceId should fail 1'] = `
[debug] Checking for package updates
[debug] Logging in user: janeyDoe@mail.com
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 200
[debug] Request:  GET http://localhost:3234/v2/data-links/z793f26c8I_DONT_EXIST/status
[debug] Response: GET http://localhost:3234/v2/data-links/z793f26c8I_DONT_EXIST/status 404
[debug] Request:  DELETE http://localhost:3234/session
[debug] Response: DELETE http://localhost:3234/session 204
[debug] Logged out current user.
[error] DataLinkNotFound: The specified data link could not be found.

`

exports['flex status by specifying credentials as options when invalid and existent serviceId should fail 1'] = `
[debug] Checking for package updates
[debug] Logging in user: johnDoe@mail.com
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 401
[error] InvalidCredentials: Credentials are invalid. Please authenticate.

`

exports['flex status by specifying a profile and existent serviceId should succeed and output default format 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToGetServiceStatus'
[debug] Project configuration file not found: 'projectSetupPath'.
[debug] Request:  GET http://localhost:3234/v2/data-links/12378kdl2/status
[debug] Response: GET http://localhost:3234/v2/data-links/12378kdl2/status 200
key            value                                
-------------  -------------------------------------
status         ONLINE                               
version        1.4.2                                
id             12378kdl2                            
requestedAt    replaced_value
deployerEmail  davy.jones@mail.com                  
deployerName   Davy Jones                           


`

exports['flex status by specifying a profile when valid project is set without serviceId as an option should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToGetServiceStatus'
[debug] Request:  GET http://localhost:3234/v2/data-links/12378kdl2/status
[debug] Response: GET http://localhost:3234/v2/data-links/12378kdl2/status 200
key            value                                
-------------  -------------------------------------
status         ONLINE                               
version        1.4.2                                
id             12378kdl2                            
name           TestKinveyDatalink                   
requestedAt    replaced_value
deployerEmail  davy.jones@mail.com                  
deployerName   Davy Jones                           


`

exports['flex status by specifying a profile when invalid project is set with existent serviceId as an option should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToGetServiceStatus'
[debug] Request:  GET http://localhost:3234/v2/data-links/12378kdl2/status
[debug] Response: GET http://localhost:3234/v2/data-links/12378kdl2/status 200
key            value                                
-------------  -------------------------------------
status         ONLINE                               
version        1.4.2                                
id             12378kdl2                            
requestedAt    replaced_value
deployerEmail  davy.jones@mail.com                  
deployerName   Davy Jones                           


`

exports['flex status by not specifying profile nor credentials when one profile and existent serviceId should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'flexStatusProfile'
[debug] Project configuration file not found: 'projectSetupPath'.
[debug] Request:  GET http://localhost:3234/v2/data-links/12378kdl2/status
[debug] Response: GET http://localhost:3234/v2/data-links/12378kdl2/status 200
key            value                                
-------------  -------------------------------------
status         ONLINE                               
version        1.4.2                                
id             12378kdl2                            
requestedAt    replaced_value
deployerEmail  davy.jones@mail.com                  
deployerName   Davy Jones                           


`
