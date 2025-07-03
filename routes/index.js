const express = require('express');

const router = express.Router();

const userController = require('../controllers/userController.js');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const cryptoRoutes = require('./cryptoRoutes');
const perangkatRoutes = require('./perangkatRoutes');
const aksesMonitoringRoutes = require('./aksesMonitoringRoutes');



// Example route
router.get('/', (req, res) => {
  res.send('Hello, Express!');
});

// Auth route
router.use(authRoutes);

// Register route
router.post('/register', userController.register);

// User route
router.use(userRoutes);

// Cryptography routes
router.use(cryptoRoutes);

// Perangkat routes
router.use(perangkatRoutes)

// Akses Monitoring
router.use(aksesMonitoringRoutes);


module.exports = router;
