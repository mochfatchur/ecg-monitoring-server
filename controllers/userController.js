const bcrypt = require('bcrypt');
const { User } = require('../models/index.js');

exports.register = async (req, res) => {
    const { username, name, password } = req.body;

    console.log(username, password, name);

    if (!username || !name || !password) {
        return res.status(400).json({ message: 'Harap lengkapi semua bidang yang diperlukan.' });
    }

    try {
        // Check if username already exists
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ message: 'Username sudah digunakan' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = await User.create({
            username,
            name,
            password: hashedPassword,
            isAdmin: false,
        });

        res.status(201).json({
            message: 'Registrasi berhasil',
            user: {
                id: newUser.id,
                username: newUser.username,
                name: newUser.name,
                isAdmin: false
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
};
