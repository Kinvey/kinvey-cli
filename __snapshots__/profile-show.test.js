exports['profile show with name parameter with existent name when several should succeed 1'] = `
debug:  Checking for package updates
key    value                 
-----  ----------------------
email  janeDoe@mail.com      
token  userToken             
host   http://localhost:3234/
name   testProfileShow0      


`

exports['profile show with name parameter with existent name when one should succeed 1'] = `
debug:  Checking for package updates
key    value                 
-----  ----------------------
email  janeDoe@mail.com      
token  userToken             
host   http://localhost:3234/
name   testProfileShow0      


`

exports['profile show with name parameter with non-existent name when several should not throw 1'] = `
debug:  Checking for package updates
info:  Could not find profile with name 'nonExistentProfile'.

`

exports['profile show with name parameter with non-existent name when none should not throw 1'] = `
debug:  Checking for package updates
info:  Could not find profile with name 'nonExistentProfile'.

`

exports['profile show with name parameter with existent name when active profile is set should succeed 1'] = `
debug:  Checking for package updates
key    value                 
-----  ----------------------
email  janeDoe@mail.com      
token  userToken             
host   http://localhost:3234/
name   1%!@_                 


`

exports['profile show without name parameter when active profile is set should succeed 1'] = `
debug:  Checking for package updates
key    value                 
-----  ----------------------
email  janeDoe@mail.com      
token  userToken             
host   http://localhost:3234/
name   20                    


`

exports['profile show without name parameter when active profile is not set should not throw 1'] = `
debug:  Checking for package updates
info:  Active profile is not set.

`

exports['profile show without name parameter when active profile is not set and only one profile should not succeed 1'] = `
debug:  Checking for package updates
info:  Active profile is not set.

`
