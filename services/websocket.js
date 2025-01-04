const { WebSocketServer } = require('ws');
const { WS_PORT } = require('../config/appConfig.js');

// WebSocket Setup
const wss = new WebSocketServer({ port: WS_PORT });

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');

  ws.on('error', (error) => {
    console.error('WebSocket Client Error:', error);
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

// Handle WebSocket server errors
wss.on('error', (error) => {
  console.error('WebSocket Server Error:', error);
});

module.exports = wss;
