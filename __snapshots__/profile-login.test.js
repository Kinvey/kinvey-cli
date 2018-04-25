exports['profile login without active profile when no profiles and none specified should fail 1'] = `
[debug] Checking for package updates
[error] ItemNotSpecified: No profile identifier is specified and active profile is not set.

`

exports['profile login without active profile when several profiles and none specified should fail 1'] = `
[debug] Checking for package updates
[error] ItemNotSpecified: No profile identifier is specified and active profile is not set.

`

exports['profile login without active profile when several profiles and non-existent specified should fail 1'] = `
[debug] Checking for package updates
[error] ProfileNotFound: Profile not found. Please verify profile name exists.

`
