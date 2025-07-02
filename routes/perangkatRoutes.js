const express = require("express");
const router = express.Router();
const { registerPerangkat, getAllPerangkat } = require('../controllers/perangkatController');
const { verifyToken } = require("../middlewares/authMiddleware");

// Hanya user yang sudah login (autentikasi) yang boleh akses
router.post("/perangkat", verifyToken, registerPerangkat);
router.get("/perangkat", verifyToken, getAllPerangkat);

module.exports = router;
