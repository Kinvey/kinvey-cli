# Changelog

## 1.0.0 (2016-11-10)
* BACK-1327: Add support for refactored KBW/KMR 'status' command. Repurpose existing 'status' command into 'job'
* BACK-1534: Cache last deploy job for ease of retrieval using `kinvey job`
* BACK-1836: Add support for logging thresholds (requires Flex SDK >= 1.0.0)
* BACK-1912: Allow setting of persistent host via `kinvey config [instance]`
* BACK-1849: `config` command now prompts for a new service on every run (fixed prior bug where it did nothing if saved data was already present)
* BACK-2022: Upgrade CLI to check for `kinvey-flex-sdk` (instead of `kinvey-backend-sdk`)
* BACK-2036: `logs` command now takes optional runtime arguments (instead of prompting for log filters)
* BACK-1934: Obfuscate instance URLs at configuration time (e.g. `kinvey config acme-us1`)
* BACK-2043: Fixed bug where credentials were improperly cleared during logout/refresh
* BACK-2010: Fixed bug where `status` command (no arg command) crashed if supplied with an argument

## 0.0.8 (2016-08-08)
* BACK-1577: Support node 6.x

## 0.0.7 (2016-04-21)
* BACK-1325: Handle authentication errors when deploying.

## 0.0.6 (2016-03-17)
* BACK-1358: Do not display progress message for completed jobs.

## 0.0.5 (2016-03-11)
* BACK-1307: Display progress and error messages when retrieving deploy status.

## 0.0.4 (2016-02-25)
* BACK-1209: Implement `logs` command

## 0.0.3 (2016-01-08)
* BACK-905: Refactor routes.

## 0.0.2 (2015-09-25)
* BACK-938: Renew expired tokens.
* Updated dependencies.

## 0.0.1 (2015-09-21)
* Initial version.
