const { AksesMonitoring, Perangkat, User } = require('../models');

exports.tambahAkses = async (req, res) => {
    try {
        const admin_id = req.user.id;
        const { user_id, perangkat_id } = req.body;

        if (!req.user.isAdmin) {
            return res.status(403).json({ error: 'Hanya admin yang bisa memberikan akses.' });
        }

        if (!user_id || !perangkat_id) {
            return res.status(400).json({ error: 'user_id dan perangkat_id wajib diisi.' });
        }

        // Cek apakah user_id valid dan bukan admin
        const targetUser = await User.findByPk(user_id);
        if (!targetUser) {
            return res.status(404).json({ error: 'User tidak ditemukan.' });
        }
        if (targetUser.isAdmin) {
            return res.status(400).json({ error: 'Tidak dapat memberikan akses ke user admin.' });
        }

        // Cek apakah perangkat ada
        const perangkat = await Perangkat.findByPk(perangkat_id);
        if (!perangkat) {
            return res.status(404).json({ error: 'Perangkat tidak ditemukan.' });
        }

        // Cek apakah perangkat memang milik admin yang login
        if (perangkat.user_admin_id !== admin_id) {
            return res.status(403).json({ error: 'Perangkat ini bukan milik Anda.' });
        }

        // Cek apakah akses sudah ada
        const existing = await AksesMonitoring.findOne({
            where: { user_id, perangkat_id }
        });

        if (existing) {
            return res.status(200).json({ message: 'Akses sudah ada.' });
        }

        // Tambahkan akses
        await AksesMonitoring.create({ user_id, perangkat_id });

        return res.status(201).json({ message: 'Akses berhasil diberikan ke user.' });
    } catch (error) {
        console.error('Gagal menambahkan akses:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat menambahkan akses.' });
    }
};

exports.getAllAksesUser = async (req, res) => {
    try {
        // Hanya admin yang bisa mengakses semua data
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: 'Hanya admin yang bisa mengakses data ini.' });
        }
        // Ambil semua akses monitoring
        const aksesList = await AksesMonitoring.findAll({
            include: [
                {
                    model: Perangkat,
                    as: 'perangkat',
                    attributes: ['id', 'kode']
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username']
                }
            ]
        });

        const perangkatList = aksesList.map(entry => entry.perangkat);

        return res.status(200).json({ aksesList });
    } catch (error) {
        console.error('Gagal mengambil data akses:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat mengambil akses perangkat.' });
    }
};

exports.getAksesByUser = async (req, res) => {
    try {
        const user_id = req.user.id;

        const aksesList = await AksesMonitoring.findAll({
            where: { user_id },
            include: [
                {
                    model: Perangkat,
                    as: 'perangkat',
                    attributes: ['id', 'kode']
                }
            ]
        });

        const perangkatList = aksesList.map(entry => entry.perangkat);

        return res.status(200).json({ perangkat: perangkatList });
    } catch (error) {
        console.error('Gagal mengambil data akses:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat mengambil akses perangkat.' });
    }
};