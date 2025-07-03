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
        if (!req.user || !req.user.isAdmin) {
            return res.status(403).json({ error: 'Hanya admin yang dapat melihat daftar perangkat.' });
        }

        const {
            page = 1,
            rowsPerPage = 10,
            sortBy = 'id',
            descending = 'false',
            search = ''
        } = req.query;

        const limit = parseInt(rowsPerPage);
        const offset = (parseInt(page) - 1) * limit;
        const order = [[sortBy, descending === 'true' ? 'DESC' : 'ASC']];

        const { Op } = require('sequelize');
        const where = {
            user_admin_id: req.user.id
        };

        // Tambahkan filter pencarian (contoh pada kolom 'kode')
        if (search) {
            where.kode = { [Op.like]: `%${search}%` };
        }

        const { count, rows } = await Perangkat.findAndCountAll({
            where,
            order,
            limit,
            offset
        });

        return res.json({
            rows,
            rowsNumber: count
        });

    } catch (error) {
        console.error('Gagal mengambil daftar perangkat:', error);
        return res.status(500).json({ error: 'Terjadi kesalahan saat mengambil daftar perangkat.' });
    }
};
