const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models/index.js');
const config = require('../config/appConfig.js');

exports.login = async (req, res) => {
    const { username, password } = req.body;

    // console.log(username, password);

    try {
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(401).json({ message: 'Username atau password salah' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Username atau password salah' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, config.Jwt.secret, {
            expiresIn: config.Jwt.expiresIn
        });

        res.status(200).json({
            message: 'Login berhasil',
            token,
            user: {
                id: user.id,
                name: user.username,
                username: user.username
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
};
