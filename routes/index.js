const express = require('express');

const router = express.Router();

const userController = require('../controllers/userController.js');
const authRoutes = require('./authRoutes');
const cryptoRoutes = require('./cryptoRoutes');


// Example route
router.get('/', (req, res) => {
  res.send('Hello, Express!');
});

// Auth route
router.use(authRoutes);

// Register route
router.post('/register', userController.register);

// Cryptography routes
router.use(cryptoRoutes);

module.exports = router;
