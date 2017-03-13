// Global Require
var path = require('path');
var http = require('http');
var server = http.createServer()

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

// Sockets Events
io.on('connection', function (socket) {
    var clientId = socket.id
   
    // Client connected
    console.log(`Client ${clientId} has connected!`);

    // Send the current board state
    serverState.forEach(function(item){
        // sending to individual socketid (private message)
        socket.emit('paiting', item);
    })

    // Client disconnected
    socket.on('disconnect', function () {
        console.log(`Client ${clientId} has disconected :( `);
    });

    // Event Listener
    socket.on('drawing', function (start, end, color) {
        var item = {start, end, color};
        serverState.push(item);

        // Broadcast to the rest to the rest
        socket.broadcast.emit('paiting', {start, end, color});
    });
});



server.listen(1337, function () {
    console.log('The server is listening on port 1337!');
});

app.use(express.static(path.join(__dirname, 'browser')));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});