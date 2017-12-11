exports['flex delete when project is not set should fail 1'] = `
debug:  Checking for package updates
error:  ProjectNotConfigured: This project is not configured. Use 'kinvey flex init' to get started.

`

exports['flex delete when project is set should succeed 1'] = `
debug:  Checking for package updates
debug:  Writing JSON to file projectSetupPath
debug:  Writing contents to file projectSetupPath
info:  Project settings cleared. Run kinvey flex init to get started.

`
