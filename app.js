import express from 'express';
import { WebSocketServer } from 'ws';
import mqtt from 'mqtt';
import { configDotenv } from 'dotenv';


// Load environment variables from .env file
configDotenv();

// Access environment variables
const APP_PORT = process.env.APP_PORT;
const WS_PORT = process.env.WS_PORT;
const mqtt_broker_ip_addr = process.env.MQTT_BROKER_IP_ADDRESS;

// Express Setup
const app = express();

// Web socket Setup
const wss = new WebSocketServer({ port: WS_PORT });


// MQTT Client Setup
const mqttClient = mqtt.connect(mqtt_broker_ip_addr);

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route sederhana
app.get('/', (req, res) => {
  res.send('Hello, Express with ES6 Modules!');
});

// MQTT Listener
// MQTT Listener with error handling
mqttClient.on('connect', () => {
  console.log('Connected to MQTT Broker');
  
  // Subscribe to the topic
  mqttClient.subscribe('temperature', (err) => {
    if (err) {
      console.error('Failed to subscribe to topic: home/temperature', err);
    } else {
      console.log('Successfully subscribed to home/temperature');
    }
  });
});

// Handle incoming messages from the subscribed topic
mqttClient.on('message', (topic, message) => {
  console.log(`Received message from ${topic}: ${message.toString()}`);
  // Broadcast to all WebSocket clients
  wss.clients.forEach(client => {
    if (client.readyState === client.OPEN) {
      client.send(message.toString());
    }
  });
});

// Handle MQTT client errors
mqttClient.on('error', (error) => {
  console.error('MQTT Client Error:', error);
});


// Websocket Listener
// WebSocket connection handling
wss.on('connection', ws => {
  console.log('WebSocket client connected');

  // Handle WebSocket client errors
  ws.on('error', (error) => {
    console.error('WebSocket Client Error:', error);
  });

  // Handle WebSocket client disconnection
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

// Handle WebSocket server errors
wss.on('error', (error) => {
  console.error('WebSocket Server Error:', error);
});

// App Listener
app.listen(APP_PORT, () => {
  console.log(`Server is running on http://localhost:${APP_PORT}`);
});
