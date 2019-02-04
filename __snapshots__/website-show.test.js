exports['website show using active profile with existent site ID should succeed and output default format 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Request:  GET http://localhost:3234/v3/sites
[debug] Response: GET http://localhost:3234/v3/sites 200
[debug] Request:  GET http://localhost:3234/v3/sites/9caf90c31c4449f195a1a40acc979cf0/environments
[debug] Response: GET http://localhost:3234/v3/sites/9caf90c31c4449f195a1a40acc979cf0/environments 200
key             value                                                                                                    
--------------  ---------------------------------------------------------------------------------------------------------
name            a0                                                                                                       
id              9caf90c31c4449f195a1a40acc979cf0                                                                         
cdnUrl          https://d5su5ekfsbq8c.cloudfront.net                                                                     
internalUrl     http://kinvey-sites-development-kinveyus1.s3-website-us-east-1.amazonaws.com/fgdfgghjhjrtwetczxc34gdsfg54
lastDeployedAt  2018-11-26T11:49:46.096Z                                                                                 
organizationId  Not set                                                                                                  


`

exports['website show using active profile with existent site name should succeed and output JSON 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Request:  GET http://localhost:3234/v3/sites
[debug] Response: GET http://localhost:3234/v3/sites 200
[debug] Request:  GET http://localhost:3234/v3/sites/9caf90c31c4449f195a1a40acc979cf0/environments
[debug] Response: GET http://localhost:3234/v3/sites/9caf90c31c4449f195a1a40acc979cf0/environments 200
{
  "result": {
    "name": "a0",
    "id": "9caf90c31c4449f195a1a40acc979cf0",
    "cdnUrl": "https://d5su5ekfsbq8c.cloudfront.net",
    "internalUrl": "http://kinvey-sites-development-kinveyus1.s3-website-us-east-1.amazonaws.com/fgdfgghjhjrtwetczxc34gdsfg54",
    "lastDeployedAt": "2018-11-26T11:49:46.096Z",
    "organizationId": "Not set"
  }
}

`

exports['website show using active profile with existent site name should succeed and output default format 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Request:  GET http://localhost:3234/v3/sites
[debug] Response: GET http://localhost:3234/v3/sites 200
[debug] Request:  GET http://localhost:3234/v3/sites/9caf90c31c4449f195a1a40acc979cf0/environments
[debug] Response: GET http://localhost:3234/v3/sites/9caf90c31c4449f195a1a40acc979cf0/environments 200
key             value                                                                                                    
--------------  ---------------------------------------------------------------------------------------------------------
name            a0                                                                                                       
id              9caf90c31c4449f195a1a40acc979cf0                                                                         
cdnUrl          https://d5su5ekfsbq8c.cloudfront.net                                                                     
internalUrl     http://kinvey-sites-development-kinveyus1.s3-website-us-east-1.amazonaws.com/fgdfgghjhjrtwetczxc34gdsfg54
lastDeployedAt  2018-11-26T11:49:46.096Z                                                                                 
organizationId  Not set                                                                                                  


`

exports['website show using active profile with non-existent site name should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Request:  GET http://localhost:3234/v3/sites
[debug] Response: GET http://localhost:3234/v3/sites 200
[error] NotFound: Could not find website with identifier 'nope'.

`

exports['website show using active profile without site identifier should fail 1'] = `
kinvey website show

Show detailed info for the specified website

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
  --website                                 Website ID/name  [string] [required]

Missing required argument: website

`

exports['website show using one-time session with existent site identifier should output default format 1'] = `
[debug] Checking for package updates
[debug] Logging in user: janeyDoe@mail.com
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 200
[debug] Request:  GET http://localhost:3234/v3/sites
[debug] Response: GET http://localhost:3234/v3/sites 200
[debug] Request:  GET http://localhost:3234/v3/sites/9caf90c31c4449f195a1a40acc979cf0/environments
[debug] Response: GET http://localhost:3234/v3/sites/9caf90c31c4449f195a1a40acc979cf0/environments 200
[debug] Request:  DELETE http://localhost:3234/session
[debug] Response: DELETE http://localhost:3234/session 204
[debug] Logged out current user.
key             value                                                                                                    
--------------  ---------------------------------------------------------------------------------------------------------
name            a0                                                                                                       
id              9caf90c31c4449f195a1a40acc979cf0                                                                         
cdnUrl          https://d5su5ekfsbq8c.cloudfront.net                                                                     
internalUrl     http://kinvey-sites-development-kinveyus1.s3-website-us-east-1.amazonaws.com/fgdfgghjhjrtwetczxc34gdsfg54
lastDeployedAt  2018-11-26T11:49:46.096Z                                                                                 
organizationId  Not set                                                                                                  


`

exports['website show without auth should fail 1'] = `
[debug] Checking for package updates
kinvey website show

Show detailed info for the specified website

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
  --website                                 Website ID/name  [string] [required]

You must be authenticated.

`
