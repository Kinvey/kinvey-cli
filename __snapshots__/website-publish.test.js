exports['website publish using active profile with existent site id should succeed and output JSON 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Request:  GET http://localhost:3234/v4/sites/9caf90c31c4449f195a1a40acc979cf0
[debug] Response: GET http://localhost:3234/v4/sites/9caf90c31c4449f195a1a40acc979cf0 200
[debug] Request:  GET http://localhost:3234/v4/sites/9caf90c31c4449f195a1a40acc979cf0/environments
[debug] Response: GET http://localhost:3234/v4/sites/9caf90c31c4449f195a1a40acc979cf0/environments 200
[debug] Request:  POST http://localhost:3234/v4/sites/9caf90c31c4449f195a1a40acc979cf0/publish
[debug] Response: POST http://localhost:3234/v4/sites/9caf90c31c4449f195a1a40acc979cf0/publish 200
{
  "result": {
    "id": "9caf90c31c4449f195a1a40acc979cf0",
    "publicUrl": "https://a0.dev.kinvey.rocks"
  }
}

`

exports['website publish using active profile with existent site name should succeed and output default format 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Request:  GET http://localhost:3234/v4/sites
[debug] Response: GET http://localhost:3234/v4/sites 200
[debug] Request:  GET http://localhost:3234/v4/sites/9caf90c31c4449f195a1a40acc979cf0/environments
[debug] Response: GET http://localhost:3234/v4/sites/9caf90c31c4449f195a1a40acc979cf0/environments 200
[debug] Request:  POST http://localhost:3234/v4/sites/9caf90c31c4449f195a1a40acc979cf0/publish
[debug] Response: POST http://localhost:3234/v4/sites/9caf90c31c4449f195a1a40acc979cf0/publish 200
Publish initiated. Public URL: https://a0.dev.kinvey.rocks

`

exports['website publish using active profile with non-existent site name should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Request:  GET http://localhost:3234/v4/sites
[debug] Response: GET http://localhost:3234/v4/sites 200
[error] NotFound: Could not find website with identifier 'nope'.

`

exports['website publish using active profile without domainName but with site identifier should fail 1'] = `
kinvey website publish

Publish your website

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
  --domainName                              Domain name      [string] [required]

Missing required argument: domainName

`

exports['website publish using active profile without site identifier but with domainName should fail 1'] = `
kinvey website publish

Publish your website

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
  --domainName                              Domain name      [string] [required]

Missing required argument: website

`

exports['website publish using one-time session with existent site identifier should output default format 1'] = `
[debug] Checking for package updates
[debug] Logging in user: janeyDoe@mail.com
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 200
[debug] Request:  GET http://localhost:3234/v4/sites
[debug] Response: GET http://localhost:3234/v4/sites 200
[debug] Request:  GET http://localhost:3234/v4/sites/9caf90c31c4449f195a1a40acc979cf0/environments
[debug] Response: GET http://localhost:3234/v4/sites/9caf90c31c4449f195a1a40acc979cf0/environments 200
[debug] Request:  POST http://localhost:3234/v4/sites/9caf90c31c4449f195a1a40acc979cf0/publish
[debug] Response: POST http://localhost:3234/v4/sites/9caf90c31c4449f195a1a40acc979cf0/publish 200
[debug] Request:  DELETE http://localhost:3234/session
[debug] Response: DELETE http://localhost:3234/session 204
[debug] Logged out current user.
Publish initiated. Public URL: https://a0.dev.kinvey.rocks

`

exports['website publish without auth should fail 1'] = `
[debug] Checking for package updates
kinvey website publish

Publish your website

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
  --domainName                              Domain name      [string] [required]

You must be authenticated.

`
