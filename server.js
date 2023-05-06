const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const axios = require("axios");
const cors = require("cors");
// const config = require("./config")

const PORT = 8001;

// Others
const OTHER_PORT_1 = 8001;
const OTHER_HOST_1 = '192.168.56.1';

const corsOptions = {
    origin: [ 'http://localhost:8601' ],
}

// Set up body-parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors(corsOptions))

// Endpoint for Scratch to check server status
app.get('/poll', (req, res) => {
    res.status(200).send('Server is running');
});

// Endpoint for Scratch to send data to the server
app.post('/data', (req, res) => {
    // Extract data from Scratch's request
    const { data } = req.body;

    // Send a request to another PC on the same LAN
    axios.post(`http://${OTHER_PORT_1}:${OTHER_HOST_1}}/data`, data)
    .then((response) => {
        res.status(200).send('Data sent to other PC');
    })
    .catch((error) => {
        console.error(error);
        res.status(500).send('Error sending data to other PC');
    })
});

// Start server on port 8001
app.listen(PORT, () => {
    console.log('Server listening on port 8001');
});
