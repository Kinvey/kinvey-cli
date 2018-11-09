exports['appenv use with profile when active app is not set using existent env id and no app should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
kinvey appenv use <env>

Set the active environment

Positionals:
  env  Env ID/name                                           [string] [required]

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
  --app                                     App ID/name                 [string]

Application is required. Please set active app or use the --app option.

`

exports['appenv use with profile when active app is not set using existent env name and existent app id should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: 885f5d307afd4168bebca1a64f815c1e
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e 200
[debug] Using environment: Development
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments 200
[debug] Writing contents to file globalSetupPath
Active environment: kid_Sy4yRNV_M

`

exports['appenv use with profile when active app is not set using existent env name and existent app name should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: TestApp
[debug] Request:  GET http://localhost:3234/v3/apps
[debug] Response: GET http://localhost:3234/v3/apps 200
[debug] Using environment: Development
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments 200
[debug] Writing contents to file globalSetupPath
Active environment: kid_Sy4yRNV_M

`

exports['appenv use with profile when active app is not set without env and without app should fail 1'] = `
kinvey appenv use <env>

Set the active environment

Positionals:
  env  Env ID/name                                           [string] [required]

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
  --app                                     App ID/name                 [string]

Not enough non-option arguments: got 0, need at least 1

`

exports['appenv use with profile when active app is set using existent env id should succeed and output JSON 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: 885f5d307afd4168bebca1a64f815c1e
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e 200
[debug] Using environment: kid_Sy4yRNV_M
[debug] Request:  GET http://localhost:3234/v3/environments/kid_Sy4yRNV_M
[debug] Response: GET http://localhost:3234/v3/environments/kid_Sy4yRNV_M 200
[debug] Writing contents to file globalSetupPath
{
  "result": {
    "id": "kid_Sy4yRNV_M"
  }
}

`

exports['appenv use with profile when active app is set using existent env id should succeed and output default format 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: 885f5d307afd4168bebca1a64f815c1e
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e 200
[debug] Using environment: kid_Sy4yRNV_M
[debug] Request:  GET http://localhost:3234/v3/environments/kid_Sy4yRNV_M
[debug] Response: GET http://localhost:3234/v3/environments/kid_Sy4yRNV_M 200
[debug] Writing contents to file globalSetupPath
Active environment: kid_Sy4yRNV_M

`

exports['appenv use with profile when active app is set using existent env name and non-existent app name should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: noSuchApp
[debug] Request:  GET http://localhost:3234/v3/apps
[debug] Response: GET http://localhost:3234/v3/apps 200
[error] NotFound: Could not find application with identifier 'noSuchApp'.

`

exports['appenv use with profile when active app is set using existent env name should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: 885f5d307afd4168bebca1a64f815c1e
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e 200
[debug] Using environment: Development
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments 200
[debug] Writing contents to file globalSetupPath
Active environment: kid_Sy4yRNV_M

`

exports['appenv use with profile when active app is set using non-existent env id should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: 885f5d307afd4168bebca1a64f815c1e
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e 200
[debug] Using environment: f1a003439ed940608a1c82895cc0ef1e
[debug] Request:  GET http://localhost:3234/v3/environments/f1a003439ed940608a1c82895cc0ef1e
[debug] Response: GET http://localhost:3234/v3/environments/f1a003439ed940608a1c82895cc0ef1e 404
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments 200
[error] NotFound: Could not find environment with identifier 'f1a003439ed940608a1c82895cc0ef1e'.

`

exports['appenv use with profile when active app is set using non-existent env name should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: 885f5d307afd4168bebca1a64f815c1e
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e 200
[debug] Using environment: noSuchName
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments 200
[error] NotFound: Could not find environment with identifier 'noSuchName'.

`

exports['appenv use without profile with credentials as options should fail 1'] = `
[debug] Checking for package updates
[error] ProfileRequired: Profile is required. Please set active profile or use the --profile option.

`
