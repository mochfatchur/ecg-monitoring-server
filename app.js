const express = require('express');
const http = require('http');
const https = require('https');
const path = require('path');
const initWebSocketServer = require('./wsServer');
const cors = require('cors');
const router = require('./routes/index.js');
const fs = require('fs');

// Load Config
const { APP_PORT, ClientOrigin } = require('./config/appConfig.js');


// Baca sertifikat
const options = {
  key: fs.readFileSync(path.join(__dirname, 'certs/localhost-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'certs/localhost-cert.pem'))
};


// Initialize Express App
const app = express();

// Setup shared HTTP server (for both Express and WebSocket)
// kalau mau http
const server = http.createServer(app);
// const server = https.createServer(options, app);


// Initialize MQTT client (runs in background)
require('./services/mqttClient');

// === MIDDLEWARE ===
// Enable CORS (can be tightened in production)
// app.use(cors({
//   origin: ClientOrigin
// }));

app.use(cors({
  origin: '*'
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use(router);


// === ERROR HANDLER ===
// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Terjadi Kesalahan Server!');
});

// === INIT SERVICES ===
// Start WebSocket server (attach to shared HTTP server)
initWebSocketServer(server);

// Start Express Server
server.listen(APP_PORT, '0.0.0.0', () => {
  console.log(`Server (HTTP + WS) running at http://0.0.0.0:${APP_PORT}`);
});
