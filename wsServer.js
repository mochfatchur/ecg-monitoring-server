// wsServer.js
const WebSocket = require('ws');
const { subscribeTopic, unsubscribeTopic } = require('./services/mqttClient');

// Correct WebSocket server setup
function initWebSocket(server) {
  const wss = new WebSocket.Server({ server }); //

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');

    ws.on('message', (msg) => {
      try {
        const data = JSON.parse(msg);

        if (data.type === 'start-monitoring') {
          console.log(`Received ${data}`);
          subscribeTopic(data.topic, ws);
          ws.topic = data.topic;
        } else if (data.type === 'stop-monitoring') {
          unsubscribeTopic(data.topic, ws);
        }
      } catch (err) {
        console.error('Invalid message format', err);
      }
    });

    ws.on('close', () => {
      if (ws.topic) {
        unsubscribeTopic(ws.topic, ws);
      }
      console.log('WebSocket client disconnected');
    });
  });
}

module.exports = initWebSocket;
