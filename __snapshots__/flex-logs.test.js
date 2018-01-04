exports['flex logs without query by specifying a profile and existent serviceId without query should succeed 1'] = `
debug:  Checking for package updates
debug:  Request:  GET http://localhost:3234/v2/data-links/12378kdl2/logs
debug:  Response: GET http://localhost:3234/v2/data-links/12378kdl2/logs 200
3864f1602739 2017-08-30T08:06:49.594Z - "*** Running /etc/my_init.d/00_regen_ssh_host_keys.sh..."
3864f1602739 2017-08-30T08:06:49.594Z - "*** Running /etc/rc.local..."
3864f1602739 2017-08-30T08:06:49.595Z - "*** Runit started as PID 11"
3864f1602739 2017-08-30T08:06:49.595Z - "*** Booting runit daemon..."
3864f1602739 2017-08-30T08:06:49.595Z - "chown: changing ownership of '/dev/xconsole': Operation not permitted"
Query returned 5 logs for FSR service 12378kdl2

`

exports['flex logs without query by specifying a profile and non-existent serviceId should fail 1'] = `
debug:  Checking for package updates
debug:  Request:  GET http://localhost:3234/v2/data-links/12serviceIdThatDoesntExist/logs
debug:  Response: GET http://localhost:3234/v2/data-links/12serviceIdThatDoesntExist/logs 404
error:  DataLinkNotFound: The specified data link could not be found.

`

exports['flex logs without query by specifying a profile when valid project is set without serviceId as an option should succeed 1'] = `
debug:  Checking for package updates
debug:  Request:  GET http://localhost:3234/v2/data-links/12378kdl2/logs
debug:  Response: GET http://localhost:3234/v2/data-links/12378kdl2/logs 200
3864f1602739 2017-08-30T08:06:49.594Z - "*** Running /etc/my_init.d/00_regen_ssh_host_keys.sh..."
3864f1602739 2017-08-30T08:06:49.594Z - "*** Running /etc/rc.local..."
3864f1602739 2017-08-30T08:06:49.595Z - "*** Runit started as PID 11"
3864f1602739 2017-08-30T08:06:49.595Z - "*** Booting runit daemon..."
3864f1602739 2017-08-30T08:06:49.595Z - "chown: changing ownership of '/dev/xconsole': Operation not permitted"
Query returned 5 logs for FSR service 12378kdl2 (TestKinveyDatalink)

`

exports['flex logs without query by specifying a profile when invalid project is set with existent serviceId as an option should succeed 1'] = `
debug:  Checking for package updates
debug:  Request:  GET http://localhost:3234/v2/data-links/12378kdl2/logs
debug:  Response: GET http://localhost:3234/v2/data-links/12378kdl2/logs 200
3864f1602739 2017-08-30T08:06:49.594Z - "*** Running /etc/my_init.d/00_regen_ssh_host_keys.sh..."
3864f1602739 2017-08-30T08:06:49.594Z - "*** Running /etc/rc.local..."
3864f1602739 2017-08-30T08:06:49.595Z - "*** Runit started as PID 11"
3864f1602739 2017-08-30T08:06:49.595Z - "*** Booting runit daemon..."
3864f1602739 2017-08-30T08:06:49.595Z - "chown: changing ownership of '/dev/xconsole': Operation not permitted"
Query returned 5 logs for FSR service 12378kdl2

`

exports['flex logs without query by specifying a profile when project is not set without serviceId as an option should fail 1'] = `
Note:  Version 1.x [from] and [to] params have been converted to options. Use
'--from' and '--to' to filter by timestamp instead.

Options:
  --version                 Show version number                        [boolean]
  --email                   E-mail address of your Kinvey account       [string]
  --password                Password of your Kinvey account             [string]
  --host                    Kinvey dedicated instance hostname          [string]
  --profile                 Profile to use                              [string]
  --silent                  Do not output anything                     [boolean]
  --suppress-version-check  Do not check for package updates           [boolean]
  --verbose                 Output debug messages                      [boolean]
  -h, --help                Show help                                  [boolean]
  --serviceId               Service ID                                  [string]
  --from                    Fetch log entries starting from provided timestamp
                                                                        [string]
  --to                      Fetch log entries up to provided timestamp  [string]
  --page                    Page (non-zero integer, default=1)          [number]
  --number                  Number of entries to fetch, i.e. page size (non-zero
                            integer, default=100, max=2000)             [number]

This project is not configured. Use 'kinvey flex init' to get started.

`

exports['flex logs without query by not specifying profile nor credentials when one profile and existent serviceId should succeed 1'] = `
debug:  Checking for package updates
debug:  Request:  GET http://localhost:3234/v2/data-links/12378kdl2/logs
debug:  Response: GET http://localhost:3234/v2/data-links/12378kdl2/logs 200
3864f1602739 2017-08-30T08:06:49.594Z - "*** Running /etc/my_init.d/00_regen_ssh_host_keys.sh..."
3864f1602739 2017-08-30T08:06:49.594Z - "*** Running /etc/rc.local..."
3864f1602739 2017-08-30T08:06:49.595Z - "*** Runit started as PID 11"
3864f1602739 2017-08-30T08:06:49.595Z - "*** Booting runit daemon..."
3864f1602739 2017-08-30T08:06:49.595Z - "chown: changing ownership of '/dev/xconsole': Operation not permitted"
Query returned 5 logs for FSR service 12378kdl2

`

exports['flex logs without query by not specifying profile nor credentials when several profiles and existent serviceId should fail 1'] = `
Note:  Version 1.x [from] and [to] params have been converted to options. Use
'--from' and '--to' to filter by timestamp instead.

Options:
  --version                 Show version number                        [boolean]
  --email                   E-mail address of your Kinvey account       [string]
  --password                Password of your Kinvey account             [string]
  --host                    Kinvey dedicated instance hostname          [string]
  --profile                 Profile to use                              [string]
  --silent                  Do not output anything                     [boolean]
  --suppress-version-check  Do not check for package updates           [boolean]
  --verbose                 Output debug messages                      [boolean]
  -h, --help                Show help                                  [boolean]
  --serviceId               Service ID                                  [string]
  --from                    Fetch log entries starting from provided timestamp
                                                                        [string]
  --to                      Fetch log entries up to provided timestamp  [string]
  --page                    Page (non-zero integer, default=1)          [number]
  --number                  Number of entries to fetch, i.e. page size (non-zero
                            integer, default=100, max=2000)             [number]

You must be authenticated.

`

exports['flex logs without query by specifying credentials as options when valid and existent serviceId should succeed 1'] = `
debug:  Checking for package updates
debug:  Request:  POST http://localhost:3234/session
debug:  Response: POST http://localhost:3234/session 200
debug:  Request:  GET http://localhost:3234/v2/data-links/12378kdl2/logs
debug:  Response: GET http://localhost:3234/v2/data-links/12378kdl2/logs 200
3864f1602739 2017-08-30T08:06:49.594Z - "*** Running /etc/my_init.d/00_regen_ssh_host_keys.sh..."
3864f1602739 2017-08-30T08:06:49.594Z - "*** Running /etc/rc.local..."
3864f1602739 2017-08-30T08:06:49.595Z - "*** Runit started as PID 11"
3864f1602739 2017-08-30T08:06:49.595Z - "*** Booting runit daemon..."
3864f1602739 2017-08-30T08:06:49.595Z - "chown: changing ownership of '/dev/xconsole': Operation not permitted"
Query returned 5 logs for FSR service 12378kdl2
debug:  Request:  DELETE http://localhost:3234/session
debug:  Response: DELETE http://localhost:3234/session 204
debug:  Logged out current user.

`

exports['flex logs without query by specifying credentials as options when valid and non-existent serviceId should fail 1'] = `
debug:  Checking for package updates
debug:  Request:  POST http://localhost:3234/session
debug:  Response: POST http://localhost:3234/session 200
debug:  Request:  GET http://localhost:3234/v2/data-links/12serviceIdThatDoesntExist/logs
debug:  Response: GET http://localhost:3234/v2/data-links/12serviceIdThatDoesntExist/logs 404
debug:  Request:  DELETE http://localhost:3234/session
debug:  Response: DELETE http://localhost:3234/session 204
debug:  Logged out current user.
error:  DataLinkNotFound: The specified data link could not be found.

`

exports['flex logs without query by specifying credentials as options when invalid and existent serviceId should fail 1'] = `
debug:  Checking for package updates
debug:  Request:  POST http://localhost:3234/session
debug:  Response: POST http://localhost:3234/session 401
error:  InvalidCredentials: Credentials are invalid. Please authenticate.

`

exports['flex logs with query with valid timestamps and valid paging should succeed 1'] = `
debug:  Checking for package updates
debug:  Request:  GET http://localhost:3234/v2/data-links/12378kdl2/logs?from=2017-08-30T08:06:49.594Z&to=2017-09-02T08:06:49&limit=5&page=3
debug:  Response: GET http://localhost:3234/v2/data-links/12378kdl2/logs?from=2017-08-30T08:06:49.594Z&to=2017-09-02T08:06:49&limit=5&page=3 200
3864f1602739 2017-08-30T08:06:49.594Z - "*** Running /etc/my_init.d/00_regen_ssh_host_keys.sh..."
3864f1602739 2017-08-30T08:06:49.594Z - "*** Running /etc/rc.local..."
3864f1602739 2017-08-30T08:06:49.595Z - "*** Runit started as PID 11"
3864f1602739 2017-08-30T08:06:49.595Z - "*** Booting runit daemon..."
3864f1602739 2017-08-30T08:06:49.595Z - "chown: changing ownership of '/dev/xconsole': Operation not permitted"
Query returned 5 logs for FSR service 12378kdl2

`

exports['flex logs with query with valid timestamps and without paging should succeed 1'] = `
debug:  Checking for package updates
debug:  Request:  GET http://localhost:3234/v2/data-links/12378kdl2/logs?from=2017-08-30T08:06:49.594Z&to=2017-09-02T08:06:49.000Z
debug:  Response: GET http://localhost:3234/v2/data-links/12378kdl2/logs?from=2017-08-30T08:06:49.594Z&to=2017-09-02T08:06:49.000Z 200
3864f1602739 2017-08-30T08:06:49.594Z - "*** Running /etc/my_init.d/00_regen_ssh_host_keys.sh..."
3864f1602739 2017-08-30T08:06:49.594Z - "*** Running /etc/rc.local..."
3864f1602739 2017-08-30T08:06:49.595Z - "*** Runit started as PID 11"
3864f1602739 2017-08-30T08:06:49.595Z - "*** Booting runit daemon..."
3864f1602739 2017-08-30T08:06:49.595Z - "chown: changing ownership of '/dev/xconsole': Operation not permitted"
Query returned 5 logs for FSR service 12378kdl2

`

exports['flex logs with query with valid timestamps and invalid paging should fail 1'] = `
debug:  Checking for package updates
error:  InvalidParameter: Logs 'page' flag invalid (non-zero integer expected)

`

exports['flex logs with query with valid start timestamp and nothing else should succeed 1'] = `
debug:  Checking for package updates
debug:  Request:  GET http://localhost:3234/v2/data-links/12378kdl2/logs?from=2017-08-30T08:06:49.594Z
debug:  Response: GET http://localhost:3234/v2/data-links/12378kdl2/logs?from=2017-08-30T08:06:49.594Z 200
3864f1602739 2017-08-30T08:06:49.594Z - "*** Running /etc/my_init.d/00_regen_ssh_host_keys.sh..."
3864f1602739 2017-08-30T08:06:49.594Z - "*** Running /etc/rc.local..."
3864f1602739 2017-08-30T08:06:49.595Z - "*** Runit started as PID 11"
3864f1602739 2017-08-30T08:06:49.595Z - "*** Booting runit daemon..."
3864f1602739 2017-08-30T08:06:49.595Z - "chown: changing ownership of '/dev/xconsole': Operation not permitted"
Query returned 5 logs for FSR service 12378kdl2

`

exports['flex logs with query with invalid start timestamp and nothing else should fail 1'] = `
debug:  Checking for package updates
error:  InvalidParameter: Logs 'from' flag invalid (ISO-8601 timestamp expected)

`

exports['flex logs with query without timestamps and valid paging should succeed 1'] = `
debug:  Checking for package updates
debug:  Request:  GET http://localhost:3234/v2/data-links/12378kdl2/logs?limit=5&page=3
debug:  Response: GET http://localhost:3234/v2/data-links/12378kdl2/logs?limit=5&page=3 200
3864f1602739 2017-08-30T08:06:49.594Z - "*** Running /etc/my_init.d/00_regen_ssh_host_keys.sh..."
3864f1602739 2017-08-30T08:06:49.594Z - "*** Running /etc/rc.local..."
3864f1602739 2017-08-30T08:06:49.595Z - "*** Runit started as PID 11"
3864f1602739 2017-08-30T08:06:49.595Z - "*** Booting runit daemon..."
3864f1602739 2017-08-30T08:06:49.595Z - "chown: changing ownership of '/dev/xconsole': Operation not permitted"
Query returned 5 logs for FSR service 12378kdl2

`

exports['flex logs with query without timestamps and page but with valid size should succeed 1'] = `
debug:  Checking for package updates
debug:  Request:  GET http://localhost:3234/v2/data-links/12378kdl2/logs?limit=35
debug:  Response: GET http://localhost:3234/v2/data-links/12378kdl2/logs?limit=35 200
3864f1602739 2017-08-30T08:06:49.594Z - "*** Running /etc/my_init.d/00_regen_ssh_host_keys.sh..."
3864f1602739 2017-08-30T08:06:49.594Z - "*** Running /etc/rc.local..."
3864f1602739 2017-08-30T08:06:49.595Z - "*** Runit started as PID 11"
3864f1602739 2017-08-30T08:06:49.595Z - "*** Booting runit daemon..."
3864f1602739 2017-08-30T08:06:49.595Z - "chown: changing ownership of '/dev/xconsole': Operation not permitted"
Query returned 5 logs for FSR service 12378kdl2

`
