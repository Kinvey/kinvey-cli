exports['flex logs without query by specifying a profile and existent serviceId without query should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToGetLogs'
[debug] Project configuration file not found: 'projectSetupPath'.
[debug] Request:  GET http://localhost:3234/v3/services/12378kdl2/logs
[debug] Response: GET http://localhost:3234/v3/services/12378kdl2/logs 200
Count: 5

containerId   timestamp                 threshold  message                                                
------------  ------------------------  ---------  -------------------------------------------------------
3864f1602739  2017-08-30T08:06:49.594Z  null       *** Running /etc/my_init.d/00_regen_ssh_host_keys.sh...
3864f1602739  2017-08-30T08:06:49.594Z  null       *** Running /etc/rc.local...                           
3864f1602739  2017-08-30T08:06:49.595Z  null       *** Runit started as PID 11                            
3864f1602739  2017-08-30T08:06:49.595Z  warn       *** Booting runit daemon...                            
3864f1602739  2017-08-30T08:06:49.595Z  info       {"name":"test","num":10}                               



`

exports['flex logs without query by specifying a profile and non-existent serviceId should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToGetLogs'
[debug] Project configuration file not found: 'projectSetupPath'.
[debug] Request:  GET http://localhost:3234/v3/services/12serviceIdThatDoesntExist/logs
[debug] Response: GET http://localhost:3234/v3/services/12serviceIdThatDoesntExist/logs 404
[error] ServiceNotFound: The specified service could not be found.

`

exports['flex logs without query by specifying a profile when valid project is set without serviceId as an option should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToGetLogs'
[debug] Request:  GET http://localhost:3234/v3/services/12378kdl2/logs
[debug] Response: GET http://localhost:3234/v3/services/12378kdl2/logs 200
Count: 5

containerId   timestamp                 threshold  message                                                
------------  ------------------------  ---------  -------------------------------------------------------
3864f1602739  2017-08-30T08:06:49.594Z  null       *** Running /etc/my_init.d/00_regen_ssh_host_keys.sh...
3864f1602739  2017-08-30T08:06:49.594Z  null       *** Running /etc/rc.local...                           
3864f1602739  2017-08-30T08:06:49.595Z  null       *** Runit started as PID 11                            
3864f1602739  2017-08-30T08:06:49.595Z  warn       *** Booting runit daemon...                            
3864f1602739  2017-08-30T08:06:49.595Z  info       {"name":"test","num":10}                               



`

exports['flex logs without query by specifying a profile when invalid project is set with existent serviceId as an option should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToGetLogs'
[debug] Request:  GET http://localhost:3234/v3/services/12378kdl2/logs
[debug] Response: GET http://localhost:3234/v3/services/12378kdl2/logs 200
Count: 5

containerId   timestamp                 threshold  message                                                
------------  ------------------------  ---------  -------------------------------------------------------
3864f1602739  2017-08-30T08:06:49.594Z  null       *** Running /etc/my_init.d/00_regen_ssh_host_keys.sh...
3864f1602739  2017-08-30T08:06:49.594Z  null       *** Running /etc/rc.local...                           
3864f1602739  2017-08-30T08:06:49.595Z  null       *** Runit started as PID 11                            
3864f1602739  2017-08-30T08:06:49.595Z  warn       *** Booting runit daemon...                            
3864f1602739  2017-08-30T08:06:49.595Z  info       {"name":"test","num":10}                               



`

exports['flex logs without query by specifying a profile when project is not set without serviceId as an option should fail 1'] = `
kinvey flex logs [serviceId]

Retrieve and display Internal Flex Service logs

Positionals:
  serviceId  Service ID                                                 [string]

Options:
  --version                 Show version number                        [boolean]
  --email                   E-mail address of your Kinvey account       [string]
  --password                Password of your Kinvey account             [string]
  --2fa, --2Fa              Two-factor authentication token             [string]
  --instanceId              Instance ID                                 [string]
  --profile                 Profile to use                              [string]
  --output                  Output format             [string] [choices: "json"]
  --silent                  Do not output anything                     [boolean]
  --suppress-version-check  Do not check for package updates           [boolean]
  --verbose                 Output debug messages                      [boolean]
  --no-color                Disable colors                             [boolean]
  -h, --help                Show help                                  [boolean]
  --from                    Fetch log entries starting from provided timestamp
                                                                        [string]
  --to                      Fetch log entries up to provided timestamp  [string]
  --page                    Page (non-zero integer, default=1)          [number]
  --number, -n              Number of entries to fetch, i.e. page size (non-zero
                            integer, default=100, max=2000)             [number]

This project is not configured. Use 'kinvey flex init' to get started. Alternatively, use positional arguments: serviceId.

`

exports['flex logs without query by not specifying profile nor credentials when one profile and existent serviceId should succeed and output default format 1'] = `
[debug] Checking for package updates
[debug] Using profile 'flexLogsProfile'
[debug] Project configuration file not found: 'projectSetupPath'.
[debug] Request:  GET http://localhost:3234/v3/services/12378kdl2/logs
[debug] Response: GET http://localhost:3234/v3/services/12378kdl2/logs 200
Count: 5

containerId   timestamp                 threshold  message                                                
------------  ------------------------  ---------  -------------------------------------------------------
3864f1602739  2017-08-30T08:06:49.594Z  null       *** Running /etc/my_init.d/00_regen_ssh_host_keys.sh...
3864f1602739  2017-08-30T08:06:49.594Z  null       *** Running /etc/rc.local...                           
3864f1602739  2017-08-30T08:06:49.595Z  null       *** Runit started as PID 11                            
3864f1602739  2017-08-30T08:06:49.595Z  warn       *** Booting runit daemon...                            
3864f1602739  2017-08-30T08:06:49.595Z  info       {"name":"test","num":10}                               



`

exports['flex logs without query by not specifying profile nor credentials when one profile and existent serviceId should succeed and output JSON 1'] = `
{
  "result": [
    {
      "_id": "59a672196e911be44f10ba45",
      "containerId": "3864f1602739e924b257c7082f9e5c7bcd0b43d8986efe3acb4581f4f94dcd65",
      "message": "*** Running /etc/my_init.d/00_regen_ssh_host_keys.sh...",
      "threshold": null,
      "timestamp": "2017-08-30T08:06:49.594Z"
    },
    {
      "_id": "59a672190ebdf7a9387befc8",
      "containerId": "3864f1602739e924b257c7082f9e5c7bcd0b43d8986efe3acb4581f4f94dcd65",
      "message": "*** Running /etc/rc.local...",
      "threshold": null,
      "timestamp": "2017-08-30T08:06:49.594Z"
    },
    {
      "_id": "59a67219d49d8e843fb61b14",
      "containerId": "3864f1602739e924b257c7082f9e5c7bcd0b43d8986efe3acb4581f4f94dcd65",
      "message": "*** Runit started as PID 11",
      "threshold": null,
      "timestamp": "2017-08-30T08:06:49.595Z"
    },
    {
      "_id": "59a67219a86d05de4f97ea31",
      "containerId": "3864f1602739e924b257c7082f9e5c7bcd0b43d8986efe3acb4581f4f94dcd65",
      "message": "*** Booting runit daemon...",
      "threshold": "warn",
      "timestamp": "2017-08-30T08:06:49.595Z"
    },
    {
      "_id": "59a672197f2a6ba14ec962e8",
      "containerId": "3864f1602739e924b257c7082f9e5c7bcd0b43d8986efe3acb4581f4f94dcd65",
      "message": {
        "name": "test",
        "num": 10
      },
      "threshold": "info",
      "timestamp": "2017-08-30T08:06:49.595Z"
    }
  ]
}

`

exports['flex logs without query by not specifying profile nor credentials when several profiles and existent serviceId should fail 1'] = `
kinvey flex logs [serviceId]

Retrieve and display Internal Flex Service logs

Positionals:
  serviceId  Service ID                                                 [string]

Options:
  --version                 Show version number                        [boolean]
  --email                   E-mail address of your Kinvey account       [string]
  --password                Password of your Kinvey account             [string]
  --2fa, --2Fa              Two-factor authentication token             [string]
  --instanceId              Instance ID                                 [string]
  --profile                 Profile to use                              [string]
  --output                  Output format             [string] [choices: "json"]
  --silent                  Do not output anything                     [boolean]
  --suppress-version-check  Do not check for package updates           [boolean]
  --verbose                 Output debug messages                      [boolean]
  --no-color                Disable colors                             [boolean]
  -h, --help                Show help                                  [boolean]
  --from                    Fetch log entries starting from provided timestamp
                                                                        [string]
  --to                      Fetch log entries up to provided timestamp  [string]
  --page                    Page (non-zero integer, default=1)          [number]
  --number, -n              Number of entries to fetch, i.e. page size (non-zero
                            integer, default=100, max=2000)             [number]

You must be authenticated.

`

exports['flex logs without query by specifying credentials as options when valid and existent serviceId should succeed 1'] = `
[debug] Checking for package updates
[debug] Logging in user: janeyDoe@mail.com
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 200
[debug] Request:  GET http://localhost:3234/v3/services/12378kdl2/logs
[debug] Response: GET http://localhost:3234/v3/services/12378kdl2/logs 200
[debug] Request:  DELETE http://localhost:3234/session
[debug] Response: DELETE http://localhost:3234/session 204
[debug] Logged out current user.
Count: 5

containerId   timestamp                 threshold  message                                                
------------  ------------------------  ---------  -------------------------------------------------------
3864f1602739  2017-08-30T08:06:49.594Z  null       *** Running /etc/my_init.d/00_regen_ssh_host_keys.sh...
3864f1602739  2017-08-30T08:06:49.594Z  null       *** Running /etc/rc.local...                           
3864f1602739  2017-08-30T08:06:49.595Z  null       *** Runit started as PID 11                            
3864f1602739  2017-08-30T08:06:49.595Z  warn       *** Booting runit daemon...                            
3864f1602739  2017-08-30T08:06:49.595Z  info       {"name":"test","num":10}                               



`

exports['flex logs without query by specifying credentials as options when valid and non-existent serviceId should fail 1'] = `
[debug] Checking for package updates
[debug] Logging in user: janeyDoe@mail.com
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 200
[debug] Request:  GET http://localhost:3234/v3/services/12serviceIdThatDoesntExist/logs
[debug] Response: GET http://localhost:3234/v3/services/12serviceIdThatDoesntExist/logs 404
[debug] Request:  DELETE http://localhost:3234/session
[debug] Response: DELETE http://localhost:3234/session 204
[debug] Logged out current user.
[error] ServiceNotFound: The specified service could not be found.

`

exports['flex logs without query by specifying credentials as options when invalid and existent serviceId should fail 1'] = `
[debug] Checking for package updates
[debug] Logging in user: johnDoe@mail.com
[debug] Request:  POST http://localhost:3234/session
[debug] Response: POST http://localhost:3234/session 401
[error] InvalidCredentials: Credentials are invalid. Please authenticate.

`

exports['flex logs with query with valid timestamps and valid paging should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToSetAsActive'
[debug] Project configuration file not found: 'projectSetupPath'.
[debug] Request:  GET http://localhost:3234/v3/services/12378kdl2/logs?from=2017-08-30T08:06:49.594Z&to=2017-09-02T08:06:49&limit=5&page=3
[debug] Response: GET http://localhost:3234/v3/services/12378kdl2/logs?from=2017-08-30T08:06:49.594Z&to=2017-09-02T08:06:49&limit=5&page=3 200
Count: 5

containerId   timestamp                 threshold  message                                                
------------  ------------------------  ---------  -------------------------------------------------------
3864f1602739  2017-08-30T08:06:49.594Z  null       *** Running /etc/my_init.d/00_regen_ssh_host_keys.sh...
3864f1602739  2017-08-30T08:06:49.594Z  null       *** Running /etc/rc.local...                           
3864f1602739  2017-08-30T08:06:49.595Z  null       *** Runit started as PID 11                            
3864f1602739  2017-08-30T08:06:49.595Z  warn       *** Booting runit daemon...                            
3864f1602739  2017-08-30T08:06:49.595Z  info       {"name":"test","num":10}                               



`

exports['flex logs with query with valid timestamps and without paging should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToSetAsActive'
[debug] Project configuration file not found: 'projectSetupPath'.
[debug] Request:  GET http://localhost:3234/v3/services/12378kdl2/logs?from=2017-08-30T08:06:49.594Z&to=2017-09-02T08:06:49.000Z
[debug] Response: GET http://localhost:3234/v3/services/12378kdl2/logs?from=2017-08-30T08:06:49.594Z&to=2017-09-02T08:06:49.000Z 200
Count: 5

containerId   timestamp                 threshold  message                                                
------------  ------------------------  ---------  -------------------------------------------------------
3864f1602739  2017-08-30T08:06:49.594Z  null       *** Running /etc/my_init.d/00_regen_ssh_host_keys.sh...
3864f1602739  2017-08-30T08:06:49.594Z  null       *** Running /etc/rc.local...                           
3864f1602739  2017-08-30T08:06:49.595Z  null       *** Runit started as PID 11                            
3864f1602739  2017-08-30T08:06:49.595Z  warn       *** Booting runit daemon...                            
3864f1602739  2017-08-30T08:06:49.595Z  info       {"name":"test","num":10}                               



`

exports['flex logs with query with valid timestamps and invalid paging should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToSetAsActive'
[debug] Project configuration file not found: 'projectSetupPath'.
[error] InvalidParameter: Logs 'page' flag invalid (non-zero integer expected)

`

exports['flex logs with query with valid start timestamp and nothing else should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToSetAsActive'
[debug] Project configuration file not found: 'projectSetupPath'.
[debug] Request:  GET http://localhost:3234/v3/services/12378kdl2/logs?from=2017-08-30T08:06:49.594Z
[debug] Response: GET http://localhost:3234/v3/services/12378kdl2/logs?from=2017-08-30T08:06:49.594Z 200
Count: 5

containerId   timestamp                 threshold  message                                                
------------  ------------------------  ---------  -------------------------------------------------------
3864f1602739  2017-08-30T08:06:49.594Z  null       *** Running /etc/my_init.d/00_regen_ssh_host_keys.sh...
3864f1602739  2017-08-30T08:06:49.594Z  null       *** Running /etc/rc.local...                           
3864f1602739  2017-08-30T08:06:49.595Z  null       *** Runit started as PID 11                            
3864f1602739  2017-08-30T08:06:49.595Z  warn       *** Booting runit daemon...                            
3864f1602739  2017-08-30T08:06:49.595Z  info       {"name":"test","num":10}                               



`

exports['flex logs with query with invalid start timestamp and nothing else should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToSetAsActive'
[debug] Project configuration file not found: 'projectSetupPath'.
[error] InvalidParameter: Logs 'from' flag invalid (ISO-8601 timestamp expected)

`

exports['flex logs with query with invalid timestamps (\'from\' not before \'to\') and nothing else should fail 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToSetAsActive'
[debug] Project configuration file not found: 'projectSetupPath'.
[error] InvalidParameter: 'from' timestamp must be before 'to' timestamp.

`

exports['flex logs with query without timestamps and valid paging should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToSetAsActive'
[debug] Project configuration file not found: 'projectSetupPath'.
[debug] Request:  GET http://localhost:3234/v3/services/12378kdl2/logs?limit=5&page=3
[debug] Response: GET http://localhost:3234/v3/services/12378kdl2/logs?limit=5&page=3 200
Count: 5

containerId   timestamp                 threshold  message                                                
------------  ------------------------  ---------  -------------------------------------------------------
3864f1602739  2017-08-30T08:06:49.594Z  null       *** Running /etc/my_init.d/00_regen_ssh_host_keys.sh...
3864f1602739  2017-08-30T08:06:49.594Z  null       *** Running /etc/rc.local...                           
3864f1602739  2017-08-30T08:06:49.595Z  null       *** Runit started as PID 11                            
3864f1602739  2017-08-30T08:06:49.595Z  warn       *** Booting runit daemon...                            
3864f1602739  2017-08-30T08:06:49.595Z  info       {"name":"test","num":10}                               



`

exports['flex logs with query without timestamps and page but with valid size should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'profileToSetAsActive'
[debug] Project configuration file not found: 'projectSetupPath'.
[debug] Request:  GET http://localhost:3234/v3/services/12378kdl2/logs?limit=35
[debug] Response: GET http://localhost:3234/v3/services/12378kdl2/logs?limit=35 200
Count: 5

containerId   timestamp                 threshold  message                                                
------------  ------------------------  ---------  -------------------------------------------------------
3864f1602739  2017-08-30T08:06:49.594Z  null       *** Running /etc/my_init.d/00_regen_ssh_host_keys.sh...
3864f1602739  2017-08-30T08:06:49.594Z  null       *** Running /etc/rc.local...                           
3864f1602739  2017-08-30T08:06:49.595Z  null       *** Runit started as PID 11                            
3864f1602739  2017-08-30T08:06:49.595Z  warn       *** Booting runit daemon...                            
3864f1602739  2017-08-30T08:06:49.595Z  info       {"name":"test","num":10}                               



`
