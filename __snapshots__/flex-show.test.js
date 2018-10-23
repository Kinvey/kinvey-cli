exports['flex show using active profile when valid project is set without service as option should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Request:  GET http://localhost:3234/v2/data-links/12378kdl2
[debug] Response: GET http://localhost:3234/v2/data-links/12378kdl2 200
key          value             
-----------  ------------------
serviceName  TestKinveyDatalink
secret       789               


`

exports['flex show using active profile when valid project is set with service as option should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Request:  GET http://localhost:3234/v2/data-links/0de22ffb3f2243ec8138170844envVar
[debug] Response: GET http://localhost:3234/v2/data-links/0de22ffb3f2243ec8138170844envVar 200
key                          value                     
---------------------------  --------------------------
serviceName                  TestKinveyService         
secret                       666666e6642c3418398f982666
environmentVariables.MY_ENV  dev                       


`
