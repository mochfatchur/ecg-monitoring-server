const express = require('express');

const router = express.Router();

const userController = require('../controllers/userController.js');
const authRoutes = require('./authRoutes');

// Example route
router.get('/', (req, res) => {
  res.send('Hello, Express with ES6 Modules!');
});

// Auth route
router.use(authRoutes);

// Register route
router.post('/register', userController.register);

module.exports = router;
