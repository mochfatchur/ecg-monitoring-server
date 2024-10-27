import express from 'express';
import { APP_PORT } from './config.js';
import router from './routes/index.js';
import './services/websocket.js';  // Initialize WebSocket
import './services/mqttClient.js'; // Initialize MQTT

// Express Setup
const app = express();

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use(router);

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Terjadi Kesalahan Server!');
});

// Start Express Server
app.listen(APP_PORT, () => {
  console.log(`Server is running on http://localhost:${APP_PORT}`);
});
