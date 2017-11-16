exports['profile delete by existent name when there are several should delete only one 1'] = `
debug:  Checking for package updates
debug:  Writing JSON to file globalSetupPath
debug:  Writing contents to file globalSetupPath
info:  Successfully deleted profile with name 'testProfileDelete'.

`

exports['profile delete by existent name when there is only one should succeed 1'] = `
debug:  Checking for package updates
debug:  Writing JSON to file globalSetupPath
debug:  Writing contents to file globalSetupPath
info:  Successfully deleted profile with name 'testProfileDelete'.

`

exports['profile delete by non-existent name when there is one should not alter it 1'] = `
debug:  Checking for package updates
info:  Could not find profile with name 'nonExistentProfileName'.

`

exports['profile delete by non-existent name when none should not throw 1'] = `
debug:  Checking for package updates
info:  Could not find profile with name 'nonExistentProfileName'.

`

exports['profile delete without a name should fail 1'] = `
bin\cli.js profile delete <name>

Options:
  --version                 Show version number                        [boolean]
  --email                   E-mail address of your Kinvey account       [string]
  --password                Password of your Kinvey account             [string]
  --host                    Host of the Kinvey service                  [string]
  --profile                 Profile to use                              [string]
  --silent                  Do not output anything                     [boolean]
  --suppress-version-check  Do not check for package updates           [boolean]
  --verbose                 Output debug messages                      [boolean]
  -h, --help                Show help                                  [boolean]

Not enough non-option arguments: got 0, need at least 1

`

exports['profile delete by existent name when it is the active profile should succeed and clear active 1'] = `
debug:  Checking for package updates
debug:  Writing JSON to file globalSetupPath
debug:  Writing contents to file globalSetupPath
info:  Successfully deleted profile with name 'activeAndMustBeDeleted'.

`
