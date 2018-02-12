exports['profile list when several should succeed and print default format 1'] = `
[debug] Checking for package updates
Count: 3

profile           host                  
----------------  ----------------------
testProfileList0  http://localhost:3234/
testProfileList1  http://localhost:3234/
testProfileList2  http://localhost:3234/



`

exports['profile list when several should succeed and print json 1'] = `
[debug] Checking for package updates
{
  "result": [
    {
      "profile": "testProfileList0",
      "host": "http://localhost:3234/"
    },
    {
      "profile": "testProfileList1",
      "host": "http://localhost:3234/"
    },
    {
      "profile": "testProfileList2",
      "host": "http://localhost:3234/"
    }
  ]
}

`

exports['profile list when one should succeed 1'] = `
[debug] Checking for package updates
Count: 1

profile           host                  
----------------  ----------------------
testProfileList0  http://localhost:3234/



`

exports['profile list when one with valid credentials as options should succeed 1'] = `
[debug] Checking for package updates
Count: 1

profile           host                  
----------------  ----------------------
testProfileList0  http://localhost:3234/



`

exports['profile list when one with invalid credentials as options should succeed 1'] = `
[debug] Checking for package updates
Count: 1

profile           host                  
----------------  ----------------------
testProfileList0  http://localhost:3234/



`

exports['profile list when none should succeed 1'] = `
[debug] Checking for package updates
Count: 0






`
