const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const axios = require("axios");
const cors = require("cors");
const http = require('http');
const { Server } = require("socket.io");
const config = require("./config")
const socketConstants = require("./constants/socket-constants");
const socketsMiddleware = require("./middlewares/sockets")

const corsOptions = {
    origin: [ 'http://localhost:8601' ],
}

const server = http.createServer(app);
const io = new Server(server, {
    cors: corsOptions
});

// Set up body-parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors(corsOptions))

app.use((req, res, next) => {
    // Middleware that makes socket.io available in routes.
    res.io = io;
    next();
});

app.get('/', (req, res) => {
    res.status(200).send('working fine! :)');
});

// Endpoint for Scratch to check server status
app.get('/poll', (req, res) => {
    res.status(200).send('Server is running');
});

io.on(socketConstants.connection, (socket) => {
    console.log("Client connected!");

    socketsMiddleware(io, socket);

    socket.on(socketConstants.disconnect, () => {
        console.log("Client disconnected!");
    });
});


// Errors
app.use((err) => console.error(err));
app.use((req, res) => {
    res.status(404).send("Resource not found!");
});

// Start server on port 8001 (default)
server.listen(config.PORT, () => {
    console.log('Server listening on port 8001');
});
