exports['flex deploy when project setup is non-existent by not specifying profile nor credentials when one profile should use it and fail 1'] = `
kinvey flex deploy [serviceId]

Deploy the current project to the Kinvey FlexService Runtime

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

This project is not configured. Use 'kinvey flex init' to get started. Alternatively, use positional arguments: serviceId.

`

exports['flex deploy when project setup exists is valid and user\'s project is invalid should fail 1'] = `
[error] InvalidProject: This project is not valid. Please implement the kinvey-flex-sdk node module.

`

exports['flex deploy when project setup exists is not valid and user\'s project is valid should fail 1'] = `
kinvey flex deploy [serviceId]

Deploy the current project to the Kinvey FlexService Runtime

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

This project is not configured. Use 'kinvey flex init' to get started. Alternatively, use positional arguments: serviceId.

`
