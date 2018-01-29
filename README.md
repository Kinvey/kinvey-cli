# Kinvey CLI

Kinvey CLI is an utility for deploying and managing FlexServices running on the Kinvey FlexService Runtime.

## Installation

Kinvey CLI is distributed as an NPM package. After you install NPM, run the following command to download and install Kinvey CLI.

    npm install -g kinvey-cli

## Usage

    kinvey <command> [args] [options]

## Commands

* `init`

   Prompts you to provide account credentials and host and creates a new working profile for you based on the information you provided.

* `profile create <name> [profile information]`

   Creates a profile with the specified name. You can specify the profile information either at the command line as arguments or as environment variables. In the presence of command line argument, any values in the environment variables are ignored.

* `profile list`

   Lists all existing profiles. Profiles are saved under the user home.

* `profile show [name]`

   Shows detailed information about the specified profile. If you omit the profile name, information about the active profile is shown.

* `profile use <name>`

   Sets an active profile.
    
* `profile delete <name>`

   Deletes the specified profile.

* `flex init`

   Configures Kinvey CLI to work with a specific Flex Service. This command is designed to be executed in a Node.js project directory where it creates a `.kinvey` configuration file. Each successive execution in the same directory overwrites the configuration file.

* `flex deploy`

   Deploys the current project to the Kinvey FlexService Runtime. You can specify a Flex Service using the `--serviceId` option.

* `flex job [id]`

   Shows the job status of a deploy/recycle command. If you don't specify an `id`, the command returns the status of the most recent `flex deploy` or `flex recycle` command.

* `flex status`

   Displays the health of the current (the one you initiated last) Flex Service. To get the status of a different service, specify its service ID using the `--serviceId` option.

* `flex list`

  Lists all Flex Services for a domain (app or organization), excluding external Flex Services. Specify domain using `--domain` and then an app or organization ID using `--id`. If you skip the domain and ID options, the command lists the services inside the domain you've configured as part of running `flex init`.

* `flex logs`

   Retrieves and displays Flex Services logs. Logs calls return 100 entries by default and can return up to 2,000 entries. Logs are displayed in the following format: `<runtime id> <timestamp> - <message>`. Run `kinvey flex logs -h` for advanced `logs` command usage details, including returning more than the default number of entries, specifying a page number, or filtering by timestamp. Logs for external Flex Services are not returned. You can specify a Flex Service to read logs from using the `--serviceId` option.
  
* `flex recycle`
   
   Recycles the current (the one you initiated last) Flex Service. To recycle a different service, specify its service ID using the `--serviceId` option.

* `flex delete`

   Deletes the current Flex Service configuration from the Node.js project directory that it has been executed in.

* `help`

   Prints general usage instructions. For detailed command usage instruction, use the `--help` option with the command.

## Options

* `--color <true|false>`

   Enable/disable colors. To disable use `--no-color` or `--color false`.

* `--domain <app|org>`

   Specifies the domain type for commands like `flex list`.

* `--email <e-mail>`

   Email address of your Kinvey account.

* `--host <host>`

   Hostname of a Kinvey instance. It has a default value of `https://manage.kinvey.com/` which most customers should use. If you are a customer on a dedicated Kinvey instance, enter your dedicated host name as either an absolute URI (`https://kvy-us2-manage.kinvey.com/`) or an instance name only (`kvy-us2`).

* `--id <app or organization ID>`

   App or organization ID for use with `--domain <app|org>`.
   
* `--output <json>`
   
   Output format. Aside from the default format, JSON is also supported.

* `--password <password>`

   Password for your Kinvey account.

* `--profile <profile>`

   Profile to use.

* `--serviceId <Flex Service ID>`

   Specifies a Flex Service, e.g. for use with the `flex status` command.

* `--silent`

   Suppresses any output. Useful for scripting.

* `--suppress-version-check`

   Prevents Kinvey CLI to check for new versions, which normally happens each execution.
   
* `--verbose`

   Prints additional debug messages.

* `--version`

   Prints the version number of `kinvey-cli`.

* `--help, -h`

   When used after a `kinvey-cli` command, shows its usage instructions.

## Environment Variables

Use these environment variables to specify profile information for the `profile create` command when you don't want to specify it at the command line. Keep in mind that any values specified at the command line take precedence over the environment variable values.

* `KINVEY_CLI_EMAIL`

   Email address of your Kinvey account.

* `KINVEY_CLI_PASSWORD`

   Password for your Kinvey account.

* `KINVEY_CLI_HOST`

   Hostname of a Kinvey instance. It has a default value of `https://manage.kinvey.com/` which most customers should use. If you are a customer on a dedicated Kinvey instance, enter your dedicated host name as either an absolute URI (`https://kvy-us2-manage.kinvey.com/`) or an instance name only (`kvy-us2`).

* `KINVEY_CLI_PROFILE`

   Profile to use.


## Getting Help

Kinvey CLI comes with a two-stage help system. You can either call the `help` command to see an overview of the available commands or request details about a command usage with the `-h` flag.

    kinvey help

    kinvey flex -h

    kinvey flex logs -h


## Getting Started

Kinvey CLI requires you to authenticate. The fastest way to get started is to run the `kinvey init` command. It prompts for credentials and hostname and creates a working profile for you, which stores the settings for you for future executions.

Note that you only need to specify a host if you are on a dedicated Kinvey instance. Otherwise just press Enter to continue.

When prompted for `Profile`, enter a name for your new working profile that Kinvey CLI will create for you. Kinvey CLI will use this profile automatically for future executions as long as it is the only profile on the system. You can create new profiles and select an active account if you need to.

```
$ kinvey init
? E-mail john.doe@kinvey.com
? Password ***********
? Host https://manage.kinvey.com/
? Profile dev
```

You can run `kinvey init` from any directory as it always writes your new profile in your home directory.

Next, you need to configure Kinvey CLI to connect to a Flex Service that you've already created using the Kinvey Console.

For the following commands, you need to switch to the Node.js project directory that you will be deploying as a Flex Service as the configuration they create and read is project-specific.

```
cd <node.js project dir>
kinvey flex init
```

Through a series of prompts, this command will ask you for a domain in which to operate (app or organization) and a Flex Service to deploy to.

Finally, you are ready to deploy you node.js project as a Flex Service.

    kinvey flex deploy

**Note**: Kinvey CLI sends binary data (content type "multipart/form-data") during the deploy process. The deploy job will fail if traffic of this type is blocked within your network.

## Managing Profiles

Another way to create working profiles, besides running `kinvey init`, is invoking `kinvey profile create <name>`. You can choose between providing the credentials at the command line or as preset [environment variables](#environment-variables).

    kinvey profile create dev --email john.doe@kinvey.com --password john'sPassword --host kvy-us2

You can create multiple profiles and specify which one to use at the command line.

    kinvey flex init --profile dev

If you don't want to specify a profile every time, you can set one as active and it will be used for future executions:

    kinvey profile use dev


**Note**: If you have a single profile, you can skip setting it as active as well as providing it as a command line option. It will be used if no other credentials are provided.

### Authentication Token Expiration

As part of creating a working profile, the authentication token provided by Kinvey is stored locally. This token will be used to authenticate future command executions until it expires. At that point, you need to recreate the profile to keep working with Kinvey CLI. You can do that by providing the profile name to `kinvey init` or `kinvey profile create`.

## Authenticating One-time Commands

Every command that requires authentication can take credentials and a hostname as command line options. If a hostname is not provided, its default value is used.

    kinvey flex status --serviceId <service-id> --email <email> --password <password>

You can also provide the same information through environment variables before running the command.

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

## Precedence of Configuration Options

For the Kinvey CLI commands that require passing configuration values, the following precedence order applies.

* Command line options&mdash;take precedence when specified
* Environment variables&mdash;the first choice when command line arguments are missing
* Profile data&mdash;values saved as part of the applicable working profile are used if neither command line arguments nor environment variables are set


## Proxy Settings

Kinvey CLI supports the universal environment variables `HTTPS_PROXY` and `https_proxy` for routing commands through a proxy server. Set it if you are using a proxy.


    export HTTPS_PROXY=proxy.local


## Troubleshooting

Run any command with the `--verbose` flag to receive more detailed information about a command execution.

If you are using a profile that has been configured a while ago, you can stumble upon the `InvalidCredentials` error. It may mean that the session token has expired. See [Authentication Token Expiration](#authentication-token-expiration) for details.

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