| LINTING            | UNIT          |   INTEGRATION          |  NPM SECURITY       |
|-------------------|-------------------|-------------------|-------------------|
| [![Build1][1]][5] | [![Build2][2]][5] |  [![Build3][3]][5] | [![Build4][4]][5] |

[1]: https://travis-matrix-badges.herokuapp.com/repos/Kinvey/kinvey-cli/branches/master/1
[2]: https://travis-matrix-badges.herokuapp.com/repos/Kinvey/kinvey-cli/branches/master/2
[3]: https://travis-matrix-badges.herokuapp.com/repos/Kinvey/kinvey-cli/branches/master/3
[4]: https://travis-matrix-badges.herokuapp.com/repos/Kinvey/kinvey-cli/branches/master/4
[5]: https://travis-ci.org/Kinvey/kinvey-cli




# Kinvey CLI

Kinvey CLI is a utility for managing various aspects of your Kinvey account from the command line. Its features include:

* Deploying and managing FlexServices running on the Kinvey FlexService Runtime
* Deploying and managing websites
* Creating, listing, and deleting applications
* Creating, listing, and deleting app environments
* Creating, listing, and deleting collections

Contents:

- [Installation](#installation)
- [Usage](#usage)
- [Commands](#commands)
- [Global Options](#global-options)
- [Environment Variables](#environment-variables)
- [Getting Help](#getting-help)
- [Getting Started](#getting-started)
- [Managing Profiles](#managing-profiles)
- [Authenticating One-time Commands](#authenticating-one-time-commands)
- [Precedence of Configuration Options](#precedence-of-configuration-options)
- [Output Format](#output-format)
- [Flex Runtime Version Selection](#flex-runtime-version-selection)
- [Proxy Settings](#proxy-settings)
- [Troubleshooting](#troubleshooting)
- [Changelog](#changelog)
- [License](#license)



## Installation

Kinvey CLI is distributed as an NPM package. After you install NPM, run the following command to download and install Kinvey CLI.

    npm install -g kinvey-cli@ea-config

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

    Re-authenticates a specified profile. If you omit the profile name, the active profile is used. Prompts for password and for two-factor authentication token if needed.

* `profile show [name]`

   Shows detailed information about the specified profile. If you omit the profile name, information about the active profile is shown.

* `profile use <name>`

   Sets an active profile.
    
* `profile delete [name]`

   Deletes the specified profile or the active one if you don't specify a profile name.

* `org push <file>`

    Applies org configuration file to the specified org or to the active one.
    
    * `--org <organization>`
               
        Specifies a Kinvey organization by ID or name.

* `org list`

    Lists all existing organizations within your Kinvey account.
    
* `org show`

    Shows detailed information about the specified organization or about the active one if you don't specify an organization. You can specify an organization by ID or name.

    * `--org <organization>`
           
        Specifies a Kinvey organization by ID or name.
          
* `org use <org>`

    Sets the specified organization as active. You can specify an organization by ID or name.
    
* `org export <file>`
    
    Exports to a file the specified org or the active one.
    
    * `--org <organization>`
               
        Specifies a Kinvey organization by ID or name.
    
* `app create <name> [file]`

    Creates an application. You can specify an organization ID or name if you want to create the app within the context of an organization.
    
    * `--org <organization>`
               
        Specifies a Kinvey organization by ID or name.

* `app push <file>`
    
    Applies app configuration file to the specified app or to the active one.
    
    * `--app <application>`
               
        Specifies a Kinvey app by ID or name.
    
* `app list`

    Lists all existing applications within your Kinvey account.
    
* `app show`

    Shows detailed information about the specified application or about the active one if you don't specify an application.
    
    * `--app <application>`
           
        Specifies a Kinvey app by ID or name.

* `app use <app>`

    Sets the specified application as active. You can specify an application by ID or name.
    
* `app export <file>`

    Exports to a file the specified app or the active one.

    * `--app <application>`
               
            Specifies a Kinvey app by ID or name.
    
* `app delete`

    Deletes the specified application or the active one if you don't specify an application. You will be prompted for confirmation unless you set the `--no-prompt` flag.
    
    * `--app <application>`
               
        Specifies a Kinvey app by ID or name.
              
    * `--no-prompt`
        
        Do not ask for confirmation.

* `appenv create <name> [file]`

    Creates an environment within the active application. To use a different application, specify it using `--app`.
    
    * `--app <application>`
       
        Specifies a Kinvey app by ID or name.
      
* `appenv push <file>`

    Applies configuration (defined in file) to the specified environment or to the active one if you don't specify an environment. You can specify an environment by ID or name. By default, the command searches inside the active application but you can specify a different application using `--app`.
    
    * `--app <application>`
           
        Specifies a Kinvey app by ID or name.
        
    * `--env <environment>`
              
        Specifies a Kinvey app environment by ID or name.
    
* `appenv show`

    Shows detailed information about the specified environment or about the active one if you don't specify an environment. By default, the command searches inside the active application but you can specify a different application using `--app`.
    
    * `--env <environment>`
          
        Specifies a Kinvey app environment by ID or name.
    
    * `--app <application>`
       
        Specifies a Kinvey app by ID or name.

* `appenv use <env>`

    Sets the specified environment as active. By default, the command searches inside the active application but you can specify a different application using `--app`.
    
    * `--app <application>`
       
        Specifies a Kinvey app by ID or name.

* `appenv export <file>`
    
    Exports to a file the specified app environment or the active one.
    
    * `--env <environment>`
              
        Specifies a Kinvey app environment by ID or name.
        
    * `--app <application>`
           
        Specifies a Kinvey app by ID or name.
    
* `appenv delete`

    Deletes the specified environment or the active one if you don't specify an environment. By default, the command searches inside the active application but you can specify a different application using `--app`. You will be prompted for confirmation unless you set the `--no-prompt` flag.
    
    * `--env <environment>`
          
        Specifies a Kinvey app environment by ID or name.
    
    * `--app <application>`
       
      Specifies a Kinvey app by ID or name.
      
    * `--no-prompt`
        
        Do not ask for confirmation.

* `coll create <name>`

    Creates a collection within the active application and environment. You can specify another pair of application and environment using the `--app` and `--env` options.
    
    * `--app <application>`
       
        Specifies a Kinvey app by ID or name. Requires `--env`.
    
    * `--env <environment>`
      
        Specifies a Kinvey app environment by ID or name.
    
* `coll list`

    Lists all existing collections within the active application and environment. You can specify another pair of application and environment using the `--app` and `--env` options.

    * `--app <application>`
       
        Specifies a Kinvey app by ID or name. Requires `--env`.
    
    * `--env <environment>`
      
        Specifies a Kinvey app environment by ID or name.

* `coll delete <coll>`
    
    Deletes a collection by name within the active application and environment. You can specify another pair of application and environment using the `--app` and `--env` options. You will be prompted for confirmation unless you set the `--no-prompt` flag.

    * `--app <application>`
       
        Specifies a Kinvey app by ID or name. Requires `--env`.
    
    * `--env <environment>`
      
        Specifies a Kinvey app environment by ID or name.
      
    * `--no-prompt`
        
        Do not ask for confirmation.

* `service create <name> <file>`

    Creates a service within an application or organization (either `--app` or `--org` must be specified).
    
    * `--app <application>`
           
      Specifies a Kinvey app by ID or name.
      
    * `--org <organization>`
                
      Specifies a Kinvey organization by ID or name.

* `service push <file>`

    Applies a service configuration file to the specified service.
    
    * `--service <service>`
        
        Specifies service ID.

* `service export <file>`

    Exports the specified service to a file.
    
    * `--service <service>`
        
        Specifies service ID.

* `flex init`

   Configures Kinvey CLI to work with a specific Flex service and service environment combination through prompts. This command is designed to be executed in a Node.js project directory where it creates a `.kinvey` configuration file. Information within the file is saved per profile. Each successive execution in the same directory overwrites the respective profile section in the configuration file. This command requires that either an active profile is set or a profile is specified using the `--profile` option. Profile data options such as `--email`, `--password`, and `--instanceId` are ignored if specified. 

* `flex create <service_name>`

    Creates an internal flex service with the specified name along with a service environment. You need to specify a domain (application or organization) using the `--app` or `--org` option.

    * `--app <application>`
           
        Specifies a Kinvey app by ID or name.
          
    * `--org <organization>`
            
        Specifies a Kinvey organization by ID or name.
           
    * `--secret <secret>`
     
        Specifies a shared secret of your choice (minimum 2 characters, no leading or trailing whitespaces). If you skip this option, a random shared secret is generated for you. In the latter case, Kinvey CLI will pass the secret automatically to the Flex Runtime and print it on the screen for your information.
       
    * `--env <service environment name>`
    
        Specifies a name for the default service environment that will be created with the service. The name will be set to Development if you omit this option.
        
    * `--vars, --set-vars <environment variables>`
    
        Specifies environment variables to set. Specify either as a comma-separated list of key-value pairs (key1=value1,key2=value2) or in stringified JSON format.
        
    * `--runtime <node6|node8|node10|node12>`
    
        Specifies major Node.js version to run the project on. The minor and patch versions will vary depending on the [latest Flex Runtime updates](#flex-runtime-version-selection). Defaults to the [Kinvey-recommended Node.js version](https://devcenter.kinvey.com/guides/flexservice-runtime#environment).
        
* `flex deploy`

   Deploys the current project to the Kinvey FlexService Runtime, using the current service and service environment combination, which is the one you initiated last on the current profile. To use a different service, specify its service ID.

    * `--service <service>`
    
        Specifies service ID.
        
    * `--env <service environment>`
    
        Specifies a service environment by ID or name.
        
    * `--replace-vars <environment variables>`
    
        Overwrite the full set of existing environment variables with a new set. Specify either as a comma-separated list of key-value pairs (key1=value1,key2=value2) or in stringified JSON format.

    * `--set-vars <environment variables>`
    
        Specifies environment variables to set. If any of the variables already exist on the server, they are overwritten without prompt. Specify either as a comma-separated list of key-value pairs (key1=value1,key2=value2) or in stringified JSON format.
    
    * `--runtime <node6|node8|node10|node12>`
        
        Specifies major Node.js version to run the project on. The minor and patch versions will vary depending on the [latest Flex Runtime updates](#flex-runtime-version-selection). Defaults to the [Kinvey-recommended Node.js version](https://devcenter.kinvey.com/guides/flexservice-runtime#environment).
    
* `flex job [id]`

   _Deprecated_ Shows the job status of a deploy/recycle command. If you don't specify an `id`, the command returns the status of the most recent `flex deploy` or `flex recycle` command. _Deprecation note: For backward compatibility, the server always returns COMPLETE when the command is executed for the most recent deploy/recycle. Use `flex status` to track the progress of deploy or recycle commands._

* `flex status`

   Displays the health of the current Flex service and service environment combination, which is the one you initiated last on the current profile, as well as version information, runtime information, deployment status, etc. To get the status of a different service, specify its service ID.

    * `--service <service>`
        
        Specifies service ID.
        
    * `--env <service environment>`
        
        Specifies a service environment by ID or name.
       
* `flex show`
   
   Shows info about a service environment.
            
    * `--service <service>`
            
        Specifies service ID.
         
    * `--env <service environment>`
        
        Specifies a service environment by ID or name.
            
* `flex list`

   Lists all Flex services for a domain (app or organization), excluding external Flex services. Specify domain using `--domain` and then an app or organization ID using `--id`. If you skip the domain and ID options, the command lists the services within the domain you've configured as part of running `flex init`. In addition to the global options, this command supports the following options:

   * `--domain <app|org>`
   
        Specifies the domain type as either `app` for application or `org` for organization.
   
   * `--id <app or organization ID>`
   
        App or organization ID for use with `--domain <app|org>`.

* `flex logs`

   Retrieves and displays logs for the current Flex service environment. Log calls return 100 entries by default and can return up to 2,000 entries. Logs are displayed in the following format: `<runtime id> <timestamp> - <message>`. Combine with the paging and limiting options to narrow down your search. Logs for external Flex Services are not returned. In addition to the global options, this command supports the following options:

    * `--service <service>`
        
        Specifies service ID.
        
    * `--env <service environment>`
        
        Specifies a service environment by ID or name.
            
   * `--from`

      Timestamp specifying the beginning of a period for which you want to fetch log entries, in ISO 8601 format.

   * `--number`

      Number of entries to fetch, i.e. page size. The default is 100, the maximum allowed is 2000.

   * `--page`

      Page number to fetch. The first page is indexed 1.

   * `--to`

      Timestamp specifying the end of a period for which you want to fetch log entries, in ISO 8601 format.

* `flex update`

    Updates environment variables and/or runtime environment of the current Flex service environment, which is the one you initiated last on the current profile. To specify a different service, use `--service`. The command causes restart/rebuild of the service.

    * `--service <service>`
            
        Specifies service ID.
        
    * `--env <service environment>`
        
        Specifies a service environment by ID or name.
        
    * `--replace-vars <environment variables>`
        
        Overwrite the full set of existing environment variables with a new set. Specify either as a comma-separated list of key-value pairs (key1=value1,key2=value2) or in stringified JSON format.
    
    * `--set-vars <environment variables>`
        
        Specifies environment variables to set. If any of the variables already exist on the server, they are overwritten without prompt. Specify either as a comma-separated list of key-value pairs (key1=value1,key2=value2) or in stringified JSON format.

    * `--runtime <node6|node8|node10|node12>`
        
        Specifies major Node.js version to run the project on. The minor and patch versions will vary depending on the [latest Flex Runtime updates](#flex-runtime-version-selection). Defaults to the [Kinvey-recommended Node.js version](https://devcenter.kinvey.com/guides/flexservice-runtime#environment).

* `flex recycle`
   
   Recycles the current Flex service environment, which is the one you initiated last on the current profile. To recycle a different service, specify its service ID.

    * `--service <service>`
            
        Specifies service ID.
        
    * `--env <service environment>`
        
        Specifies a service environment by ID or name.
            
* `flex delete`

    Deletes the current Flex service, including all service environments inside it. The current service is the one you initiated last on the current profile. To delete a different service, specify its service ID. You will be prompted for confirmation unless you set the `--no-prompt` flag.
    
    * `--service <service>`
            
        Specifies service ID.
    
    * `--no-prompt`
    
        Do not ask for confirmation.

* `flex clear`

   When executed in a Node.js project directory, this command removes the current Flex Service configuration from the project.

* `website create <name>`

    Create a website. You need to specify an organization or an application.
    
    * `--app <application>`
               
        Specifies a Kinvey app by ID or name.
    
    * `--org <organization>`
                
        Specifies a Kinvey organization by ID or name.
        
    * `--historyApiRouting`
    
        Enables server support for History API routing.
        
    * `--indexPage <index-page>`
    
        Specifies index page.
        
    * `--errorPage <error-page>`
        
        Specifies error page. Not allowed if `--historyApiRouting` is also specified.
    
* `website list`

    List websites.
    
* `website show`

    Shows info for the specified website.
    
    * `--website <website>`
    
        Website ID/name. Required.

* `website deploy`

    Deploy your website.
    
    * `--website <website>`
    
        Website ID/name. Required.
        
    * `--path <path>`
    
        Path to file or directory. Required.
        
    * `--force`
        
        Skip client-side validation - deploy even if there are no files for index page and/or error page.
  
* `website publish`

    Publish your website - enable public access or change domain name.
    
    * `--website <website>`
        
        Website ID/name. Required.
      
    * `--domainName <domain-name>`
            
        Domain name. Required.
        
* `website status`

    Status of the specified website.
    
    * `--website <website>`
        
        Website ID/name. Required.

* `website unpublish`

    Unpublish your website - disable public access.
    
    * `--website <website>`
        
        Website ID/name. Required.

* `website delete`

    Deletes the specified website.
    
    * `--website <website>`
        
        Website ID/name. Required.
        
    * `--no-prompt`
        
        Do not ask for confirmation.

* `help`

   Prints general usage instructions. For detailed command usage instruction, use the `--help` option with the command.

## Global Options

You can add a global option to every Kinvey CLI command to get the described behavior. The only exceptions are `--email`, `--password`, `--instance-id` and `--2fa` which get ignored when added to a command that is designed to prompt for this information.

* `--2fa <2fa-token>`

    Two-factor authentication token. Applicable when two-factor authentication is enabled.

* `--email <e-mail>`

   Email address of your Kinvey account.

* `--help, -h`

   When used after a `kinvey-cli` command, shows its usage instructions.

* `--instance-id <instance ID>`

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

Use environment variables to specify profile information for the `profile create` command when you don't want to specify it at the command line. Keep in mind that any values specified at the command line take precedence over the environment variable values.

Command-specific options can also be specified as environment variables. You just need to prefix the name of the option with `KINVEY_CLI_`. For example, `--no-prompt` becomes `KINVEY_CLI_NO_PROMPT` as environment variable.

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

Next, you need to configure Kinvey CLI to connect to a Flex Service that you've already created using the Kinvey Console or through `kinvey flex create <service-name>`.

For the following commands, you need to switch to the Node.js project directory that you will be deploying as a Flex Service as the configuration they create and read is project-specific.

```
cd <node.js project dir>
kinvey flex init
```

Through a series of prompts, this command will ask you for a domain in which to operate (app or organization) and a Flex Service to deploy to.

Finally, you are ready to deploy your Node.js project as a Flex Service.

    kinvey flex deploy
    
Alongside the deploy you can set environment variables for your service. If both names and values are void of the equality sign (`=`) and comma (`,`), you can use the shorthand syntax:

    kinvey flex deploy --set-vars "MY_APP_A=valueA,MY_APP_B=valueB" 
    
Otherwise you need to specify environment variables in stringified JSON format:

    kinvey flex deploy --set-vars "{\"MY_APP_A\":[\"value 1\", \"value 2\"], \"MY_APP_B\":\"valueB\"}"

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

    kinvey flex status --service <service-id> --email <email> --password <password>

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

The JSON output format is suitable for cases where the output must be handled programmatically. It could be further processed using a tool like jq (command-line JSON processor). You can run any command with `--output json`. The output will then have the following format:

```
{
    "result": [result]
}
```

## Flex Runtime Version Selection

Flex projects that you deploy run server-side on the Flex Runtime which represents a preconfigured Node.js environment. When creating a project and later when running it, you can select a Node.js version for the project to run on using the `--runtime` option. To see the available runtime versions, run `kinvey flex deploy --help`.

The runtime selection is limited to the major Node.js version. The minor and patch versions are always determined by the Flex Runtime.

New Flex services deploy on the [Kinvey-recommended Node.js version](https://devcenter.kinvey.com/guides/flexservice-runtime#environment) unless otherwise specified.

After you deploy a Flex project, it remains on the same Node.js version until you upgrade it to a new major version or Kinvey decides to upgrade the project's runtime to a more recent minor and patch version because of security or efficiency reasons.

## Proxy Settings

Kinvey CLI supports the universal environment variables `HTTPS_PROXY` and `https_proxy` for routing commands through a proxy server. Set it if you are using a proxy.


    export HTTPS_PROXY=proxy.local


## Configuration management

Kinvey CLI supports the usage of configuration files (JSON format) to enable configuring certain aspects of the backend.

**Organizations** can be modified by applying an organization configuration file. The file can contain applications and org-level services.

**Applications** can be created and modified by applying an application configuration file. The file can contain app environments and app-level services.

**Environments** can be created and modified by applying an environment configuration file. The file can contain: environment-related settings, collections, business logic, roles, push settings.

**Services** can be created and modified by applying a service configuration file. Supported services: internal flex, external flex, REST, Sharepoint, Salesforce, MS SQL, SAP, ProgressData, DataDirect, Rapid health.

### Environment configuration file

The environment configuration file can be used to create a brand new environment or to modify an existing one. It is easiest to generate the file by 'exporting' an existent environment and making the necessary modifications. To export an environment run:
 
 ```
kinvey appenv export <file> [--env <env>] [--app <app>]
```

Alternatively, the environment template beneath can be used and modified as needed.

To create an environment from a configuration file run:
 ```
kinvey appenv create <envName> [file-path] [--app <AppNameOrID>]
```

To apply a configuration file to an existent environment run:
 ```
kinvey appenv push <file-path> [--env <env>] [--app <app>]
```

Before an environment config file gets applied a check will be executed to verify JSON is valid and parameter values are allowed. If the check passes successfully, Kinvey CLI will start applying the changes. In the case of a new environment it will simply try to create all the entities described in the file. 

When the file is being applied to an existent environment then existent entities could be updated and new ones can be created. The CLI won't delete any entities even if they are not included in the file. Hence, if you want to create new endpoints but don't want to modify any existent collections for example, then you can exclude them from the configuration to have the file being applied faster.

If an error occurs, the CLI stops applying the file and outputs the error message.

#### Environment sample config file

```
{
  "schemaVersion": "1.0.0",
  "configType": "environment",
  "settings": {
    "apiVersion": 3,
    "emailVerification": {
      "required": false
    }
  },
  "collections": {
    "myCollection": {
      "type": "internal",
      "permissions": "shared"
    },
    "anotherCollection": {
      "type": "external",
      "permissions": "shared",
      "service": "awesomeService",
      "serviceEnvironment": "development",
      "serviceObject": "awesomeServiceObject"
    }
  },
  "commonCode": {
    "my-common-code": {
      "code": "var commonLogic = {};\ncommonLogic.print = function print(msg) {\n  console.log(msg);\n};"
    },
    "another-common-code": {
      "codeFile": "./another-common-code.js"
    }
  },
  "collectionHooks": {
    "myCollection": {
      "onPreSave": {
        "type": "internal",
        "code": "function onPreSave(request, response, modules) {\n  response.continue();\n}"
      },
      "onPostSave": {
        "type": "external",
        "service": "awesomeService",
        "serviceEnvironment": "development",
        "handlerName": "awesomeHandler"
      }
    }
  },
  "customEndpoints": {
    "myEndpoint": {
      "type": "internal",
      "codeFile": "./my-endpoint.js",
      "schedule": {
        "start": "2019-07-22T16:35:00Z",
        "interval": "5-minutes"
      }
    },
    "anotherEndpoint": {
      "type": "external",
      "service": "awesomeService",
      "serviceEnvironment": "development",
      "handlerName": "anotherHandler"
    }
  },
  "roles": {
    "Intern": { "description": "Interns" },
    "Employee": { "description": "Employees" }
  },
  "groups": {
    "myGroup": {
      "description": "Description here",
      "groups": [ "otherGroup" ]
    },
    "otherGroup": {
      "description": "Part of 'myGroup'"
    }
  },
  "push": {
  	"android": {
  	  "senderId": "id123",
  	  "apiKey": "key123"
  	},
  	"ios": {
  	  "production": false,
  	  "certificateFilePath": "./mycertdev.p12"
  	}
  }  
}
```

#### Allowed fields:

`schemaVersion` The schema version the CLI supports. Required. Current: 1.0.0

`configType` *environment|service* The configuration type. Required.

`settings` Environment settings. Optional.

`settings.apiVersion` The default REST API version for this env.

`settings.emailVerification` Options regarding email verification for users of this environment. Optional.
                             
`settings.emailVerification.required` *true|false* If true, users who have not verified their email will not be able to access the environment. Required.

`settings.emailVerification.auto` *true|false* If true, automatically send a email verification request to all new users created within the environment. Optional.

`settings.emailVerification.since` ISO-8601 date. If specified, any user created before this date will not need a verified email in order to access the environment. Optional.

`collections` Environment collections. Optional. Object. Each first-level property is the name of a collection and contains an object describing this collection.

`collections.[collectionName].type` *internal|external* If external, then the collection is backed by a flex service. Required.

`collections.[collectionName].permissions` Collections permissions. Optional. Could be a string or an object. Allowed string values: private, full, shared, read-only. To specify roles, use an object in the following format:
```
"permissions": {
  [roleName]: {
    [operation]: [accessType]
  }
}
```
where **operation** is one of: *create, read, update, delete*

and **accessType** is one of: *never, always, grant, entity*

To specify the built-in **All users** role, use *all-users*.
 
 Example:

```
"permissions": {
  "all-users": {
    "read": "always"
  },
  "Employee": {
    "create": "always",
    "read": "always",
    "update": "always",
    "delete": "grant"
  }
}
```

`collections.[collectionName].service` Service to connect the collection to. Either service name or ID. Collection type must be set to 'external'.

`collections.[collectionName].serviceEnvironment` Service environment to connect the collection to. Collection type must be set to 'external'.

`collections.[collectionName].serviceObject` Service object. Collection type must be set to 'external'.

`commonCode` Common code functions. Optional. An object where each first-level property is the name of the common code script.

`commonCode.[commonCodeName].code` Code. Either `code` or `codeFile` must be set.
 
`commonCode.[commonCodeName].codeFile` Path to code - relative or absolute. Either `code` or `codeFile` must be set.

`collectionHooks` Collection hooks. Optional. An object where each first-level property is the name of a collection.

`collectionHooks.[collectionName].[hookName]` *onPreSave|onPreFetch|onPreDelete|onPostSave|onPostFetch|onPostDelete* Hook type.
 
`collectionHooks.[collectionName].[hookName].type` *internal|external* External if a service is involved. Required.  

`collectionHooks.[collectionName].[hookName].code` Code. Either `code` or `codeFile` can be set.

`collectionHooks.[collectionName].[hookName].codeFile` Path to code - relative or absolute. Either `code` or `codeFile` can be set.

`collectionHooks.[collectionName].[hookName].service` Service to use. Collection hook type must be set to 'external'.

`collectionHooks.[collectionName].[hookName].serviceEnvironment` Service environment to use. Collection hook type must be set to 'external'.

`collectionHooks.[collectionName].[hookName].handlerName` Handler name. Collection hook type must be set to 'external'.

`customEndpoints` Custom endpoints. Optional. Object where each first-level property is the name of an endpoint.

`customEndpoints.[endpointName].type` *internal|external* External if a service is involved. Required. 

`customEndpoints.[endpointName].code` Code. Either `code` or `codeFile` can be set.

`customEndpoints.[endpointName].codeFile` Path to code - relative or absolute. Either `code` or `codeFile` can be set.

`customEndpoints.[endpointName].service` Service to use. Endpoint type must be set to 'external'.

`customEndpoints.[endpointName].serviceEnvironment` Service environment to use. Endpoint type must be set to 'external'.

`customEndpoints.[endpointName].handlerName` Handler name. Endpoint type must be set to 'external'.

`customEndpoints.[endpointName].schedule` Object describing how to schedule the endpoint. Optional.

`customEndpoints.[endpointName].schedule.start` The code will be scheduled to start running at this date and time. ISO-8601 datetime. Required.

`customEndpoints.[endpointName].schedule.interval` *weekly|daily|hourly|30-minutes|10-minutes|5-minutes|1-minute* At what intervals to execute the code. Optional.

`roles` Roles. Optional. Object where each first-level property is the name of a role.

`roles.[roleName].description` Role description. String. Optional.

`groups` Groups. Optional. Object where each first-level property is the ID of a group. For example if the name is 'My group', then an appropriate ID could be 'myGroup' or 'my-group'.

`groups.[groupId].name` Name. Optional.

`groups.[groupId].description` Description. Optional.

`groups.[groupId].groups` Nested groups. Optional. An array of other groups IDs.

`push` Push notifications settings. Optional. Object.

`push.android` Object describing Android settings. Optional.

`push.android.senderId` Sender ID. Required.

`push.android.apiKey` API Key. Required.

`push.ios` Object describing iOS settings. Optional.

`push.ios.production` *true|false* If false, then it is a development certificate. Required.

`push.ios.certificateFilePath` Path to certificate - relative or absolute. Required.

`push.ios.password` Certificate password. Optional.

### Service configuration file

The service configuration file can be used to create a brand new service or to modify an existing one (excluding Auth services).

To create a service from a configuration file run:
 ```
kinvey service create <serviceName> <file-path> [--app AppNameOrId|--org OrgNameOrId]
```

Either `--app` or `--org` option must be set. The service will be accessible only to the chosen application or organization respectively.

To apply a configuration file to an existent service run:
 ```
kinvey service push <file-path> (--service <service-ID>)
``` 

When a new internal flex service is created the CLI will attempt a deploy if `sourcePath` is set. 

When an existent internal flex service is updated and `sourcePath` is set, the CLI will attempt to deploy only if the version defined in `package.json` is higher then the cloud version. Otherwise, deployment procedure will be skipped.

#### Service sample config file

The following service template can be used and modified as needed:

```
{
  "schemaVersion": "1.0.0",
  "configType": "service",
  "type": "flex-internal",
  "environments": {
    "dev": {
      "secret": "123",
      "description": "Some description here",
      "environmentVariables": {
        "MY_KEY": "my value"
      }
    }
  }
}
```

#### Allowed fields:

`schemaVersion` The schema version the CLI supports. Required. Current: 1.0.0

`configType` *environment|service* The configuration type. Required.

`type` *flex-internal|flex-external|rest|sharepoint|salesforce|mssql|sap|progressData|dataDirect|rapid-health* Service type. Required.
 
`description` Service description. String. Optional.
 
`environments` Service environments. Object where each first-level property is the name of a service environment. Optional.
 
 `environments.[envName].secret` Shared secret to use when communicating with the service.
 
`environments.[envName].host` URI pointing to the service server's location. Required when `type` is 'flex-external'.

`environments.[envName].sourcePath` Path to source code - relative or absolute. Optional. Applicable when `type` is 'flex-internal'.

`environments.[envName].environmentVariables` Environment variables. Object. Optional.

## Troubleshooting

Run any command with the `--verbose` flag to receive more detailed information about a command execution.

### Caveats

Kinvey CLI is a subject to the following caveats:

- The CLI has a 10-second request timeout when communicating with the backend for initialization which may cause a connection error in some rare cases. Retrying the command remedies the problem in many cases.
- If you are using a profile that has been configured a while ago, you may stumble upon the `InvalidCredentials` error. It may mean that the session token has expired. See [Authentication Token Expiration](#authentication-token-expiration) for details.
- You cannot deploy the same service version to the FlexService Runtime more than once. You must increment the version in `package.json` before redeploying.
- Kinvey CLI sends binary data (content type "multipart/form-data") during the deploy process. The deploy job will fail if traffic of this type is blocked within your network.
- There is a limit of 100 MB to the size of the FlexService logs that are kept on the backend. When log entries exceed that size, the oldest ones are deleted.
- Running the CLI from Git Bash on Windows is known to cause issues ranging from failing commands to complete inability to start. Use Windows Command Prompt instead.

If problems persist, contact [Kinvey](http://support.kinvey.com).

### Support for Service Environments

Kinvey CLI version 4.1.0 introduces support for environments inside Flex services coinciding with the release of this feature on the backend. When upgrading from a previous Kinvey CLI version, have the following caveats in mind:

- The `flex init` interactive command prompts for service environment selection in version 4.1.0 and later if the service contains multiple environments.
- Node.js projects configured with `flex init` with a Kinvey CLI version predating 4.1.0 do not contain a service environment ID. Therefore:
    - We recommend rerunning the `flex init` command on these projects.
    - Flex commands targeting the current service will continue to work as long as the service has a single environment.
    - Flex commands targeting the current service will error out if you create additional environments inside the service and don't include `--env`.
- Flex commands specifying a particular service using `--service` must include `--env` if the service has multiple environments. You can omit `--env` if the service has a single environment.

## Changelog

See the [Changelog](./CHANGELOG.md) for a list of changes.

## License

    Copyright (c) 2018, Kinvey, Inc. All rights reserved.

    This software is licensed to you under the Kinvey terms of service located at
    http://www.kinvey.com/terms-of-use. By downloading, accessing and/or using this
    software, you hereby accept such terms of service  (and any agreement referenced
    therein) and agree that you have read, understand and agree to be bound by such
    terms of service and are of legal age to agree to such terms with Kinvey.

    This software contains valuable confidential and proprietary information of
    KINVEY, INC and is subject to applicable licensing agreements.
    Unauthorized reproduction, transmission or distribution of this file and its
    contents is a violation of applicable laws.
