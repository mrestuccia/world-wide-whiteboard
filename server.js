// Global Require
var path = require('path');
var http = require('http');
var server = http.createServer()
var debug = false;

// Define express server
var express = require('express');
var app = express(); // the app returned by express() is a JavaScript Function. Not something we can pass to our sockets!

// Define sockets
var socketio = require('socket.io');

// Connect http server to express
server.on('request', app);

// Connect sockets to server
var io = socketio(server);

// Global application State. Better to have an object?
var serverState = []
var clients = [];

// Sockets Events
io.on('connection', function (socket) {
    var clientId = socket.id

    // Add client to the list
    clients.push(socket);
   
    // Client connected
    if(debug)console.log(`Client ${clientId} has connected!`);

    // Send the current board state
    serverState.forEach(function(item){
        // sending to individual socketid (private message)
        socket.emit('paiting', item);
    })

    // Client disconnected
    socket.on('disconnect', function () {
        if(debug)console.log(`Client ${clientId} disconnected remove :( `);
        
        //remove the client
        clients.splice(clients.indexOf(clientId),1)
    });

    // Event Listener
    socket.on('drawing', function (start, end, color) {
        var item = {start, end, color};
        serverState.push(item);

        // Broadcast to the rest to the rest
        socket.broadcast.emit('paiting', {start, end, color});
    });
});

var port = process.env.PORT || 1337

server.listen(port, function () {
    console.log(`The server is listening on port ${port}}!`);
});

app.use(express.static(path.join(__dirname, 'browser')));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Erase board
app.post('/', function (req, res) {
    serverState = [];

    clients.forEach((socket)=>{
        console.log(`Sending reset signal to ${socket.id}}!`);
        if (io.sockets.connected[socket.id]) {
            io.sockets.connected[socket.id].emit('reset', '');
        }
    })

    res.redirect('/');
});