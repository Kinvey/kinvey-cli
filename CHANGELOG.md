# Changelog

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
