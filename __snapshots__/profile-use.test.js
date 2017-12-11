exports['profile use with existent name when several should succeed 1'] = `
debug:  Checking for package updates
debug:  Writing JSON to file globalSetupPath
debug:  Writing contents to file globalSetupPath
info:  Active profile is set to 'testProfileUse0'.

`

exports['profile use with existent name when one should succeed 1'] = `
debug:  Checking for package updates
debug:  Writing JSON to file globalSetupPath
debug:  Writing contents to file globalSetupPath
info:  Active profile is set to 'testProfileUse0'.

`

exports['profile use with non-existent name when several should not set as active 1'] = `
debug:  Checking for package updates
error:  ProfileNotFound: Profile not found. Please verify profile name exists.

`

exports['profile use with non-existent name when none should not throw 1'] = `
debug:  Checking for package updates
error:  ProfileNotFound: Profile not found. Please verify profile name exists.

`
