// wsServer.js
const WebSocket = require('ws');
const jwt = require('jsonwebtoken'); // gunakan JWT untuk validasi
const { subscribeTopic, unsubscribeTopic } = require('./services/mqttClient');

const fetch = require('node-fetch'); // gunakan node-fetch untuk HTTP request
const BACKEND_DOMAIN = process.env.LOCAL_IP_ADDRESS || 'localhost';
const PORT_BACKEND = process.env.APP_PORT ||  3000;
const BASE_URL = `http://${BACKEND_DOMAIN}:${PORT_BACKEND}`;

// Secret JWT untuk validasi token
const JWT_SECRET = process.env.JWT_SECRET;

function initWebSocket(server) {
  // Gunakan noServer agar bisa custom autentikasi
  const wss = new WebSocket.Server({ noServer: true });

  // Tangani upgrade request (HTTP -> WS) & validasi token dari Sec-WebSocket-Protocol
  server.on('upgrade', (req, socket, head) => {
    const token = req.headers['sec-websocket-protocol']; // token dikirim di sini

    if (!token) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    // Verifikasi JWT
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
        socket.destroy();
        return;
      }

      // Jika token valid → lanjutkan upgrade
      wss.handleUpgrade(req, socket, head, (ws) => {
        ws.user = decoded; // simpan info user untuk digunakan nanti
        ws.userToken = token // simpan token
        console.log('token: ', decoded);
        wss.emit('connection', ws, req);
      });
    });
  });

  // Event koneksi WebSocket (hanya dijalankan jika token valid)
  wss.on('connection', (ws) => {
    console.log(`✅ WebSocket client connected: ${ws.user?.username}`);

    ws.on('message', async (msg) => {
      try {
        const data = JSON.parse(msg);

        if (data.type === 'start-monitoring') {
          // Tambahkan validasi akses monitoring (panggil API service eksternal)
          console.log('cek ws.user: ', ws.user);
          const allowed = await validateAccess(ws.user, data.topic, ws.userToken);
          if (!allowed) {
            ws.send(JSON.stringify({ error: 'Access Denied' }));
            ws.close(4001, 'Unauthorized Access');
            return;
          }

          console.log(`Received start-monitoring request for topic: ${data.topic}`);
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
      if (ws.topic) unsubscribeTopic(ws.topic, ws);
      console.log('WebSocket client disconnected');
    });
  });
}

// 🔹 Fungsi Dummy untuk Validasi Akses Monitoring
async function validateAccess(user, topic, token) {
  try {
    if (!token) {
      console.error('Bearer token tidak tersedia untuk memanggil API eksternal');
      return false;
    }

    const res = await fetch(`${BASE_URL}/akses-monitoring`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      console.error(`Gagal memanggil API akses-monitoring: ${res.status}`);
      return false;
    }

    const data = await res.json();
    const perangkatList = data?.perangkat || [];

    const allowed = perangkatList.some(p => topic.endsWith(p.kode));

    if (!allowed) {
      console.warn(`Akses monitoring ditolak untuk topic: ${topic}`);
      return false;
    }

    console.log(`Akses monitoring diizinkan untuk topic: ${topic}`);
    return true;
  } catch (err) {
    console.error('Error saat validasi akses monitoring:', err);
    return false;
  }
}


module.exports = initWebSocket;
