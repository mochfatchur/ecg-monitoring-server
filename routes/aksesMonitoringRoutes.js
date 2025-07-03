const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const {
    tambahAkses,
    getAksesByUser,
    getAllAksesUser
} = require('../controllers/aksesMonitoringController');

// Hanya admin login yang bisa menambahkan akses ke user lain
router.post('/akses-monitoring', verifyToken, tambahAkses);

// Semua user bisa melihat perangkat yang bisa diakses dirinya
router.get('/akses-monitoring', verifyToken, getAksesByUser);

// Hanya admin yang bisa melihat semua akses monitoring
router.get('/akses-monitoring/all', verifyToken, getAllAksesUser);

module.exports = router;
