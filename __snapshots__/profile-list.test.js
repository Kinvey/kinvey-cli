exports['profile list when several should succeed 1'] = `
debug:  Checking for package updates
info:  You have 3 profiles.

profile           host                  
----------------  ----------------------
testProfileList0  http://localhost:3234/
testProfileList1  http://localhost:3234/
testProfileList2  http://localhost:3234/


`

exports['profile list when one should succeed 1'] = `
debug:  Checking for package updates
info:  You have 1 profile.

profile           host                  
----------------  ----------------------
testProfileList0  http://localhost:3234/


`

exports['profile list when one with valid credentials as options should succeed 1'] = `
debug:  Checking for package updates
info:  You have 1 profile.

profile           host                  
----------------  ----------------------
testProfileList0  http://localhost:3234/


`

exports['profile list when one with invalid credentials as options should succeed 1'] = `
debug:  Checking for package updates
info:  You have 1 profile.

profile           host                  
----------------  ----------------------
testProfileList0  http://localhost:3234/


`

exports['profile list when none should succeed 1'] = `
debug:  Checking for package updates
info:  You have 0 profiles.





`
