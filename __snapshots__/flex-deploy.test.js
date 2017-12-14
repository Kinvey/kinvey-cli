exports['flex deploy when project setup is non-existent by not specifying profile nor credentials when one profile should use it and fail 1'] = `
kinvey flex deploy

Deploy the current project to the Kinvey FlexService Runtime

Options:
  --version                 Show version number                        [boolean]
  --email                   E-mail address of your Kinvey account       [string]
  --password                Password of your Kinvey account             [string]
  --host                    Kinvey dedicated instance hostname          [string]
  --profile                 Profile to use                              [string]
  --silent                  Do not output anything                     [boolean]
  --suppress-version-check  Do not check for package updates           [boolean]
  --verbose                 Output debug messages                      [boolean]
  -h, --help                Show help                                  [boolean]

This project is not configured. Use 'kinvey flex init' to get started.

`

exports['flex deploy when project setup exists is valid and user\'s project is invalid should fail 1'] = `
error:  InvalidProject: This project is not valid. Please implement the kinvey-flex-sdk node module.

`

exports['flex deploy when project setup exists is not valid and user\'s project is valid should fail 1'] = `
kinvey flex deploy

Deploy the current project to the Kinvey FlexService Runtime

Options:
  --version                 Show version number                        [boolean]
  --email                   E-mail address of your Kinvey account       [string]
  --password                Password of your Kinvey account             [string]
  --host                    Kinvey dedicated instance hostname          [string]
  --profile                 Profile to use                              [string]
  --silent                  Do not output anything                     [boolean]
  --suppress-version-check  Do not check for package updates           [boolean]
  --verbose                 Output debug messages                      [boolean]
  -h, --help                Show help                                  [boolean]

This project is not configured. Use 'kinvey flex init' to get started.

`
