const express = require('express');
const { keyExchange } = require('../controllers/cryptoController.js');
const router = express.Router();

router.post('/key-exchange', keyExchange);

module.exports = router;