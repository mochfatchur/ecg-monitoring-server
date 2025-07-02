const jwt = require('jsonwebtoken');
const config = require('../config/appConfig.js');
const { User } = require('../models');

exports.verifyToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : null;
    console.log('test: ', token);
    if (!token) {
        return res.status(403).json({ message: 'Token tidak diberikan' });
    }

    try {
        console.log('secret: ', config.Jwt.secret);
        const decoded = jwt.verify(token, config.Jwt.secret);
        console.log('decode: ', decoded);


        const user = await User.findByPk(decoded.id);
        if (!user) return res.status(401).json({ error: 'User tidak ditemukan.' });

        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
};
