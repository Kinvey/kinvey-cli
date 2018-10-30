exports['flex status by specifying a profile existent serviceId and existent svc env name should succeed and output JSON 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToGetServiceStatus'
[debug] Project configuration file not found: 'projectSetupPath'.
[debug] Request:  GET http://localhost:3234/v3/services/12378kdl2/environments
[debug] Response: GET http://localhost:3234/v3/services/12378kdl2/environments 200
[debug] Request:  GET http://localhost:3234/v3/services/12378kdl2/environments/662dd1efe3d92e0180317487b29c6e66/status
[debug] Response: GET http://localhost:3234/v3/services/12378kdl2/environments/662dd1efe3d92e0180317487b29c6e66/status 200
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
[debug] Request:  GET http://localhost:3234/v3/services/z793f26c8I_DONT_EXIST/environments
[debug] Response: GET http://localhost:3234/v3/services/z793f26c8I_DONT_EXIST/environments 404
[error] ServiceNotFound: The specified service could not be found.

`

exports['flex status by specifying a profile when valid project is set without serviceId and svcEnv as options should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToGetServiceStatus'
[debug] Request:  GET http://localhost:3234/v3/services/12378kdl2/environments/642dd1efe3d92e0180317487b29c6e88/status
[debug] Response: GET http://localhost:3234/v3/services/12378kdl2/environments/642dd1efe3d92e0180317487b29c6e88/status 200
key            value                                
-------------  -------------------------------------
status         ONLINE                               
version        1.4.2                                
name           TestKinveyDatalink                   
id             12378kdl2                            
requestedAt    replaced_value
deployerEmail  davy.jones@mail.com                  
deployerName   Davy Jones                           


`

exports['flex status by specifying a profile when invalid project is set with existent serviceId and svcEnv as options should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToGetServiceStatus'
[debug] Request:  GET http://localhost:3234/v3/services/12378kdl2/environments
[debug] Response: GET http://localhost:3234/v3/services/12378kdl2/environments 200
[debug] Request:  GET http://localhost:3234/v3/services/12378kdl2/environments/662dd1efe3d92e0180317487b29c6e66/status
[debug] Response: GET http://localhost:3234/v3/services/12378kdl2/environments/662dd1efe3d92e0180317487b29c6e66/status 200
key            value                                
-------------  -------------------------------------
status         ONLINE                               
version        1.4.2                                
id             12378kdl2                            
requestedAt    replaced_value
deployerEmail  davy.jones@mail.com                  
deployerName   Davy Jones                           


`

exports['flex status by not specifying profile nor credentials when one profile and existent serviceId plus existent svcEnv should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'flexStatusProfile'
[debug] Project configuration file not found: 'projectSetupPath'.
[debug] Request:  GET http://localhost:3234/v3/services/12378kdl2/environments
[debug] Response: GET http://localhost:3234/v3/services/12378kdl2/environments 200
[debug] Request:  GET http://localhost:3234/v3/services/12378kdl2/environments/662dd1efe3d92e0180317487b29c6e66/status
[debug] Response: GET http://localhost:3234/v3/services/12378kdl2/environments/662dd1efe3d92e0180317487b29c6e66/status 200
key            value                                
-------------  -------------------------------------
status         ONLINE                               
version        1.4.2                                
id             12378kdl2                            
requestedAt    replaced_value
deployerEmail  davy.jones@mail.com                  
deployerName   Davy Jones                           


`

exports['flex status by not specifying profile nor credentials when several profiles and existent serviceId plus existent svcEnv should fail 1'] = `
kinvey flex status

Return the health of a Flex Service cluster

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
  --serviceId               Service ID                                  [string]
  --env                     Service environment name/ID                 [string]

You must be authenticated.

`

exports['flex status by specifying credentials as options when valid and existent serviceId plus existent svcEnv should succeed 1'] = `
[debug] Checking for package updates
[debug] Logging in user: janeyDoe@mail.com
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 200
[debug] Request:  GET http://localhost:3234/v3/services/12378kdl2/environments
[debug] Response: GET http://localhost:3234/v3/services/12378kdl2/environments 200
[debug] Request:  GET http://localhost:3234/v3/services/12378kdl2/environments/662dd1efe3d92e0180317487b29c6e66/status
[debug] Response: GET http://localhost:3234/v3/services/12378kdl2/environments/662dd1efe3d92e0180317487b29c6e66/status 200
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

exports['flex status by specifying credentials as options when valid and existent serviceId plus existent svcEnv should succeed (with runtime) 1'] = `
[debug] Checking for package updates
[debug] Logging in user: janeyDoe@mail.com
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 200
[debug] Request:  GET http://localhost:3234/v3/services/12378kdl2/environments
[debug] Response: GET http://localhost:3234/v3/services/12378kdl2/environments 200
[debug] Request:  GET http://localhost:3234/v3/services/12378kdl2/environments/123456/status
[debug] Response: GET http://localhost:3234/v3/services/12378kdl2/environments/123456/status 200
[debug] Request:  DELETE http://localhost:3234/session
[debug] Response: DELETE http://localhost:3234/session 204
[debug] Logged out current user.
key                value                                
-----------------  -------------------------------------
status             ONLINE                               
version            1.4.2                                
runtime            FLEX-RUNTIME-NODE8                   
id                 12378kdl2                            
requestedAt        replaced_value
deployerEmail      davy.jones@mail.com                  
deployerName       Davy Jones                           
deploymentStatus   COMPLETED                            
deploymentVersion  1.4.3                                
deploymentRuntime  FLEX-RUNTIME-NODE10                  


`

exports['flex status by specifying credentials as options when valid and existent serviceId plus existent svcEnv should succeed (with missing runtime) 1'] = `
[debug] Checking for package updates
[debug] Logging in user: janeyDoe@mail.com
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 200
[debug] Request:  GET http://localhost:3234/v3/services/12378kdl2/environments
[debug] Response: GET http://localhost:3234/v3/services/12378kdl2/environments 200
[debug] Request:  GET http://localhost:3234/v3/services/12378kdl2/environments/1234567/status
[debug] Response: GET http://localhost:3234/v3/services/12378kdl2/environments/1234567/status 200
[debug] Request:  DELETE http://localhost:3234/session
[debug] Response: DELETE http://localhost:3234/session 204
[debug] Logged out current user.
key                value                                
-----------------  -------------------------------------
status             UPDATING                             
version            1.4.2                                
runtime            UNKNOWN                              
id                 12378kdl2                            
requestedAt        replaced_value
deployerEmail      davy.jones@mail.com                  
deployerName       Davy Jones                           
deploymentStatus   RUNNING                              
deploymentVersion  1.4.3                                
deploymentRuntime  FLEX-RUNTIME-NODE10                  


`

exports['flex status by specifying credentials as options when valid and existent serviceId plus non-existent svcEnv should fail 1'] = `
[debug] Checking for package updates
[debug] Logging in user: janeyDoe@mail.com
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 200
[debug] Request:  GET http://localhost:3234/v3/services/12378kdl2/environments
[debug] Response: GET http://localhost:3234/v3/services/12378kdl2/environments 200
[debug] Request:  DELETE http://localhost:3234/session
[debug] Response: DELETE http://localhost:3234/session 204
[debug] Logged out current user.
[error] NotFound: Could not find service environment with identifier '123-non-existent'.

`

exports['flex status by specifying credentials as options when valid and non-existent serviceId should fail 1'] = `
[debug] Checking for package updates
[debug] Logging in user: janeyDoe@mail.com
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 200
[debug] Request:  GET http://localhost:3234/v3/services/z793f26c8I_DONT_EXIST/environments
[debug] Response: GET http://localhost:3234/v3/services/z793f26c8I_DONT_EXIST/environments 404
[debug] Request:  DELETE http://localhost:3234/session
[debug] Response: DELETE http://localhost:3234/session 204
[debug] Logged out current user.
[error] ServiceNotFound: The specified service could not be found.

`

exports['flex status by specifying credentials as options when invalid and existent serviceId should fail 1'] = `
[debug] Checking for package updates
[debug] Logging in user: johnDoe@mail.com
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 401
[error] InvalidCredentials: Credentials are invalid. Please authenticate.

`

exports['flex status by specifying a profile existent serviceId and existent svc env ID should succeed and output default format 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToGetServiceStatus'
[debug] Project configuration file not found: 'projectSetupPath'.
[debug] Request:  GET http://localhost:3234/v3/services/12378kdl2/environments
[debug] Response: GET http://localhost:3234/v3/services/12378kdl2/environments 200
[debug] Request:  GET http://localhost:3234/v3/services/12378kdl2/environments/642dd1efe3d92e0180317487b29c6e88/status
[debug] Response: GET http://localhost:3234/v3/services/12378kdl2/environments/642dd1efe3d92e0180317487b29c6e88/status 200
key            value                                
-------------  -------------------------------------
status         ONLINE                               
version        1.4.2                                
id             12378kdl2                            
requestedAt    replaced_value
deployerEmail  davy.jones@mail.com                  
deployerName   Davy Jones                           


`
