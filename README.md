# Kinvey CLI

> Utility for deploying and managing FlexServices on the Kinvey FlexService Runtime

## Installation

`npm install -g kinvey-cli`

## Usage

kinvey `<command>` [args] [options]

To get help you can pass in the `-h` flag. Example:

`kinvey flex -h`

`kinvey flex logs -h`

## Getting started

Kinvey CLI requires your account credentials to work. The fastest way to get started is to run the `kinvey init` command. It always prompts for credentials, host and profile name.

```
$ kinvey init
? E-mail john.doe@kinvey.com
? Password ***********
? Host https://manage.kinvey.com/
? Profile dev
```


### Managing profiles

If you don't want to be prompted, you can use `kinvey profile create <name>`. Credentials can be provided as command line options or as environment variables.

`kinvey profile create dev --email john.doe@kinvey.com --password johnPassword --host kvy-us2`

You can create multiple profiles and specify as option which one to be used. Example: 

`kinvey flex init --profile dev`

Or, you can set one of the profiles as active and it will be used from then on:

`kinvey profile use dev`

**Note**: Host has a default value of **https://manage.kinvey.com/** which will be used if not overwritten. It accepts either absolute URI (https://kvy-us2-manage.kinvey.com/) or instance name only (kvy-us2).

**Note**: If you have just one profile, you can skip setting it as active or providing it as command line option. It will be used if no other credentials are provided.

### Creating a one-time session

Every command that requires authentication allows passing in credentials and host as command line options. If host is not provided, its default value will be used.

`kinvey flex status --serviceId <service-id> --email <email> --password <password>`

The same information can be provided through environment variables.

**Linux, macOS**

```
export KINVEY_CLI_EMAIL=<email>
export KINVEY_CLI_PASSWORD=<password>
export KINVEY_CLI_HOST=<host>
```

**Windows**
```
set KINVEY_CLI_EMAIL=<email>
set KINVEY_CLI_PASSWORD=<password>
set KINVEY_CLI_HOST=<host>
```

### Deploying a Flex service

First, you need to set project settings. Run `kinvey flex init` in the project's directory. It will prompt for app or organization and an Internal Flex Service to deploy to. 

Next, run `kinvey flex deploy` again in project's directory.

**Note**: The CLI sends binary data (content type "multipart/form-data") as part of the deploy process. Deploy jobs will fail if traffic of this type is blocked within your network.


## Commands

* `init` - provide account credentials through prompts


* `profile create <name>` - create profile
* `profile list` - list saved profiles
* `profile show [name]` - show detailed info for a specified profile or for the active one
* `profile use <name>` - set the active profile
* `profile delete <name>` - delete profile by name


* `flex init` - set project options
* `flex deploy` - deploy the current project to the Kinvey FlexService Runtime
* `flex job [id]` - get the job status of a deploy/recycle command. Returns the status of the most recent `flex deploy` or `flex recycle` command if `[id]` is not specified.
* `flex status` - display the health of a Flex Service cluster. To get the status of a service different than the one chosen  from running `flex init`, just provide service ID in options:
	* `kinvey flex status --serviceId <service-id>` 
* `flex list` - list Internal Flex Services for an app or org
* `flex logs` - retrieve and display Internal Flex Service logs
	* Run `kinvey flex logs -h` for advanced `logs` command usage details, including returning more than the default number of entries, specifying a page number, or filtering by timestamp.
    * **Note:** Logs calls return 100 entries by default and can return up to 2,000 entries.
  * Logs are displayed in the following format: `<runtime id> <timestamp> - <message>`
    * E.g. `ac7df839104d 2016-02-23T20:00:29.334Z - hello world`
* `flex recycle` - recycle the service
* `flex delete` - delete project settings


* `help` - show help

## Options

* `--email <e-mail>` - e-mail address of your Kinvey account
* `--host <host>` - Kinvey dedicated instance hostname
* `--password <password>` - password of your Kinvey account
* `--profile <profile>` - profile to use
* `--silent` - do not output anything
* `--suppress-version-check` - do not check for package updates
* `--verbose` - output debug messages.
* `--version` - show version number
* `-h, --help` - show help


## Environment variables

* `KINVEY_CLI_EMAIL` - e-mail address of your Kinvey account
* `KINVEY_CLI_PASSWORD` - password of your Kinvey account
* `KINVEY_CLI_HOST` - Kinvey dedicated instance hostname
* `KINVEY_CLI_PROFILE` - profile to use

## Precedence of configuration options

* Command line options
* Environment variables
* Configuration file


## Proxy Settings

The Kinvey CLI supports the universal ENV variables `HTTPS_PROXY` and `https_proxy` for routing commands through a proxy server.

```
export HTTPS_PROXY=proxy.local
```

## Troubleshooting

Run any command with the `--verbose` flag to see what is going on when executing a command. 

If you are using an already configured profile, you can stumble upon an 'InvalidCredentials' error. This might mean that the session token has expired. Credentials must be supplied again. You can override the profile by providing its name to `kinvey init` or to `kinvey profile create`.  

If problems persist, please contact [Kinvey](http://support.kinvey.com).

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