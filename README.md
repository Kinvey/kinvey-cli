# Kinvey Kinvey CLI
> Utility for managing KMR services

## Installation
`npm install -g kinvey-cli`

## Usage
In your project directory, run `kinvey-cli config` to set-up your project. The CLI will prompt for Kinvey credentials, app, and Internal Flex Service.

### Commands
* `config [host]` - set project options (including optional host if using a dedicated Kinvey instance)
* `deploy` - deploy the current project as an Internal Flex Service. You can check the status of a deploy using the `job` command (more info below).
* `status` - display the health status of an Internal Flex Service
* `help` - display usage information.
* `list` - list the configured Internal Flex Services for the current app.
* `logs [from] [to]` - query logs for this Internal Flex Service
  * 'from' and 'to' arguments represent optional ISO-8601 timestamp strings
  * Logs are displayed in the following format: `<runtime id> <timestamp> - <message>`
  * E.g. `ac7df839104d 2016-02-23T20:00:29.334Z - hello world`
* `logout` - clears Kinvey session data and project settings
* `job <id>` - return the status of a `deploy` command.

### Options
* `-e, --email <e-mail>` - e-mail address of your Kinvey account.
* `--host <host>` - set host of the Kinvey service.
* `-p, --password <password>` - password of your Kinvey account.
* `-s, --silent` - do not output anything.
* `-c, --suppress-version-check` - do not check for package updates.
* `-v, --verbose` - output debug messages.

The Kinvey CLI supports one-time session creation using the `-e` and `-p` (and optionally `--host`) flags. Set these parameters explicitly in your calls if you are unable to init with `kinvey-cli config`.

## Troubleshooting
Run any command with the `-v` (`--verbose`) flag to see what is going on when executing a command. If problems persist, please contact [Kinvey](http://support.kinvey.com). In any case, make sure you have configured your project using the `config` command before attempting to execute any other commands.

## Changelog
See the [Changelog](./CHANGELOG.md) for a list of changes.

## License
    Copyright (c) 2016, Kinvey, Inc. All rights reserved.

    This software is licensed to you under the Kinvey terms of service located at
    http://www.kinvey.com/terms-of-use. By downloading, accessing and/or using this
    software, you hereby accept such terms of service  (and any agreement referenced
    therein) and agree that you have read, understand and agree to be bound by such
    terms of service and are of legal age to agree to such terms with Kinvey.

    This software contains valuable confidential and proprietary information of
    KINVEY, INC and is subject to applicable licensing agreements.
    Unauthorized reproduction, transmission or distribution of this file and its
    contents is a violation of applicable laws.