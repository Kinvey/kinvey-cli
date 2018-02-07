exports['profile show with name parameter with existent name when several should succeed and output default format 1'] = `
[debug] Checking for package updates
key    value                 
-----  ----------------------
email  janeDoe@mail.com      
token  userToken             
host   http://localhost:3234/
name   testProfileShow0      


`

exports['profile show with name parameter with existent name when several should succeed and output JSON 1'] = `
[debug] Checking for package updates
{
  "result": {
    "email": "janeDoe@mail.com",
    "token": "userToken",
    "host": "http://localhost:3234/",
    "name": "testProfileShow0"
  }
}

`

exports['profile show with name parameter with existent name when one should succeed and output default format 1'] = `
[debug] Checking for package updates
key    value                 
-----  ----------------------
email  janeDoe@mail.com      
token  userToken             
host   http://localhost:3234/
name   testProfileShow0      


`

exports['profile show with name parameter with existent name when one should succeed and output JSON 1'] = `
[debug] Checking for package updates
{
  "result": {
    "email": "janeDoe@mail.com",
    "token": "userToken",
    "host": "http://localhost:3234/",
    "name": "testProfileShow0"
  }
}

`

exports['profile show with name parameter with non-existent name when several should return error 1'] = `
[debug] Checking for package updates
[error] ProfileNotFound: Profile not found. Please verify profile name exists.

`

exports['profile show with name parameter with non-existent name when none should return error 1'] = `
[debug] Checking for package updates
[error] ProfileNotFound: Profile not found. Please verify profile name exists.

`

exports['profile show with name parameter with existent name when active profile is set should succeed 1'] = `
[debug] Checking for package updates
key    value                 
-----  ----------------------
email  janeDoe@mail.com      
token  userToken             
host   http://localhost:3234/
name   1%!@_                 


`

exports['profile show without name parameter when active profile is set should succeed 1'] = `
[debug] Checking for package updates
key    value                 
-----  ----------------------
email  janeDoe@mail.com      
token  userToken             
host   http://localhost:3234/
name   20                    


`

exports['profile show without name parameter when active profile is not set should return error 1'] = `
[debug] Checking for package updates
[error] ProfileNotFound: Active profile is not set.

`

exports['profile show without name parameter when active profile is not set and only one profile should not succeed 1'] = `
[debug] Checking for package updates
[error] ProfileNotFound: Active profile is not set.

`
