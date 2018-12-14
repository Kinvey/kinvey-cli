exports['appenv clone with profile when active app is not set using existent target env id and existent env name and no app should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
kinvey appenv clone <target>

Clone a specified environment or the active one into the target one

Positionals:
  target  Target Env ID/name                                 [string] [required]

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
  --env                                     Env ID/name                 [string]
  --app                                     App ID/name                 [string]

Application is required. Please set active app or use the --app option.

`

exports['appenv clone with profile when active app is not set using existent target env id name and existent env name and existent app name should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: TestApp
[debug] Request:  GET http://localhost:3234/v3/apps
[debug] Response: GET http://localhost:3234/v3/apps 200
[debug] Using application: TestApp
[debug] Request:  GET http://localhost:3234/v3/apps
[debug] Response: GET http://localhost:3234/v3/apps 200
[debug] Using environment: Development
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments 200
[debug] Using environment: kid_Ty4yRNV_O
[debug] Request:  GET http://localhost:3234/v3/environments/kid_Ty4yRNV_O
[debug] Response: GET http://localhost:3234/v3/environments/kid_Ty4yRNV_O 200
[debug] Request:  POST http://localhost:3234/v3/jobs
[debug] Response: POST http://localhost:3234/v3/jobs 200
Clone initiated. Job: idOfJobThatIsCloningTheEnvironment

`

exports['appenv clone with profile when active app is not set using existent target env name and existent env id and existent app name should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: TestApp
[debug] Request:  GET http://localhost:3234/v3/apps
[debug] Response: GET http://localhost:3234/v3/apps 200
[debug] Using application: TestApp
[debug] Request:  GET http://localhost:3234/v3/apps
[debug] Response: GET http://localhost:3234/v3/apps 200
[debug] Using environment: kid_Sy4yRNV_M
[debug] Request:  GET http://localhost:3234/v3/environments/kid_Sy4yRNV_M
[debug] Response: GET http://localhost:3234/v3/environments/kid_Sy4yRNV_M 200
[debug] Using environment: Staging
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments 200
[debug] Request:  POST http://localhost:3234/v3/jobs
[debug] Response: POST http://localhost:3234/v3/jobs 200
Clone initiated. Job: idOfJobThatIsCloningTheEnvironment

`

exports['appenv clone with profile when active app is not set using existent target env name and existent env name and existent app id should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: 885f5d307afd4168bebca1a64f815c1e
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e 200
[debug] Using application: 885f5d307afd4168bebca1a64f815c1e
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e 200
[debug] Using environment: Development
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments 200
[debug] Using environment: Staging
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments 200
[debug] Request:  POST http://localhost:3234/v3/jobs
[debug] Response: POST http://localhost:3234/v3/jobs 200
Clone initiated. Job: idOfJobThatIsCloningTheEnvironment

`

exports['appenv clone with profile when active app is not set using existent target env name and existent env name and existent app name should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: TestApp
[debug] Request:  GET http://localhost:3234/v3/apps
[debug] Response: GET http://localhost:3234/v3/apps 200
[debug] Using application: TestApp
[debug] Request:  GET http://localhost:3234/v3/apps
[debug] Response: GET http://localhost:3234/v3/apps 200
[debug] Using environment: Development
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments 200
[debug] Using environment: Staging
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments 200
[debug] Request:  POST http://localhost:3234/v3/jobs
[debug] Response: POST http://localhost:3234/v3/jobs 200
Clone initiated. Job: idOfJobThatIsCloningTheEnvironment

`

exports['appenv clone with profile when active app is not set without target env and without env and without app should fail 1'] = `
kinvey appenv clone <target>

Clone a specified environment or the active one into the target one

Positionals:
  target  Target Env ID/name                                 [string] [required]

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
  --env                                     Env ID/name                 [string]
  --app                                     App ID/name                 [string]

Not enough non-option arguments: got 0, need at least 1

`

exports['appenv clone with profile when active app is set active env is not set using existant target env and existent env name and non-existent app name should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: noSuchApp
[debug] Request:  GET http://localhost:3234/v3/apps
[debug] Response: GET http://localhost:3234/v3/apps 200
[error] NotFound: Could not find application with identifier 'noSuchApp'.

`

exports['appenv clone with profile when active app is set active env is not set using existant target env and existent env name should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: 885f5d307afd4168bebca1a64f815c1e
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e 200
[debug] Using application: 885f5d307afd4168bebca1a64f815c1e
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e 200
[debug] Using environment: Development
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments 200
[debug] Using environment: Staging
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments 200
[debug] Request:  POST http://localhost:3234/v3/jobs
[debug] Response: POST http://localhost:3234/v3/jobs 200
Clone initiated. Job: idOfJobThatIsCloningTheEnvironment

`

exports['appenv clone with profile when active app is set active env is not set using non-existent env id should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: 885f5d307afd4168bebca1a64f815c1e
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e 200
[debug] Using application: 885f5d307afd4168bebca1a64f815c1e
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e 200
[debug] Using environment: kid_JjJJjg2cN
[debug] Request:  GET http://localhost:3234/v3/environments/kid_JjJJjg2cN
[debug] Response: GET http://localhost:3234/v3/environments/kid_JjJJjg2cN 404
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments 200
[error] NotFound: Could not find environment with identifier 'kid_JjJJjg2cN'.

`

exports['appenv clone with profile when active app is set active env is not set using non-existent env name should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: 885f5d307afd4168bebca1a64f815c1e
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e 200
[debug] Using application: 885f5d307afd4168bebca1a64f815c1e
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e 200
[debug] Using environment: noSuchName
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments 200
[error] NotFound: Could not find environment with identifier 'noSuchName'.

`

exports['appenv clone with profile when active app is set active env is set using existent target env with non-existent env id should take precedence and fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: 885f5d307afd4168bebca1a64f815c1e
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e 200
[debug] Using application: 885f5d307afd4168bebca1a64f815c1e
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e 200
[debug] Using environment: kid_JjJJjg2cN
[debug] Request:  GET http://localhost:3234/v3/environments/kid_JjJJjg2cN
[debug] Response: GET http://localhost:3234/v3/environments/kid_JjJJjg2cN 404
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments 200
[error] NotFound: Could not find environment with identifier 'kid_JjJJjg2cN'.

`

exports['appenv clone with profile when active app is set active env is set using existent target env without env arg should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: 885f5d307afd4168bebca1a64f815c1e
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e 200
[debug] Using environment: kid_Sy4yRNV_M
[debug] Request:  GET http://localhost:3234/v3/environments/kid_Sy4yRNV_M
[debug] Response: GET http://localhost:3234/v3/environments/kid_Sy4yRNV_M 200
[debug] Using environment: Staging
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments 200
[debug] Request:  POST http://localhost:3234/v3/jobs
[debug] Response: POST http://localhost:3234/v3/jobs 200
Clone initiated. Job: idOfJobThatIsCloningTheEnvironment

`

exports['appenv clone with profile when active app is set active env is set using non-existent target env should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Using application: 885f5d307afd4168bebca1a64f815c1e
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e 200
[debug] Using environment: kid_Sy4yRNV_M
[debug] Request:  GET http://localhost:3234/v3/environments/kid_Sy4yRNV_M
[debug] Response: GET http://localhost:3234/v3/environments/kid_Sy4yRNV_M 200
[debug] Using environment: noSuchName
[debug] Request:  GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments
[debug] Response: GET http://localhost:3234/v3/apps/885f5d307afd4168bebca1a64f815c1e/environments 200
[error] NotFound: Could not find environment with identifier 'noSuchName'.

`

exports['appenv clone without profile should fail 1'] = `
kinvey appenv clone <target>

Clone a specified environment or the active one into the target one

Positionals:
  target  Target Env ID/name                                 [string] [required]

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
  --env                                     Env ID/name                 [string]
  --app                                     App ID/name                 [string]

Not enough non-option arguments: got 0, need at least 1

`

exports['appenv clone without profile using existent target env name and existent env name and existent app name should fail 1'] = `
[debug] Checking for package updates
kinvey appenv clone <target>

Clone a specified environment or the active one into the target one

Positionals:
  target  Target Env ID/name                                 [string] [required]

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
  --env                                     Env ID/name                 [string]
  --app                                     App ID/name                 [string]

You must be authenticated.

`
