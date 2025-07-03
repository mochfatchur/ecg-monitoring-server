const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const { getNonAdminUsers } = require('../controllers/userController');


router.get('/users/non-admin', verifyToken, getNonAdminUsers);

module.exports = router;