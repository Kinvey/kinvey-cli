exports['flex list by not specifying profile nor credentials when several profiles should fail 1'] = `
kinvey flex list

List Internal Flex Services for an app or org

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
  --domain                                  Specify domain: 'app' or 'org'
                                                [string] [choices: "app", "org"]
  --id                                      ID of app or org            [string]

You must be authenticated.

`

exports['flex list by specifying a profile and invalid domain with valid id should fail 1'] = `
kinvey flex list

List Internal Flex Services for an app or org

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
  --domain                                  Specify domain: 'app' or 'org'
                                                [string] [choices: "app", "org"]
  --id                                      ID of app or org            [string]

Invalid values:
  Argument: domain, Given: "invalidDomain", Choices: "app", "org"

`

exports['flex list by specifying a profile and valid options (app and id) should succeed  and output default format 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToGetServices'
[debug] Project configuration file not found: 'projectSetupPath'.
[debug] Using application: 885f5d307afd4168bebca1a64f815c1e
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e 200
[debug] Request:  GET http://localhost:3234/v3/services
[debug] Response: GET http://localhost:3234/v3/services 200
Count: 3

id                                name                    
--------------------------------  ------------------------
12378kdl2                         TestKinveyDatalink      
334d6ab3df5e4af1a13ec011c12d0208  TestKinveyService       
12389kd89                         TestSecondKinveyDatalink



`

exports['flex list by specifying a profile and valid options (org and id) should succeed and output JSON 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToGetServices'
[debug] Project configuration file not found: 'projectSetupPath'.
[debug] Using organization: f71b0d5e60684b48b8265e7fa50302b9
[debug] Request:  GET http://localhost:3234/v3/organizations/f71b0d5e60684b48b8265e7fa50302b9
[debug] Response: GET http://localhost:3234/v3/organizations/f71b0d5e60684b48b8265e7fa50302b9 200
[debug] Request:  GET http://localhost:3234/v3/services
[debug] Response: GET http://localhost:3234/v3/services 200
{
  "result": [
    {
      "id": "12378kdl2",
      "name": "TestKinveyDatalink"
    },
    {
      "id": "334d6ab3df5e4af1a13ec011c12d0208",
      "name": "TestKinveyService"
    },
    {
      "id": "12389kd89",
      "name": "TestSecondKinveyDatalink"
    }
  ]
}

`

exports['flex list by specifying a profile when invalid project is set with valid options should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToGetServices'
[debug] Using application: 885f5d307afd4168bebca1a64f815c1e
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e 200
[debug] Request:  GET http://localhost:3234/v3/services
[debug] Response: GET http://localhost:3234/v3/services 200
Count: 3

id                                name                    
--------------------------------  ------------------------
12378kdl2                         TestKinveyDatalink      
334d6ab3df5e4af1a13ec011c12d0208  TestKinveyService       
12389kd89                         TestSecondKinveyDatalink



`

exports['flex list by specifying a profile when valid project is set without options should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToGetServices'
[debug] Using application: 885f5d307afd4168bebca1a64f815c1e
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e 200
[debug] Request:  GET http://localhost:3234/v3/services
[debug] Response: GET http://localhost:3234/v3/services 200
Count: 3

id                                name                    
--------------------------------  ------------------------
12378kdl2                         TestKinveyDatalink      
334d6ab3df5e4af1a13ec011c12d0208  TestKinveyService       
12389kd89                         TestSecondKinveyDatalink



`

exports['flex list by specifying credentials as options when invalid and valid options should fail 1'] = `
[debug] Checking for package updates
[debug] Logging in user: johnDoe@mail.com
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 401
[error] InvalidCredentials: Invalid e-mail and/or password.

`

exports['flex list by specifying credentials as options when valid and non-existent id as option should fail 1'] = `
[debug] Checking for package updates
[debug] Logging in user: janeyDoe@mail.com
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 200
[debug] Using application: 123I_DONT_EXIST
[debug] Request:  GET http://localhost:3234/v3/apps
[debug] Response: GET http://localhost:3234/v3/apps 200
[debug] Request:  DELETE http://localhost:3234/session
[debug] Response: DELETE http://localhost:3234/session 204
[debug] Logged out current user.
[error] NotFound: Could not find application with identifier '123I_DONT_EXIST'.

`

exports['flex list by specifying credentials as options when valid and valid options should succeed 1'] = `
[debug] Checking for package updates
[debug] Logging in user: janeyDoe@mail.com
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 200
[debug] Using application: 885f5d307afd4168bebca1a64f815c1e
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e 200
[debug] Request:  GET http://localhost:3234/v3/services
[debug] Response: GET http://localhost:3234/v3/services 200
[debug] Request:  DELETE http://localhost:3234/session
[debug] Response: DELETE http://localhost:3234/session 204
[debug] Logged out current user.
Count: 3

id                                name                    
--------------------------------  ------------------------
12378kdl2                         TestKinveyDatalink      
334d6ab3df5e4af1a13ec011c12d0208  TestKinveyService       
12389kd89                         TestSecondKinveyDatalink



`
