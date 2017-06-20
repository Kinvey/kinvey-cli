# Changelog

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
