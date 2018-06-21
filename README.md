| LINTING            | UNIT            | INTEGRATION            |
|-------------------|-------------------|-------------------|
| [![Build1][1]][4] | [![Build2][2]][4] | [![Build3][3]][4] |

[1]: https://travis-matrix-badges.herokuapp.com/repos/Kinvey/kinvey-cli/branches/master/1
[2]: https://travis-matrix-badges.herokuapp.com/repos/Kinvey/kinvey-cli/branches/master/2
[3]: https://travis-matrix-badges.herokuapp.com/repos/Kinvey/kinvey-cli/branches/master/3
[4]: https://travis-ci.org/Kinvey/kinvey-cli




# Kinvey CLI

Kinvey CLI is a utility for managing various aspects of your Kinvey account from the command line. Its features include:

* Deploying and managing FlexServices running on the Kinvey FlexService Runtime
* Creating, listing, and deleting applications
* Creating, listing, and deleting environments
* Creating, listing, and deleting collections

## Installation

Kinvey CLI is distributed as an NPM package. After you install NPM, run the following command to download and install Kinvey CLI.

    npm install -g kinvey-cli

## Usage

    kinvey <command> [args] [options]

## Commands

* `init`

   Prompts you to provide account credentials and instance ID and creates a new working profile for you based on the information you provided. Command-line options that specify the same data are ignored.

* `profile create <name> [profile information]`

   Creates a profile with the specified name. You can specify the profile information either at the command line as arguments or as environment variables. In the presence of command line argument, any values specified through environment variables are ignored.

* `profile list`

   Lists all existing profiles. Profiles are saved under the user home.
   
* `profile login [name]`

    Re-authenticates a specified profile. If you omit the profile name, the active profile is used. Prompts for password.

* `profile show [name]`

   Shows detailed information about the specified profile. If you omit the profile name, information about the active profile is shown.

* `profile use <name>`

   Sets an active profile.
    
* `profile delete [name]`

   Deletes the specified profile or the active one if you don't specify a profile name.

* `org list`

    Lists all existing organizations within your Kinvey account.
    
* `org show [org]`

    Shows detailed information about the specified organization or about the active one if you don't specify an organization. You can specify an organization by ID or name.

* `org use <org>`

    Sets the specified organization as active. You can specify an organization by ID or name.
    
* `app create <name>`

    Creates an application.
    
* `app list`

    Lists all existing applications within your Kinvey account.
    
* `app show [app]`

    Shows detailed information about the specified application or about the active one if you don't specify an application. You can specify an application by ID or name.

* `app use <app>`

    Sets the specified application as active. You can specify an application by ID or name.
    
* `app delete [app]`

    Deletes the specified application or the active one if you don't specify an application. You can specify an application by ID or name. You will be prompted for confirmation unless you set the `--no-prompt` flag.
    
    * `--no-prompt`
        
            Do not ask for confirmation.

* `env create <name>`

    Creates an environment within the active application. To use a different application, specify it using `--app`.
    
    * `--app <application>`
       
      Specifies a Kinvey app by ID or name.
    
* `env show [env]`

    Shows detailed information about the specified environment or about the active one if you don't specify an environment. You can specify an environment by ID or name. By default, the command searches inside the active application but you can specify a different application using `--app`.
    
    * `--app <application>`
       
      Specifies a Kinvey app by ID or name.

* `env use <env>`

    Sets the specified environment as active. By default, the command searches inside the active application but you can specify a different application using `--app`.
    
    * `--app <application>`
       
      Specifies a Kinvey app by ID or name.
    
* `env delete [env]`

    Deletes the specified environment or the active one if you don't specify an environment. You can specify an environment by ID or name. By default, the command searches inside the active application but you can specify a different application using `--app`. You will be prompted for confirmation unless you set the `--no-prompt` flag.
    
    * `--app <application>`
       
      Specifies a Kinvey app by ID or name.
      
    * `--no-prompt`
        
            Do not ask for confirmation.

* `coll create <name>`

    Creates a collection within the active application and environment. You can specify another pair of application and environment using the `--app` and `--env` options.
    
    * `--app <application>`
       
      Specifies a Kinvey app by ID or name. Requires `--env`.
    
    * `--env <environment>`
      
      Specifies a Kinvey app environment by ID or name. Requires `--app`.
    
* `coll list`

    Lists all existing collections within the active application and environment. You can specify another pair of application and environment using the `--app` and `--env` options.

    * `--app <application>`
       
      Specifies a Kinvey app by ID or name. Requires `--env`.
    
    * `--env <environment>`
      
      Specifies a Kinvey app environment by ID or name. Requires `--app`.

* `coll delete <coll>`
    
    Deletes a collection by name within the active application and environment. You can specify another pair of application and environment using the `--app` and `--env` options. You will be prompted for confirmation unless you set the `--no-prompt` flag.

    * `--app <application>`
       
      Specifies a Kinvey app by ID or name. Requires `--env`.
    
    * `--env <environment>`
      
      Specifies a Kinvey app environment by ID or name. Requires `--app`.
      
    * `--no-prompt`
        
            Do not ask for confirmation.

* `flex init`

   Configures Kinvey CLI to work with a specific Flex Service through prompts. This command is designed to be executed in a Node.js project directory where it creates a `.kinvey` configuration file. Information within the file is saved per profile. Each successive execution in the same directory overwrites the respective profile section in the configuration file. This command requires that either an active profile is set or a profile is specified using the `--profile` option. Profile data options such as `--email`, `--password`, and `--instanceId` are ignored if specified. 

* `flex create <service_name>`

    Creates an internal flex service with the specified name. You need to specify a domain (application or organization) using the `--app` or `--org` option.

    * `--app <application>`
           
          Specifies a Kinvey app by ID or name.
          
    * `--org <organization>`
            
          Specifies a Kinvey organization by ID or name.
           
    * `--secret <secret>`
     
          Specifies a shared secret of your choice (minimum 2 characters, no leading or trailing whitespaces). If you skip this option, a random shared secret is generated for you. In the latter case, Kinvey CLI will pass the secret automatically to the Flex Runtime and print it on the screen for your information.
        
* `flex deploy [serviceId]`

   Deploys the current project to the Kinvey FlexService Runtime, using the current service, which is the one you initiated last. To use a different service, specify its service ID.

* `flex job [id]`

   Shows the job status of a deploy/recycle command. If you don't specify an `id`, the command returns the status of the most recent `flex deploy` or `flex recycle` command.

* `flex status [serviceId]`

   Displays the health of the current Flex Service, which is the one you initiated last. To get the status of a different service, specify its service ID.

* `flex list`

   Lists all Flex Services for a domain (app or organization), excluding external Flex Services. Specify domain using `--domain` and then an app or organization ID using `--id`. If you skip the domain and ID options, the command lists the services within the domain you've configured as part of running `flex init`. In addition to the global options, this command supports the following options:

   * `--domain <app|org>`
   
      Specifies the domain type as either `app` for application or `org` for organization.
   
   * `--id <app or organization ID>`
   
      App or organization ID for use with `--domain <app|org>`.

* `flex logs [serviceId]`

   Retrieves and displays logs for the current Flex Service, which is the one you initiated last. To get logs for a different service, specify its service ID. Log calls return 100 entries by default and can return up to 2,000 entries. Logs are displayed in the following format: `<runtime id> <timestamp> - <message>`. Combine with the paging and limiting options to narrow down your search. Logs for external Flex Services are not returned. In addition to the global options, this command supports the following options:

   * `--from`

      Timestamp specifying the beginning of a period for which you want to fetch log entries, in ISO 8601 format.

   * `--number`

      Number of entries to fetch, i.e. page size. The default is 100, the maximum allowed is 2000.

   * `--page`

      Page number to fetch. The first page is indexed 1.

   * `--to`

      Timestamp specifying the end of a period for which you want to fetch log entries, in ISO 8601 format.

* `flex recycle [serviceId]`
   
   Recycles the current Flex Service, which is the one you initiated last. To recycle a different service, specify its service ID.

* `flex delete [serviceId]`

    Deletes the current Flex Service, which is the one you initiated last. To delete a different service, specify its service ID. You will be prompted for confirmation unless you set the `--no-prompt` flag.
    
    * `--no-prompt`
    
        Do not ask for confirmation.

* `flex clear`

   When executed in a Node.js project directory, this command removes the current Flex Service configuration from the project.

* `help`

   Prints general usage instructions. For detailed command usage instruction, use the `--help` option with the command.

## Global Options

You can add a global option to every Kinvey CLI command to get the described behavior. The only exceptions are `--email`, `--password`, `--instanceId` and `--2fa` which get ignored when added to a command that is designed to prompt for this information.

* `--2fa <2fa-token>`

    Two-factor authentication token. Applicable when two-factor authentication is enabled.

* `--email <e-mail>`

   Email address of your Kinvey account.

* `--help, -h`

   When used after a `kinvey-cli` command, shows its usage instructions.

* `--instanceId <instance ID>`

   ID (e.g., `kvy-us2`) or full hostname (e.g., `https://kvy-us2-manage.kinvey.com/`) of a Kinvey instance. It has a default value of `kvy-us1` (or `https://manage.kinvey.com/`) which most customers should use. If you are a customer on a dedicated Kinvey instance, enter your dedicated instance ID.

* `--no-color`

    Disable colors.
    
* `--output <format>`
   
   Output format. Valid choices: json.

* `--password <password>`

   Password for your Kinvey account.

* `--profile <profile>`

   Profile to use.

* `--version`

   Prints the version number of `kinvey-cli`.

* `--silent`

   Suppresses any output. Useful for scripting.

* `--suppress-version-check`

   Prevents Kinvey CLI to check for new versions, which normally happens each execution.

* `--verbose`

   Prints additional debug messages.

## Environment Variables

Use these environment variables to specify profile information for the `profile create` command when you don't want to specify it at the command line. Keep in mind that any values specified at the command line take precedence over the environment variable values.

* `KINVEY_CLI_EMAIL`

   Email address of your Kinvey account.

* `KINVEY_CLI_PASSWORD`

   Password for your Kinvey account.

* `KINVEY_CLI_INSTANCE_ID`

   ID (e.g., `kvy-us2`) or full hostname (e.g., `https://kvy-us2-manage.kinvey.com/`) of a Kinvey instance. It has a default value of `kvy-us1` (or `https://manage.kinvey.com/`) which most customers should use. If you are a customer on a dedicated Kinvey instance, enter your dedicated instance ID.

* `KINVEY_CLI_2FA`

    Two-factor authentication token.

* `KINVEY_CLI_PROFILE`

   Profile to use.
   
Kinvey CLI also supports these universal environment variables:

* `HTTPS_PROXY`/`https_proxy`

   Routes all Kinvey CLI requests through the specified proxy server.


## Getting Help

Kinvey CLI comes with a two-stage help system. You can either call the `help` command to see an overview of the available commands or request details about a command usage with the `-h` flag.

    kinvey help

    kinvey flex -h

    kinvey flex logs -h


## Getting Started

Kinvey CLI requires you to authenticate. The fastest way to get started is to run the `kinvey init` command. It prompts for credentials and hostname and creates a working profile for you, which stores the provided settings for future executions.

Note that you only need to specify an instance ID if you are on a dedicated Kinvey instance. Otherwise just press Enter to continue.

When prompted for `Profile name`, enter a name for your new working profile that Kinvey CLI will create for you. Kinvey CLI will use this profile automatically for future executions as long as it is the only profile on the system. You can create new profiles and select an active profile if you need to.

```
$ kinvey init
? E-mail john.doe@kinvey.com
? Password ***********
? Instance ID (optional) kvy-us1
? Profile name dev
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

    kinvey profile create dev --email john.doe@kinvey.com --password john'sPassword --instanceId kvy-us2

You can create multiple profiles and specify which one to use at the command line.

    kinvey flex init --profile dev

If you don't want to specify a profile every time, you can set one as active and it will be used for future executions:

    kinvey profile use dev


**Note**: If you have a single profile, you can skip setting it as active as well as providing it as a command line option. It will be used if no other credentials are provided.

### Authentication Token Expiration

As part of creating a working profile, the authentication token provided by Kinvey is stored locally. This token will be used to authenticate future command executions until it expires. At that point, you need to reenter your password or recreate the profile to keep working with Kinvey CLI. Run `kinvey profile login` to reenter your password. You can recreate the profile by providing the profile name to `kinvey init` or `kinvey profile create`.

## Authenticating One-time Commands

Every command that requires authentication can take credentials and a hostname as command line options. If a hostname is not provided, its default value is used.

    kinvey flex status --serviceId <service-id> --email <email> --password <password>

You can also provide the same information through environment variables before running the command.

**Linux, macOS**
```
export KINVEY_CLI_EMAIL=<email>
export KINVEY_CLI_PASSWORD=<password>
export KINVEY_CLI_INSTANCE_ID=<instance ID>
```

**Windows**
```
set KINVEY_CLI_EMAIL=<email>
set KINVEY_CLI_PASSWORD=<password>
set KINVEY_CLI_INSTANCE_ID=<instance ID>
```

## Precedence of Configuration Options

For the Kinvey CLI commands that require passing configuration values, the following precedence order applies.

* Command line options&mdash;take precedence when specified
* Environment variables&mdash;the first choice when command line arguments are missing
* Profile data&mdash;values saved as part of the applicable working profile are used if neither command line arguments nor environment variables are set


## Output Format

Kinvey CLI supports two output formats: plain text and JSON. Both are printed on the screen unless you redirect the output using shell syntax.

Plain text is printed by default. Depending on the command, it produces tabular data or a simple message stating that the action has completed successfully.

The JSON output format is suitable for cases where the output must be handled programmatically. You can run any command with `--output json`. The output will then have the following format:

```
{
    "result": [result]
}
```

## Proxy Settings

Kinvey CLI supports the universal environment variables `HTTPS_PROXY` and `https_proxy` for routing commands through a proxy server. Set it if you are using a proxy.


    export HTTPS_PROXY=proxy.local


## Troubleshooting

Run any command with the `--verbose` flag to receive more detailed information about a command execution.

Kinvey CLI is a subject to the following caveats:

- The CLI has a 10-second request timeout when communicating with the backend for initialization which may cause a connection error in some rare cases. Retrying the command remedies the problem in many cases.
- If you are using a profile that has been configured a while ago, you may stumble upon the `InvalidCredentials` error. It may mean that the session token has expired. See [Authentication Token Expiration](#authentication-token-expiration) for details.
- You cannot deploy the same service version to the FlexService Runtime more than once. You must increment the version in `package.json` before redeploying.
- Kinvey CLI sends binary data (content type "multipart/form-data") during the deploy process. The deploy job will fail if traffic of this type is blocked within your network.
- There is a limit of 100 MB to the size of the FlexService logs that are kept on the backend. When log entries exceed that size, the oldest ones are deleted.
- Running the CLI from Git Bash on Windows is known to cause issues ranging from failing commands to complete inability to start. Use Windows Command Prompt instead.

If problems persist, contact [Kinvey](http://support.kinvey.com).

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
