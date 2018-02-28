var WebSocketServer = require('websocket').server;
var http = require('http');
var clients = [];

var server = http.createServer(function(request, response) {
    // process http request
});

server.listen(4200, function() { console.log("server ready on 4200") });


var wsServer = new WebSocketServer({
    httpServer: server
});


wsServer.on('request', function(request) {
    var connection = request.accept(null, request.origin);

    //check
    for (var i=0; i != clients.length; i++) {
        if(clients[i].remoteAddress === connection.remoteAddress)
        {
            clients.splice(i, 1);
        }
    }

    clients.push(connection);
    var remoteAddress = connection.remoteAddress;
    console.log('Client connected from address ' + remoteAddress);

    // Message received from a client
    connection.on('message', function(message) {

        data = JSON.parse(message.utf8Data);

        switch (data.title)
        {
            case 'connect':
                  for (var i=0; i != clients.length; i++) {
                     if(clients[i].remoteAddress === connection.remoteAddress)
                     {
                         clients[i].mobile = data.mobile;
                         clients[i].name = data.name;

                         console.log('Join remoteAddress: '+clients[i].remoteAddress+'   and   mobile: '+clients[i].mobile);
                         for (var j=0; j!=clients.length; j++) {
                             if(clients[j].mobile === '000000000')
                             {
                                 clients[j].send(JSON.stringify({'title':'open',mobile : clients[i].mobile,name:clients[i].name,remoteAddress:clients[i].remoteAddress}));
                                 console.log('Send new client');
                             }
                         }
                         break;
                     }
                  }

                break;


            case 'location':
                  for (var i=0; i!=clients.length; i++) {
                      if(clients[i].mobile === '000000000')
                      {
                          clients[i].send(JSON.stringify(data));
                          console.log('Client send location: '+JSON.stringify(data));
                      }
                  }
                break;

            case 'gps-624713856533332547172474':
                for (var i=0; i != clients.length; i++) {
                    if(clients[i].mobile  == data.mobile)
                    {
                        clients[i].send('{"request":"GPS"}');
                        console.log('Admin request GPS To: '+clients[i].mobile);
                        break;
                    }
                }
                break;

            case 'NewVideo-3617374345754545323':
                  // Broadcast
                  for (var i=0; i!=clients.length; i++) {
                      clients[i].send('{"request":"NEW"}');
                  }
                    console.log('Broadcast for new video');
                break;

            case 'GetAll-273472435356845356555':
                for (var i=0; i!=clients.length; i++) {
                    if(clients[i].mobile === '000000000')
                    {
                        for (var j=0; j!=clients.length; j++) {
                                clients[i].send(JSON.stringify({'title':'open',mobile : clients[j].mobile,name:clients[j].name,remoteAddress:clients[j].remoteAddress}));
                        }
                        console.log('Send all clients');
                    }
                }
                break;
        }


    });

    // Client disconnects, removing from list
    connection.on('close', function() {
        var index ;
        for (var i=0; i != clients.length; i++) {
            if(clients[i].remoteAddress === connection.remoteAddress)
                console.log('client  remoteAddress :'+ clients[i].remoteAddress + ' == ' + 'connection : '+ connection.remoteAddress);
            {
                index = i;
                console.log('Peer ' + clients[i].remoteAddress + ' disconnected.');
               break;
            }
        }

        for (var i=0; i!=clients.length; i++) {
            if(clients[i].mobile === '000000000')
            {
                clients[i].send(JSON.stringify({'title':'closed',mobile : clients[index].mobile,remoteAddress:clients[index].remoteAddress}));
            }
        }

        clients.splice(index, 1);

    });
});