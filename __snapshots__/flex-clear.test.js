exports['flex clear when project is not set should succeed and output JSON 1'] = `
[debug] Checking for package updates
[debug] Writing contents to file projectSetupPath
{
  "result": null
}

`

exports['flex clear when project is not set should succeed and output default format 1'] = `
[debug] Checking for package updates
[debug] Writing contents to file projectSetupPath
Project data cleared. Run kinvey flex init to get started.

`

exports['flex clear when project is set should succeed 1'] = `
[debug] Checking for package updates
[debug] Writing contents to file projectSetupPath
Project data cleared. Run kinvey flex init to get started.

`

exports['flex clear when project is set with too many args should fail 1'] = `
kinvey flex clear

Clear project settings

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

Too many non-option arguments: got 1, maximum of 0

`
