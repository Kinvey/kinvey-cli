exports['coll create without profile with credentials as options, existent app and env, and coll name should succeed 1'] = `
[debug] Checking for package updates
[debug] Logging in user: janeDoe@mail.com
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 200
[debug] Using application: TestApp
[debug] Request:  GET http://localhost:3234/v2/apps
[debug] Response: GET http://localhost:3234/v2/apps 200
[debug] Using environment: Development
[debug] Request:  GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e/environments
[debug] Response: GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e/environments 200
[debug] Request:  POST http://localhost:3234/v2/environments/kid_Sy4yRNV_M/collections
[debug] Response: POST http://localhost:3234/v2/environments/kid_Sy4yRNV_M/collections 200
[debug] Request:  DELETE http://localhost:3234/session
[debug] Response: DELETE http://localhost:3234/session 204
[debug] Logged out current user.
Created collection: filmsBackedByService

`

exports['coll create without profile with credentials as options, existent app and env, and no coll name should fail 1'] = `
kinvey coll create <name>

Create a collection

Positionals:
  name  Collection name                                               [required]

Options:
  --version                 Show version number                        [boolean]
  --email                   E-mail address of your Kinvey account       [string]
  --password                Password of your Kinvey account             [string]
  --2fa, --2Fa              Two-factor authentication token             [string]
  --instance-id             Instance ID                                 [string]
  --profile                 Profile to use                              [string]
  --output                  Output format             [string] [choices: "json"]
  --silent                  Do not output anything                     [boolean]
  --suppress-version-check  Do not check for package updates           [boolean]
  --verbose                 Output debug messages                      [boolean]
  --no-color                Disable colors                             [boolean]
  -h, --help                Show help                                  [boolean]
  --env                     Env ID/name                                 [string]
  --app                     App ID/name                                 [string]

Not enough non-option arguments: got 0, need at least 1

`

exports['coll create with profile when active app is set active env is set without env arg should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using environment: kid_Sy4yRNV_M
[debug] Request:  GET http://localhost:3234/v2/environments/kid_Sy4yRNV_M
[debug] Response: GET http://localhost:3234/v2/environments/kid_Sy4yRNV_M 200
[debug] Request:  POST http://localhost:3234/v2/environments/kid_Sy4yRNV_M/collections
[debug] Response: POST http://localhost:3234/v2/environments/kid_Sy4yRNV_M/collections 200
Created collection: filmsBackedByService

`

exports['coll create with profile when active app is set active env is set with non-existent env id should take precedence and fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: 885f5d307afd4168bebca1a64f815c1e
[debug] Using environment: kid_JjJJjg2cN
[debug] Request:  GET http://localhost:3234/v2/environments/kid_JjJJjg2cN
[debug] Response: GET http://localhost:3234/v2/environments/kid_JjJJjg2cN 404
[debug] Request:  GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e/environments
[debug] Response: GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e/environments 200
[error] NotFound: Could not find environment with identifier 'kid_JjJJjg2cN'.

`

exports['coll create with profile when active app is set active env is not set using existent env id should succeed and output default format 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: 885f5d307afd4168bebca1a64f815c1e
[debug] Using environment: kid_Sy4yRNV_M
[debug] Request:  GET http://localhost:3234/v2/environments/kid_Sy4yRNV_M
[debug] Response: GET http://localhost:3234/v2/environments/kid_Sy4yRNV_M 200
[debug] Request:  POST http://localhost:3234/v2/environments/kid_Sy4yRNV_M/collections
[debug] Response: POST http://localhost:3234/v2/environments/kid_Sy4yRNV_M/collections 200
Created collection: filmsBackedByService

`

exports['coll create with profile when active app is set active env is not set using existent env id should succeed and output JSON 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: 885f5d307afd4168bebca1a64f815c1e
[debug] Using environment: kid_Sy4yRNV_M
[debug] Request:  GET http://localhost:3234/v2/environments/kid_Sy4yRNV_M
[debug] Response: GET http://localhost:3234/v2/environments/kid_Sy4yRNV_M 200
[debug] Request:  POST http://localhost:3234/v2/environments/kid_Sy4yRNV_M/collections
[debug] Response: POST http://localhost:3234/v2/environments/kid_Sy4yRNV_M/collections 200
{
  "result": {
    "id": "filmsBackedByService"
  }
}

`

exports['coll create with profile when active app is set active env is not set using existent env name should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: 885f5d307afd4168bebca1a64f815c1e
[debug] Using environment: Development
[debug] Request:  GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e/environments
[debug] Response: GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e/environments 200
[debug] Request:  POST http://localhost:3234/v2/environments/kid_Sy4yRNV_M/collections
[debug] Response: POST http://localhost:3234/v2/environments/kid_Sy4yRNV_M/collections 200
Created collection: filmsBackedByService

`

exports['coll create with profile when active app is set active env is not set using existent env name and non-existent app name should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: noSuchApp
[debug] Request:  GET http://localhost:3234/v2/apps
[debug] Response: GET http://localhost:3234/v2/apps 200
[error] NotFound: Could not find application with identifier 'noSuchApp'.

`

exports['coll create with profile when active app is set active env is not set using non-existent env name should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: 885f5d307afd4168bebca1a64f815c1e
[debug] Using environment: noSuchName
[debug] Request:  GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e/environments
[debug] Response: GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e/environments 200
[error] NotFound: Could not find environment with identifier 'noSuchName'.

`

exports['coll create with profile when active app is set active env is not set using non-existent env id should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: 885f5d307afd4168bebca1a64f815c1e
[debug] Using environment: kid_JjJJjg2cN
[debug] Request:  GET http://localhost:3234/v2/environments/kid_JjJJjg2cN
[debug] Response: GET http://localhost:3234/v2/environments/kid_JjJJjg2cN 404
[debug] Request:  GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e/environments
[debug] Response: GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e/environments 200
[error] NotFound: Could not find environment with identifier 'kid_JjJJjg2cN'.

`

exports['coll create with profile when active app is not set using existent env name and existent app name should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: TestApp
[debug] Request:  GET http://localhost:3234/v2/apps
[debug] Response: GET http://localhost:3234/v2/apps 200
[debug] Using environment: Development
[debug] Request:  GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e/environments
[debug] Response: GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e/environments 200
[debug] Request:  POST http://localhost:3234/v2/environments/kid_Sy4yRNV_M/collections
[debug] Response: POST http://localhost:3234/v2/environments/kid_Sy4yRNV_M/collections 200
Created collection: filmsBackedByService

`

exports['coll create with profile when active app is not set using existent env name and existent app id should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: 885f5d307afd4168bebca1a64f815c1e
[debug] Request:  GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e 200
[debug] Using environment: Development
[debug] Request:  GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e/environments
[debug] Response: GET http://localhost:3234/v2/apps/885f5d307afd4168bebca1a64f815c1e/environments 200
[debug] Request:  POST http://localhost:3234/v2/environments/kid_Sy4yRNV_M/collections
[debug] Response: POST http://localhost:3234/v2/environments/kid_Sy4yRNV_M/collections 200
Created collection: filmsBackedByService

`

exports['coll create with profile when active app is not set using existent env id and no app should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
kinvey coll create <name>

Create a collection

Positionals:
  name  Collection name                                               [required]

Options:
  --version                 Show version number                        [boolean]
  --email                   E-mail address of your Kinvey account       [string]
  --password                Password of your Kinvey account             [string]
  --2fa, --2Fa              Two-factor authentication token             [string]
  --instance-id             Instance ID                                 [string]
  --profile                 Profile to use                              [string]
  --output                  Output format             [string] [choices: "json"]
  --silent                  Do not output anything                     [boolean]
  --suppress-version-check  Do not check for package updates           [boolean]
  --verbose                 Output debug messages                      [boolean]
  --no-color                Disable colors                             [boolean]
  -h, --help                Show help                                  [boolean]
  --env                     Env ID/name                                 [string]
  --app                     App ID/name                                 [string]

Application is required. Please set active app or use the --app option.

`

exports['coll create with profile when active app is not set without env and without app should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
kinvey coll create <name>

Create a collection

Positionals:
  name  Collection name                                               [required]

Options:
  --version                 Show version number                        [boolean]
  --email                   E-mail address of your Kinvey account       [string]
  --password                Password of your Kinvey account             [string]
  --2fa, --2Fa              Two-factor authentication token             [string]
  --instance-id             Instance ID                                 [string]
  --profile                 Profile to use                              [string]
  --output                  Output format             [string] [choices: "json"]
  --silent                  Do not output anything                     [boolean]
  --suppress-version-check  Do not check for package updates           [boolean]
  --verbose                 Output debug messages                      [boolean]
  --no-color                Disable colors                             [boolean]
  -h, --help                Show help                                  [boolean]
  --env                     Env ID/name                                 [string]
  --app                     App ID/name                                 [string]

Application is required. Please set active app or use the --app option.

`
