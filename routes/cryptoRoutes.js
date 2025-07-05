const express = require('express');
const { keyExchange, keyExchangeClient } = require('../controllers/cryptoController.js');
const router = express.Router();

router.post('/key-exchange', keyExchange);
router.post('/monitoring/key-exchange', keyExchangeClient);

module.exports = router;