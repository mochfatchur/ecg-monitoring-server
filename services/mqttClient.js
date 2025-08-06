const mqtt = require('mqtt');
const { MQTT_BROKER_IP_ADDRESS } = require('../config/appConfig.js');
const wss = require('../wsServer.js');
const sessionStore = require('../keys/sessionStore');
const { decrypt } = require('../services/cryptography/ascon');
const { decryptAESGCM } = require('../services/cryptography/aesgcm');
const { checkTimestampDelay } = require("../utils/time");
const { encrypt } = require("./cryptography/ascon");
const { encryptAESGCM } = require('../services/cryptography/aesgcm');
const { runAEADTests } = require('../test/tamper.js');

// MQTT Client Setup
const mqttClient = mqtt.connect(MQTT_BROKER_IP_ADDRESS);

// Client Topic
const topicClientMap = new Map(); // topic -> Set of websocket clients


mqttClient.on('connect', () => {
  console.log('Connected to MQTT Broker');
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
  let decryptedMsg;
  try {
    // AES-GCM dekripsi
    decryptedMsg = decryptAESGCM(sessionKeyWithPublisher, iv_hex, adBuffer, cipher_hex);
  } catch (err) {
    console.error("Gagal dekripsi: Tag autentikasi tidak valid atau data rusak.\n");
    return null; // atau bisa throw err jika ingin ditangani di level atas
  }

  // timestamp
  // const serverTimestamp = Math.floor(Date.now() / 1000); // sekarang dalam detik
  const serverTimestamp = Date.now(); // sekarang dalam detik
  // console.log("Server Time (ms):", serverTimestamp);

  return decryptedMsg;
}

function encryptedMsgForSubscriber(data, ad, sessionKeyWithSubscriber) {

  const adBuffer = Buffer.from(ad);

  const { ivHex, cipherHex } = encryptAESGCM(sessionKeyWithSubscriber, data, adBuffer);

  return {
    iv: Buffer.from(ivHex, 'hex').toString('base64'),      // kirim IV dalam base64
    ad: ad,
    msg: Buffer.from(cipherHex, 'hex').toString('base64')  // ciphertext+tag dalam base64
  };
}

mqttClient.on('message', (topic, message) => {
  console.log(`\n[MQTT Client] Received message from ${topic}: ${message.toString()}`);
  // Set of websocket clients
  const clients = topicClientMap.get(topic);
  // Get deviceId yang mem-publish data pada topic
  const deviceId = topic.split('/')[1]; // ecg/deviceID
  // Get sessionKey dengan publisher
  const keyInfoWithPublisher = sessionStore.get(deviceId);
  // Jika tidak ada, jangan teruskan proses
  if (!keyInfoWithPublisher) {
    console.log(`SessionKey with Publisher ${deviceId} not found.`);

    console.log(`SessionKey with Publisher ${deviceId} not found.`);

    // Kirim perintah keyExchange ulang ke IoT device
    const commandTopic = `cmd/${deviceId}`;
    const commandPayload = JSON.stringify({
      type: 'keyExchangeRequest',
      reason: 'SessionKeyMissing'
    });

    mqttClient.publish(commandTopic, commandPayload, { qos: 1 }, (err) => {
      if (err) {
        console.error(`[MQTT Client] Failed to publish key exchange request to ${commandTopic}:`, err);
      } else {
        console.log(`[MQTT Client] Sent keyExchange request to ${commandTopic}`);
      }
    });

    // STOP: jangan teruskan kirim ke WebSocket
    return;
  }
  const { sessionKey } = keyInfoWithPublisher;
  // console.log(`[SERVER] session key from ${deviceId}`, sessionKey);
  // Jika ada Websocket client yang terhubung pada topic
  if (clients) {
    for (const ws of clients) {
      runAEADTests(message, sessionKey, decryptMQTTMsgFromPublisher);
      let decryptedMsg = decryptMQTTMsgFromPublisher(message, sessionKey);
      // Get userId
      // Get sessionKey dengan publisher
      const keyInfoWithSubscriber = sessionStore.get('1');
      // console.log(`[SERVER] session key from user ${JSON.stringify(keyInfoWithSubscriber, null, 2)}`);

      // Jika tidak ada, jangan teruskan proses
      if (!keyInfoWithSubscriber) return;
      const sessionKeyClient = keyInfoWithSubscriber.sessionKey;
      const data = JSON.parse(message.toString());
      const { ad } = data;
      // console.log(`[SERVER] session key from client`, sessionKeyClient);
      let encryptedMsg = encryptedMsgForSubscriber(decryptedMsg, ad, sessionKeyClient);
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(encryptedMsg));
        // console.log(`[Server] WS PUSH: Decrypted message: ${encryptedMsg}`);
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
