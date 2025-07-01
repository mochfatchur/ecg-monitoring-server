const express = require('express');
const http = require('http');
const initWebSocketServer = require('./wsServer');
const cors = require('cors');
const router = require('./routes/index.js');

// Load Config
const { APP_PORT, ClientOrigin } = require('./config/appConfig.js');

// Initialize Express App
const app = express();

// Setup shared HTTP server (for both Express and WebSocket)
const server = http.createServer(app);


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
server.listen(APP_PORT, () => {
  console.log(`Server (HTTP + WS) running at http://localhost:${APP_PORT}`);
});
