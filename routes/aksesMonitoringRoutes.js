const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const {
    tambahAkses,
    getAksesUser
} = require('../controllers/aksesMonitoringController');

// Hanya admin login yang bisa menambahkan akses ke user lain
router.post('/akses-monitoring', verifyToken, tambahAkses);

// Semua user bisa melihat perangkat yang bisa diakses dirinya
router.get('/akses-monitoring', verifyToken, getAksesUser);

module.exports = router;
