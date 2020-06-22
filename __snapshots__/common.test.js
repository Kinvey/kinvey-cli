exports['common flags and options with unsupported hyphenated flag should fail 1'] = `
kinvey profile show [name]

View detailed info for a profile. If no profile is specified, the active profile
is used.

Positionals:
  name  Profile name

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

Unknown argument: no-prompt

`

exports['common flags and options with unsupported hyphenated option should fail 1'] = `
kinvey profile show [name]

View detailed info for a profile. If no profile is specified, the active profile
is used.

Positionals:
  name  Profile name

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

Unknown argument: test-option

`

exports['common incomplete commands namespace (app) only should show help 1'] = `
kinvey app

Manage applications. Run 'kinvey app -h' for details.

Commands:
  kinvey app create <name>  Create an application
  kinvey app apply          Apply an application configuration file
  kinvey app list           List applications
  kinvey app show           Show detailed info for a specified app or for the
                            active one
  kinvey app use <app>      Set the active application
  kinvey app export         Export the specified app or the active one
  kinvey app delete         Delete a specified app or the active one

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


`

exports['common incomplete commands namespace (appenv) only should show help 1'] = `
kinvey appenv <command> [args] [options]

Commands:
  kinvey appenv create <name>  Create an environment
  kinvey appenv apply          Apply an environment configuration file
  kinvey appenv list           List environments per app
  kinvey appenv show           Show detailed info for a specified environment or
                               for the active one
  kinvey appenv use <env>      Set the active environment
  kinvey appenv delete         Delete a specified environment or the active one
  kinvey appenv export         Export environment configuration to a file

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


`

exports['common incomplete commands namespace (coll) only should show help 1'] = `
kinvey coll <command> [args] [options]

Commands:
  kinvey coll create <name>  Create a collection
  kinvey coll list           List collections per environment
  kinvey coll delete <coll>  Delete a collection

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


`

exports['common incomplete commands namespace (flex) only should show help 1'] = `
kinvey flex <command> [args] [options]

Commands:
  kinvey flex init           Set project options
  kinvey flex create <name>  Create a Flex service
  kinvey flex deploy         Deploy the current project to the Kinvey
                             FlexService Runtime
  kinvey flex status         Return the health of a Flex Service cluster
  kinvey flex show           Show info for a service environment
  kinvey flex list           List Internal Flex Services for an org
  kinvey flex logs           Retrieve and display Internal Flex Service logs
  kinvey flex update         Update environment variables and runtime. Causes
                             restart/rebuild of the service
  kinvey flex recycle        Recycle the Service
  kinvey flex delete         Delete service
  kinvey flex clear          Clear project settings

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


`

exports['common incomplete commands namespace (org) only should show help 1'] = `
kinvey org

Manage organizations. Run 'kinvey org -h' for details.

Commands:
  kinvey org apply      Apply an organization configuration file
  kinvey org list       List organizations
  kinvey org show       Show detailed info for a specified org or for the active
                        one
  kinvey org use <org>  Set the active organization
  kinvey org export     Export the specified org or the active one

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


`

exports['common incomplete commands namespace (profile) only should show help 1'] = `
kinvey profile

Manage profiles. Run 'kinvey profile -h' for details.

Commands:
  kinvey profile create <name>  Create profile
  kinvey profile list           List saved profiles
  kinvey profile show [name]    View detailed info for a profile. If no profile
                                is specified, the active profile is used.
  kinvey profile use <name>     Set the active profile
  kinvey profile delete [name]  Delete a specified profile or the active one
  kinvey profile login [name]   Re-authenticate a profile. If no profile is
                                specified, the active profile is used.

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


`

exports['common incomplete commands namespace (service) only should show help 1'] = `
kinvey service

Manage services. Run 'kinvey service -h' for details.

Commands:
  kinvey service create <name>  Create a service
  kinvey service apply          Apply a service configuration file
  kinvey service export         Export a service

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


`

exports['common incomplete commands namespace (website) only should show help 1'] = `
kinvey website

Manage websites. Run 'kinvey website -h' for details.

Commands:
  kinvey website create <name>  Create a website
  kinvey website list           List websites
  kinvey website show           Show detailed info for the specified website
  kinvey website deploy         Deploy your website
  kinvey website publish        Publish your website
  kinvey website status         Status of the specified website
  kinvey website unpublish      Unpublish your website
  kinvey website delete         Delete the specified website

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


`

exports['common invalid credentials when token is expired should fail and suggest command 1'] = `
[error] InvalidCredentials: Authorization token invalid or expired.
Run 'kinvey profile login' to reauthenticate.

`
