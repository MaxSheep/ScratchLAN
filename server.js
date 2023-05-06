const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const axios = require("axios");
import config from './config'

// Set up body-parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Endpoint for Scratch to check server status
app.get('/poll', (req, res) => {
    res.status(200).send('Server is running');
});

// Endpoint for Scratch to send data to the server
app.post('/data', (req, res) => {
    // Extract data from Scratch's request
    const { data } = req.body;

    // Send a request to another PC on the same LAN
    axios.post(`http://${config.OTHER_PORT_1}:${config.OTHER_HOST_1}}/data`, data)
    .then((response) => {
        res.status(200).send('Data sent to other PC');
    })
    .catch((error) => {
        console.error(error);
        res.status(500).send('Error sending data to other PC');
    })
});

// Start server on port 8001
app.listen(config.PORT, () => {
    console.log('Server listening on port 8001');
});
