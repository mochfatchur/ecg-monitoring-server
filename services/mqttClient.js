const mqtt = require('mqtt');
const { MQTT_BROKER_IP_ADDRESS, TOPIC_SUBSCRIBE } = require('../config/appConfig.js');
const wss = require('./websocket.js');
const sessionStore = require('../keys/sessionStore');
const { decrypt } = require('../services/cryptography/ascon');

// MQTT Client Setup
const mqttClient = mqtt.connect(MQTT_BROKER_IP_ADDRESS);

mqttClient.on('connect', () => {
  console.log('Connected to MQTT Broker');

  // Subscribe to topic
  mqttClient.subscribe(TOPIC_SUBSCRIBE, (err) => {
    if (err) {
      console.error(`Failed to subscribe to topic: ${TOPIC_SUBSCRIBE}`, err);
    } else {
      console.log(`Successfully subscribed to topic ${TOPIC_SUBSCRIBE}`);
    }
  });
});

mqttClient.on('message', (topic, message) => {
  console.log(`Received message from ${topic}: ${message.toString()}`);

  // Parse Message
  const deviceId = topic.split('/')[1]; // ecg/deviceID
  const keyInfo = sessionStore.get(deviceId);
  if (!keyInfo) return;

  const { sessionKey } = keyInfo;
  console.log(`GET: session key from ${deviceId}`, sessionKey);
  const data = JSON.parse(message.toString());
  const { msg, iv, ad } = data;
  const cipher_hex = Buffer.from(msg, 'base64').toString('hex');
  const iv_hex = Buffer.from(iv, 'base64').toString('hex');

  // Decrypt Message
  const decryptedMsg = decrypt(sessionKey, iv_hex, ad, cipher_hex);

  console.log('WS PUSH: Decrypted message:', decryptedMsg);


  // Broadcast message to all WebSocket clients
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(decryptedMsg);
    }
  });
});

mqttClient.on('error', (error) => {
  console.error('MQTT Client Error:', error);
});

module.exports = mqttClient;
