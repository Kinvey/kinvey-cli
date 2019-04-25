exports['website list using active profile when there are no sites should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Request:  GET http://localhost:3234/v3/sites
[debug] Response: GET http://localhost:3234/v3/sites 200
Count: 0






`

exports['website list using active profile when there are sites should output JSON 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Request:  GET http://localhost:3234/v3/sites
[debug] Response: GET http://localhost:3234/v3/sites 200
{
  "result": [
    {
      "id": "9caf90c31c4449f195a1a40acc979cf0",
      "name": "a0"
    },
    {
      "id": "b85fe52ca1434d148b5c5f8199fceb9e",
      "name": "a1"
    },
    {
      "id": "0205f37e08d545cb9c88ad48b4397acc",
      "name": "b0"
    }
  ]
}

`

exports['website list using active profile when there are sites should output default format 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Request:  GET http://localhost:3234/v3/sites
[debug] Response: GET http://localhost:3234/v3/sites 200
Count: 3

id                                name
--------------------------------  ----
9caf90c31c4449f195a1a40acc979cf0  a0  
b85fe52ca1434d148b5c5f8199fceb9e  a1  
0205f37e08d545cb9c88ad48b4397acc  b0  



`

exports['website list using one-time session when there are sites should output default format 1'] = `
[debug] Checking for package updates
[debug] Logging in user: janeyDoe@mail.com
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 200
[debug] Request:  GET http://localhost:3234/v3/sites
[debug] Response: GET http://localhost:3234/v3/sites 200
[debug] Request:  DELETE http://localhost:3234/session
[debug] Response: DELETE http://localhost:3234/session 204
[debug] Logged out current user.
Count: 3

id                                name
--------------------------------  ----
9caf90c31c4449f195a1a40acc979cf0  a0  
b85fe52ca1434d148b5c5f8199fceb9e  a1  
0205f37e08d545cb9c88ad48b4397acc  b0  



`

exports['website list without auth should fail 1'] = `
[debug] Checking for package updates
kinvey website list

List websites

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

You must be authenticated.

`
