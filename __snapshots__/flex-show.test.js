exports['flex show using active profile when valid project is set with service and svc env as options should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Request:  GET http://localhost:3234/v3/services/124/environments
[debug] Response: GET http://localhost:3234/v3/services/124/environments 200
[debug] Request:  GET http://localhost:3234/v3/services/124/environments
[debug] Response: GET http://localhost:3234/v3/services/124/environments 200
[debug] Request:  GET http://localhost:3234/v3/services/124
[debug] Response: GET http://localhost:3234/v3/services/124 200
key                          value                           
---------------------------  --------------------------------
svcEnvName                   stg4                            
svcEnvId                     0de22ffb3f2243ec8138170844envVar
secret                       666666e6642c3418398f982666      
serviceName                  TestDatalink                    
app                          555594ffb9e7473781ad4cebdfd55555
environmentVariables.MY_ENV  stg4                            


`

exports['flex show using active profile when valid project is set without service and svc env as options should succeed 1'] = `
[debug] Checking for package updates
[debug] Using profile 'activeProfile'
[debug] Request:  GET http://localhost:3234/v3/services/12378kdl2/environments
[debug] Response: GET http://localhost:3234/v3/services/12378kdl2/environments 200
[debug] Request:  GET http://localhost:3234/v3/services/12378kdl2
[debug] Response: GET http://localhost:3234/v3/services/12378kdl2 200
key                          value                           
---------------------------  --------------------------------
svcEnvName                   dev                             
svcEnvId                     642dd1efe3d92e0180317487b29c6e88
runtime                      node8                           
secret                       123                             
serviceName                  TestKinveyDatalink              
app                          555594ffb9e7473781ad4cebdfd55555
environmentVariables.MY_ENV  dev                             


`
