exports['flex deploy when project setup exists is not valid and user\'s project is valid should fail 1'] = `
kinvey flex deploy

Deploy the current project to the Kinvey FlexService Runtime

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
  --service                                 Service ID                  [string]
  --env                                     Service environment name/ID [string]
  --replace-vars, --replaceVars             Environment variables (replaces all
                                            already existing). Specify either as
                                            comma-separated list of key-value
                                            pairs (key1=value1,key2=value2) or
                                            in JSON format.
  --set-vars, --setVars                     Environment variables to set.
                                            Specify either as comma-separated
                                            list of key-value pairs
                                            (key1=value1,key2=value2) or in JSON
                                            format.
  --runtime                                 Runtime environment
                                  [string] [choices: "node6", "node8", "node10"]

This project is not configured. Use 'kinvey flex init' to get started. Alternatively, use options: service.

`

exports['flex deploy when project setup exists is valid and user\'s project is invalid should fail 1'] = `
[error] InvalidProject: This project is not valid. Please implement the kinvey-flex-sdk node module.

`

exports['flex deploy when project setup is non-existent by not specifying profile nor credentials when one profile should use it and fail 1'] = `
kinvey flex deploy

Deploy the current project to the Kinvey FlexService Runtime

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
  --service                                 Service ID                  [string]
  --env                                     Service environment name/ID [string]
  --replace-vars, --replaceVars             Environment variables (replaces all
                                            already existing). Specify either as
                                            comma-separated list of key-value
                                            pairs (key1=value1,key2=value2) or
                                            in JSON format.
  --set-vars, --setVars                     Environment variables to set.
                                            Specify either as comma-separated
                                            list of key-value pairs
                                            (key1=value1,key2=value2) or in JSON
                                            format.
  --runtime                                 Runtime environment
                                  [string] [choices: "node6", "node8", "node10"]

This project is not configured. Use 'kinvey flex init' to get started. Alternatively, use options: service.

`
