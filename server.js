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
    var clientIndex = clients.push(connection) - 1;
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
                         console.log('Join remoteAddress: '+clients[i].remoteAddress+'   and   mobile: '+clients[i].mobile);
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
                    if(clients[i].mobile  === data.mobile)
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
                break;
        }


    });

    // Client disconnects, removing from list
    connection.on('close', function(connection) {
        console.log('Peer ' + remoteAddress + ' disconnected.');
        clients.splice(clientIndex, 1);
    });
});