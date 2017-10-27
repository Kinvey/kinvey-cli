# Kinvey CLI
> Utility for deploying and managing FlexServices on the Kinvey FlexService Runtime

## Installation
`npm install -g kinvey-cli`

## Usage
In your project directory, run `kinvey config` to set up your project. The CLI will prompt for Kinvey credentials, app or organization, and an Internal Flex Service to deploy to.

### Commands
* `config [instance]` - set project options (including optional dedicated Kinvey instance name).
* `deploy` - deploy node project in the current directory as an Internal Flex Service. You can check the status of a deploy using the `job` command (more info below).
* `status` - display the health and deployment metadata (version, deployer info, requested at) of a deployed Internal Flex Service.
  * E.g. `ONLINE [v0.0.48]`
* `help` - display usage information.
  * To display help/usage info for a particular command, use `kinvey <command> -h`
* `list` - list Internal Flex Services for the current app.
* `logs` - query logs for the current Internal Flex Service
  * Run `kinvey logs -h` for advanced `logs` command usage details, including returning more than the default number of entries, specifying a page number, or filtering by timestamp.
    * **Note:** Logs calls return 100 entries by default and can return up to 2,000 entries.
  * Logs are displayed in the following format: `<runtime id> <timestamp> - <message>`
    * E.g. `ac7df839104d 2016-02-23T20:00:29.334Z - hello world`
* `logout` - clears Kinvey session data and project settings.
* `job [id]` - return the status of a `deploy` or `recycle` command. Returns the status of the most recent `deploy` or `recycle` command if `[id]` is not specified.

### Options
* `-e, --email <e-mail>` - e-mail address of your Kinvey account.
* `--host <host>` - set host of the Kinvey service.
* `-p, --password <password>` - password of your Kinvey account.
* `-s, --silent` - do not output anything.
* `-c, --suppress-version-check` - do not check for package updates.
* `-v, --verbose` - output debug messages.

### Credentials

Kinvey credentials can be provided as command line options or as environment variables.

#### Command line options
Run `kinvey config` and the CLI will prompt for Kinvey credentials if they are not already set as environment variables.

You can also create a one-time session using the `-e` and `-p` (and optionally `--host`) flags. Set these parameters explicitly in your calls if you are unable to init with `kinvey config [host]`. It's important to note that the `-e` and `-p` flags take precedence over environment variables. Example:
```
kinvey config -e kinveyAccount@kinvey.com -p yourKinveyPassword
```

#### Environment variables
* `KINVEY_CLI_USER` - e-mail address of your Kinvey account
* `KINVEY_CLI_PASSWORD` - password of your Kinvey account

Example:
```
export KINVEY_CLI_USER=kinveyAccount@example.com && export KINVEY_CLI_PASSWORD=yourKinveyPassword && kinvey config
```

### Proxy Settings

The Kinvey CLI supports the universal ENV variables `HTTPS_PROXY` and `https_proxy` for routing commands through a proxy server. For example:

```
export HTTPS_PROXY=proxy.local && kinvey config
```

**Note**: The CLI sends binary data (content type "multipart/form-data") as part of the deploy process. Deploy jobs will fail if traffic of this type is blocked within your network.

## Troubleshooting
Run any command with the `-v` (`--verbose`) flag to see what is going on when executing a command. If problems persist, please contact [Kinvey](http://support.kinvey.com). In any case, make sure you have configured your project using the `config` command before attempting to execute any other commands.

## Changelog
See the [Changelog](./CHANGELOG.md) for a list of changes.

## License
    Copyright (c) 2017, Kinvey, Inc. All rights reserved.

    This software is licensed to you under the Kinvey terms of service located at
    http://www.kinvey.com/terms-of-use. By downloading, accessing and/or using this
    software, you hereby accept such terms of service  (and any agreement referenced
    therein) and agree that you have read, understand and agree to be bound by such
    terms of service and are of legal age to agree to such terms with Kinvey.

    This software contains valuable confidential and proprietary information of
    KINVEY, INC and is subject to applicable licensing agreements.
    Unauthorized reproduction, transmission or distribution of this file and its
    contents is a violation of applicable laws.