const mqtt = require('mqtt');
const { MQTT_BROKER_IP_ADDRESS, TOPIC_SUBSCRIBE } = require('../config/appConfig.js');
const wss = require('../wsServer.js');
const sessionStore = require('../keys/sessionStore');
const sessionStoreCLient = require('../keys/sessionStoreCLient');
const { decrypt } = require('../services/cryptography/ascon');
const { decryptAESGCM } = require('../services/cryptography/aesgcm');
const { checkTimestampDelay } = require("../utils/time");
const { encrypt } = require("./cryptography/ascon");
const { encryptAESGCM } = require('../services/cryptography/aesgcm');

// MQTT Client Setup
const mqttClient = mqtt.connect(MQTT_BROKER_IP_ADDRESS);

// Client Topic
const topicClientMap = new Map(); // topic -> Set of websocket clients


mqttClient.on('connect', () => {
  console.log('Connected to MQTT Broker');

  // Subscribe to topic
  // mqttClient.subscribe(TOPIC_SUBSCRIBE, (err) => {
  //   if (err) {
  //     console.error(`Failed to subscribe to topic: ${TOPIC_SUBSCRIBE}`, err);
  //   } else {
  //     console.log(`Successfully subscribed to topic ${TOPIC_SUBSCRIBE}`);
  //   }
  // });
});


function decryptMQTTMsgFromPublisher(dataFromPublisher, sessionKeyWithPublisher) {
  const data = JSON.parse(dataFromPublisher.toString());
  const { msg, iv, ad } = data;
  const cipher_hex = Buffer.from(msg, 'base64').toString('hex');
  const iv_hex = Buffer.from(iv, 'base64').toString('hex');

  // associated data
  const adBuffer = Buffer.from(ad);  // misalnya "1724899123"

  // Decrypt Message
  // ASCON AEAD
  // const decryptedMsg = decrypt(sessionKey, iv_hex, adBuffer, cipher_hex);
  //AES-GCM
  const decryptedMsg = decryptAESGCM(sessionKeyWithPublisher, iv_hex, adBuffer, cipher_hex);

  // timestamp
  // const serverTimestamp = Math.floor(Date.now() / 1000); // sekarang dalam detik
  const serverTimestamp = Date.now(); // sekarang dalam detik
  // console.log("Server Time (ms):", serverTimestamp);

  return decryptedMsg;
}

function encryptedMsgForSubscriber(data, sessionKeyWithPublisher) {

}

mqttClient.on('message', (topic, message) => {
  console.log(`[MQTT Client] Received message from ${topic}: ${message.toString()}`);
  // Set of websocket clients
  const clients = topicClientMap.get(topic);
  // Get deviceId yang mem-publish data pada topic
  const deviceId = topic.split('/')[1]; // ecg/deviceID
  // Get sessionKey dengan publisher
  const keyInfoWithPublisher = sessionStore.get(deviceId);
  // Jika tidak ada, jangan teruskan proses
  if (!keyInfoWithPublisher) {
    console.log(`SessionKey with Publisher ${deviceId} not found.`);
  }
  const { sessionKey } = keyInfoWithPublisher;
  console.log(`GET: session key from ${deviceId}`, sessionKey);
  // Jika ada Websocket client yang terhubung pada topic
  if (clients) {
    for (const ws of clients) {
      console.log('mau decrypt..........');
      let decryptedMsg = decryptMQTTMsgFromPublisher(message, sessionKey);
      // Get userId
      // Get sessionKey dengan publisher
      // const keyInfoWithPublisher = sessionStoreCLient.get(deviceId);
      // Jika tidak ada, jangan teruskan proses
      // if (!keyInfoWithPublisher) return;
      // const { sessionKey } = keyInfoWithPublisher;
      // let encryptedMsgForSubscriber = encryptedMsgForSubscriber(decryptedMsg, sessionStoreCLient);
      if (ws.readyState === ws.OPEN) {
        ws.send(decryptedMsg);
        console.log(`[Server] WS PUSH: Decrypted message: ${decryptedMsg} to ${ws}`);
      }
    }
  }
});

mqttClient.on('error', (error) => {
  console.error('MQTT Client Error:', error);
});


function subscribeTopic(topic, ws) {
  // jika belum pernah ada topik yang ada instance websocket client yang menerima aliran datanya
  if (!topicClientMap.has(topic)) {
    topicClientMap.set(topic, new Set());
    mqttClient.subscribe(topic);
  }
  // jika sudah ada, tambahkan ws client ke topicMap
  topicClientMap.get(topic).add(ws);
}

function unsubscribeTopic(topic, ws) {
  if (topicClientMap.has(topic)) {
    const set = topicClientMap.get(topic);
    set.delete(ws);
    // kalau ada topic di Map yang tidak ada websocket client yang menerima aliran datanya
    // -> unsubscribe topic tersebut
    if (set.size === 0) {
      mqttClient.unsubscribe(topic);
      topicClientMap.delete(topic);
    }
  }
}

module.exports = { subscribeTopic, unsubscribeTopic };
