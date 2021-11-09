# Changelog

## Unreleased

## 6.2.1 (2021-11-09)
* Add password reset URL support for appEnv config files

## 6.2.0 (2021-06-09)
* Add support for login hooks

## 6.1.3 (2021-03-05)
* Improve error message for iOS push settings in config management

## 6.1.2 (2021-02-16)
* Modify collection hooks sequentially
* Add collection hooks: onPreInsert, onPreUpdate, onPostInsert, onPostUpdate

## 6.1.1 (2020-10-30)
* Do not update the appEnv when no settings are supplied on `kinvey appenv apply`
* Fix appEnv ID check

## 6.1.0 (2020-09-14)
* Support login with external identity providers

## 6.0.0 (2020-07-02)
* Modify commands to accept only `--org <org>` (`--app <app>` is no longer valid):
    * `flex init`
    * `flex create`
    * `flex list`
    * `service create`
    * `website create`
    * `app create`
* Remove `flex job` command
* Update API version to 4
* Update min node version to 12.16.1

## 5.0.0 (2019-11-28)
* Move `file` from positional argument to option
* Rename `push` commands to `apply`
* Allow creating app, app env or service with a name that contains only digits
* Do not export the `serviceEnvironment` field on the serviceObject during `service export`
* Fetch all orgs that a user can read
* Do not export services of type custom
* Remove support for SAP services as they are deprecated
* Allow `insertMany` method for services
* Improve profile description 

## 5.0.0-alpha.1 (2019-10-11)
* Fix BAAS host slashes when backend runs on localhost
* Add `org push` to modify organizations from config file
* Fix config management by adjusting to services endpoints changes
* Improve response error handling

## 5.0.0-alpha.0 (2018-12-14)
* Config management related logic uses v3 API
* Support service environments in service config files
* Support runtime and environment variables in flex service config files
* Fix 'app push' to update properly env metadata

## 4.5.2 (2019-09-19)
* Validate files size when deploying websites

## 4.5.1 (2019-08-01)
* Output error if identifier (e.g. `--app`) matches more than one entity
* Update `lodash.merge` to `4.6.2`

## 4.5.0 (2019-05-16)
* `website deploy` command improvements:
    * verify files for index and/or error page are present
    * add `--force` flag to force deploy
* Add flex runtime version `node12`

## 4.4.0 (2019-04-25)
* Add websites support:
    * `website create <name>`
    * `website show`
    * `website list`
    * `website deploy`
    * `website publish`
    * `website status`
    * `website unpublish`
    * `website delete`

## 4.1.3 (2019-03-20)
* Show any 'status' value in all caps (`flex status`)

## 4.1.2 (2019-03-05)
* Suggest command when token is expired
* Use backend error when HTTP status code is 401
* Apply Kinvey lint rules and fix lint errors

## 4.1.1 (2018-11-29)
* Preserve existing env vars on `flex deploy --set-vars <env variables>` 

## 4.1.0 (2018-11-27)
* Migrate to v3 API
* Add service environments functionality in flex namespace

## 4.1.0-alpha.3
* Add `org export` to export organizations
* Ensure `export` creates non-existing directories
* App functionality to create/modify app from config file
* Add `app export` command to export applications
* Support rapid data and flex service types for `service export`
* Specify entity identifiers as options

## 4.1.0-alpha.2
* Add `service export` command to export a flex service to config file
* Output logs properly when log message is an object
* Prompt for 2FA token on 'profile login' if required
* Rearrange logs

## 4.1.0-alpha.1
* Add support for groups in env config file
* Fix env export issues

## 4.1.0-alpha.0
* Add functionality to create/modify env from config file
* Add functionality to export env to config file

## 4.0.1 (2018-11-21)
* Add runtime environment support for internal flex services

## 4.0.0 (2018-11-08)
* Add commands:
    * organizations-related: `org list`, `org show`, `org use`
    * applications-related: `app create`, `app list`, `app show`, `app use`, `app delete`
    * app environments-related: `appenv create`, `appenv list`, `appenv show`, `appenv use`, `appenv delete`
    * collections-related: `coll create`, `coll list`, `coll delete`
* Add `org` option to `app create`
* Add `flex create` command to create internal flex services
* Add `flex clear` command to clear project settings
* Add environment variables for internal flex services
* Repurpose the `flex delete` command to delete internal flex services
* Ask for confirmation on app/appenv/coll/flex delete
* Fail on unsupported hyphenated option or flag
* Update production dependencies (moment.js, request.js)
* Update dev dependencies
* Show help on `kinvey <namespace>`
* Fix `flex deploy` to work with local setup
* Fix `profile login` to update only token

## 3.1.2
* Enhance `flex status` output

## 3.1.1
* Prompt for 2FA token on 'profile login' if required
* Rearrange logs
* Output logs properly when log message is an object

## 3.1.0
* Ask for profile override if profile already exists on 'kinvey init'
* Setup Travis
* Use active profile if no other specified on 'profile delete'
* Add 'profile login'
* Add 2fa option

## 3.0.0

## 3.0.0-beta.4
* Apply Kinvey es6 style guide
* Fix 'flex init' when no config file

## 3.0.0-beta.3
* Refactor command handlers
* Fail on too many args
* Replace host with instanceId
* Configure flex project for many instances
* Provide shorthand option for number

## 3.0.0-beta.2
### Bugfixes and improvements:
* Show connection errors details
* Show validation errors details
* Validate 'from' is before 'to' when retrieving logs
* Prompt for app/org if token is valid
* Accept '--serviceId' option for 'flex deploy'
* Enable JSON output format
* Enable '--no-color' flag
* Don't show flex service name when '--serviceId'
* Don't invalidate profile token if it can't be overwritten
* Don't output anything if '--silent'

## 3.0.0-beta.1
* Fix line endings in bin directory

## 3.0.0-beta.0
* Add profiles to support using multiple Kinvey accounts
* Move all flex-related commands under the flex namespace (e.g. `status` -> `flex status`)
* Add commands:
	* `init` - prompts for credentials disregarding command line options and ENV variables
	* `flex init` - prompts for project settings
* Allow providing credentials to all commands (except `init`) as command line options or as ENV variables
* Remove commands:
	* `config`
	* `logout`
* Add some command line options to flex-related commands
* Increase request timeout to 10s

## 2.1.0
* `status` command now reports the email address (plus first/last name, if set) of deployer and the date/time at which service was deployed

## 2.0.0
* `status` command now reports the version of the most recently-deployed service
* `logs` command enhancements
  * [from] and [to] optional arguments replaced with `--from` and `--to` flags
  * Added `-n` (`--number`) and `--page` flags
  * Only 100 entries are returned by default unless the `-n` flag is supplied

## 1.2.1 (2017-07-25)
* Fixed bug resulting in 2FA login crash

## 1.2.0 (2017-07-25)
* ES6 rewrite
* Support 2FA token login
* Add ability to login to the CLI using ENV variables

## 1.1.5 (2017-06-20)
* Fixed bug where `instance` param was not respected when running `config [instance]` in a fresh environment

## 1.1.4 (2017-05-05)
* Fixed crash on `config` against the default instance (under certain scenarios)

## 1.1.3 (2017-02-25)
* Added HTTPS proxy usage information to README

## 1.1.2 (2017-01-26)
* Fixed bug which resulted in a 'ProjectNotConfigured' error when running the `list` command with a successfully configured project

## 1.1.1 (2017-01-12)
* Fixed bug which resulted in a CLI crash when parsing/printing non-string log message data
  * Skip log entries which have no corresponding message (and report which entries have been skipped when running CLI in verbose mode)

## 1.1.0 (2017-01-09)
* CLI now supports operations against data links backed by Kinvey organizations
* `kinvey config` targets the default Kinvey instance for data link selection if a host is not provided (even if the CLI was previously configured with a custom host)
* Fixed 'Archive Limit Exceeded' bug occasionally encountered during deployment of valid Kinvey services from within Windows environments
* Update CLI update check frequency (interval shortened to 30 minutes)
* Fixed bug where 'ProjectNotConfigured' was not correctly displayed after attempting to execute commands without a valid CLI configuration

## 1.0.2 (2016-11-15)
* Remove duplicate 'host' output during config command when using custom Kinvey instance

## 1.0.1 (2016-11-15)
* Cache last recycle job ID
* Update session storage filename

## 1.0.0 (2016-11-10)
* Add support for refactored KBW/KMR 'status' command. Repurpose existing 'status' command into 'job'
* Cache last deploy job for ease of retrieval using `kinvey job`
* Add support for logging thresholds (requires Flex SDK >= 1.0.0)
* Allow setting of persistent host via `kinvey config [instance]`
* `config` command now prompts for a new service on every run (fixed prior bug where it did nothing if saved data was already present)
* Upgrade CLI to check for `kinvey-flex-sdk` (instead of `kinvey-backend-sdk`)
* `logs` command now takes optional runtime arguments (instead of prompting for log filters)
* Obfuscate instance URLs at configuration time (e.g. `kinvey config acme-us1`)
* Fixed bug where credentials were improperly cleared during logout/refresh
* Fixed bug where `status` command (no arg command) crashed if supplied with an argument

## 0.0.8 (2016-08-08)
* Support node 6.x

## 0.0.7 (2016-04-21)
* Handle authentication errors when deploying.

## 0.0.6 (2016-03-17)
* Do not display progress message for completed jobs.

## 0.0.5 (2016-03-11)
* Display progress and error messages when retrieving deploy status.

## 0.0.4 (2016-02-25)
* Implement `logs` command

## 0.0.3 (2016-01-08)
* Refactor routes.

## 0.0.2 (2015-09-25)
* Renew expired tokens.
* Updated dependencies.

## 0.0.1 (2015-09-21)
* Initial version.
