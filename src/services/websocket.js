import { WebSocketServer } from 'ws';
import { WS_PORT } from '../config.js';

// WebSocket Setup
export const wss = new WebSocketServer({ port: WS_PORT });

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
