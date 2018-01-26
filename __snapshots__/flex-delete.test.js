exports['flex delete when project is not set should succeed and output default format 1'] = `
[debug] Checking for package updates
[debug] Writing JSON to file projectSetupPath
[debug] Writing contents to file projectSetupPath
Project data cleared. Run kinvey flex init to get started.

`

exports['flex delete when project is not set should succeed and output JSON 1'] = `
[debug] Checking for package updates
[debug] Writing JSON to file projectSetupPath
[debug] Writing contents to file projectSetupPath
{
  "result": null
}

`

exports['flex delete when project is set should succeed 1'] = `
[debug] Checking for package updates
[debug] Writing JSON to file projectSetupPath
[debug] Writing contents to file projectSetupPath
Project data cleared. Run kinvey flex init to get started.

`
