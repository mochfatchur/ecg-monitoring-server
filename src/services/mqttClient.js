import mqtt from 'mqtt';
import { MQTT_BROKER_IP_ADDRESS, TOPIC_SUBSCRIBE } from '../config.js';
import { wss } from './websocket.js';

// MQTT Client Setup
export const mqttClient = mqtt.connect(MQTT_BROKER_IP_ADDRESS);

mqttClient.on('connect', () => {
  console.log('Connected to MQTT Broker');
  
  // Subscribe to topic
  mqttClient.subscribe(TOPIC_SUBSCRIBE, (err) => {
    if (err) {
      console.error(`Failed to subscribe to topic: ${process.env.TOPIC_SUBSCRIBE}`, err);
    } else {
      console.log(`Successfully subscribed to topic ${process.env.TOPIC_SUBSCRIBE}`);
    }
  });
});

mqttClient.on('message', (topic, message) => {
  console.log(`Received message from ${topic}: ${message.toString()}`);
  
  // Broadcast message to all WebSocket clients
  wss.clients.forEach(client => {
    if (client.readyState === client.OPEN) {
      client.send(message.toString());
    }
  });
});

mqttClient.on('error', (error) => {
  console.error('MQTT Client Error:', error);
});
