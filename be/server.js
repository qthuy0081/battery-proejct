let http = require("http");
let fs = require("fs");
const PORT = process.env.PORT || 8080
const storage = require("./storage.js")
const pubsub = require('./pubsub.js')
const webSocketServer = require('websocket').server
const server = http.createServer(async (req, res) => {

    if (req.url.match("api/get-signed-url") && req.method === "GET") {

        const string_url = "http://localhost:8080" + req.url
        const url = new URL(string_url)
        const fileName = url.searchParams.get("fileName")
        console.log(fileName)
        const signedUrl = await storage.generateV4UploadSignedUrl(fileName)
        console.log(signedUrl)
        res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" })
        res.end(
            JSON.stringify({ signedUrl })
        )
    }
    else {
        res.writeHead(404, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Route not found" }))
    }
})

server.listen(PORT, () => {
    console.log(`Server started on port: ${PORT}`)
})

const wsServer = new webSocketServer({ httpServer: server, autoAcceptConnections: false })
function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
}
wsServer.on('request', request => {
    // if (!originIsAllowed(request.origin)) {
    //     // Make sure we only accept requests from an allowed origin
    //     request.reject();
    //     console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
    //     return;
    // }

    var connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    connection.on('close', function (reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
    connection.on('message', function (message) {
        if (message.type === 'utf8' && message.utf8Data === 'GetResult') {
            console.log('Received Message: ' + message.utf8Data);
            connection.sendUTF(message.utf8Data);
            pubsub.listenForCloudMessage(message => {
                connection.sendUTF(message)
            })
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });



    
   
})
