exports['flex list by specifying a profile and valid options (app and id) should succeed  and output default format 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToGetServices'
[debug] Request:  GET http://localhost:3234/v2/apps/123/data-links
[debug] Response: GET http://localhost:3234/v2/apps/123/data-links 200
Count: 1

id         name              
---------  ------------------
12378kdl2  TestKinveyDatalink



`

exports['flex list by specifying a profile and valid options (org and id) should succeed and output JSON 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToGetServices'
[debug] Request:  GET http://localhost:3234/v2/organizations/123/data-links
[debug] Response: GET http://localhost:3234/v2/organizations/123/data-links 200
{
  "result": [
    {
      "id": "12378kdl2",
      "name": "TestKinveyDatalink"
    }
  ]
}

`

exports['flex list by specifying a profile and invalid domain with valid id should fail 1'] = `
kinvey flex list

List Internal Flex Services for an app or org

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
  --domain                  Specify domain: 'app' or 'org'
                                                [string] [choices: "app", "org"]
  --id                      ID of app or org                            [string]

Invalid values:
  Argument: domain, Given: "invalidDomain", Choices: "app", "org"

`

exports['flex list by specifying a profile when valid project is set without options should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToGetServices'
[debug] Request:  GET http://localhost:3234/v2/apps/123/data-links
[debug] Response: GET http://localhost:3234/v2/apps/123/data-links 200
Count: 1

id         name              
---------  ------------------
12378kdl2  TestKinveyDatalink



`

exports['flex list by specifying a profile when invalid project is set with valid options should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToGetServices'
[debug] Request:  GET http://localhost:3234/v2/apps/123/data-links
[debug] Response: GET http://localhost:3234/v2/apps/123/data-links 200
Count: 1

id         name              
---------  ------------------
12378kdl2  TestKinveyDatalink



`

exports['flex list by not specifying profile nor credentials when several profiles should fail 1'] = `
kinvey flex list

List Internal Flex Services for an app or org

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
  --domain                  Specify domain: 'app' or 'org'
                                                [string] [choices: "app", "org"]
  --id                      ID of app or org                            [string]

You must be authenticated.

`

exports['flex list by specifying credentials as options when valid and valid options should succeed 1'] = `
[debug] Checking for package updates
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 200
[debug] Request:  GET http://localhost:3234/v2/apps/123/data-links
[debug] Response: GET http://localhost:3234/v2/apps/123/data-links 200
[debug] Request:  DELETE http://localhost:3234/session
[debug] Response: DELETE http://localhost:3234/session 204
[debug] Logged out current user.
Count: 1

id         name              
---------  ------------------
12378kdl2  TestKinveyDatalink



`

exports['flex list by specifying credentials as options when valid and non-existent id as option should fail 1'] = `
[debug] Checking for package updates
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 200
[debug] Request:  GET http://localhost:3234/v2/apps/123I_DONT_EXIST/data-links
[debug] Response: GET http://localhost:3234/v2/apps/123I_DONT_EXIST/data-links 404
[debug] Request:  DELETE http://localhost:3234/session
[debug] Response: DELETE http://localhost:3234/session 204
[debug] Logged out current user.
[error] GeneralError: 

`

exports['flex list by specifying credentials as options when invalid and valid options should fail 1'] = `
[debug] Checking for package updates
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 401
[error] InvalidCredentials: Credentials are invalid. Please authenticate.

`
