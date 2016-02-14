# Kinvey DLC CLI
> Utility for deploying Kinvey DLC microservices to Kinvey’s Node DLC PaaS.

## Installation
`npm install -g kinvey-dlc-cli`

## Usage
In your project directory, run `kinvey-dlc-cli config` to set-up your project. The CLI will prompt for Kinvey credentials, app, and Data Link.

### Commands
* `config` - set project options.
* `deploy` - deploy the current project as a Kinvey-backed Data Link Connector. You can check the status of a deploy using the `status` command.
* `help` - display usage information.
* `hosts` - display list of hosts that this DLC has executed on
* `list` - list the configured Kinvey-backed Data Link Connectors for the current app.
* `logs` - query logs for this Kinvey-backed Data Link Connector.
* `recycle` - recycle the Data Link Connector.
* `status <job>` - return the job status of a `deploy` command.

### Options
* `-e, --email <e-mail>` - e-mail address of your Kinvey account.
* `--host <host>` - set host of the Kinvey service.
* `-p, --password <password>` - password of your Kinvey account.
* `-s, --silent` - do not output anything.
* `-c, --suppress-version-check` - do not check for package updates.
* `-v, --verbose` - output debug messages.

## Troubleshooting
Run any command with the `--verbose` flag to see what is going on when executing a command. If problems persist, please contact [Kinvey](http://support.kinvey.com). In any case, make sure you have configured your project using the `config` command before attempting to execute any other commands.

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