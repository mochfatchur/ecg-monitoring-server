const { Perangkat } = require('../models');

exports.registerPerangkat = async (req, res) => {
    try {
        const { kode } = req.body;

        if (!kode) {
            return res.status(400).json({ error: 'Kode perangkat wajib diisi.' });
        }

        // Hanya admin yang boleh mendaftarkan perangkat
        console.log('user: ', req.user);
        if (!req.user || !req.user.isAdmin) {
            return res.status(403).json({ error: 'Hanya admin yang dapat mendaftarkan perangkat.' });
        }

        // Cek apakah kode sudah ada
        const existing = await Perangkat.findOne({ where: { kode } });
        if (existing) {
            return res.status(409).json({ error: 'Kode perangkat sudah terdaftar.' });
        }

        // Tambahkan perangkat
        const perangkat = await Perangkat.create({
            kode,
            user_admin_id: req.user.id
        });

        return res.status(201).json({ message: 'Perangkat berhasil didaftarkan.', perangkat });
    } catch (error) {
        console.error('Gagal mendaftarkan perangkat:', error);
        return res.status(500).json({ error: 'Terjadi kesalahan saat mendaftarkan perangkat.' });
    }
};

exports.getAllPerangkat = async (req, res) => {
    try {
        // Ambil semua perangkat yang didaftarkan oleh admin tertentu
        if (!req.user || !req.user.isAdmin) {
            return res.status(403).json({ error: 'Hanya admin yang dapat melihat daftar perangkat.' });
        }

        const perangkatList = await Perangkat.findAll({
            where: { user_admin_id: req.user.id }
        });

        return res.json({ perangkat: perangkatList });
    } catch (error) {
        console.error('Gagal mengambil daftar perangkat:', error);
        return res.status(500).json({ error: 'Terjadi kesalahan saat mengambil daftar perangkat.' });
    }
};
