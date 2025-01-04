const jwt = require('jsonwebtoken');
const config = require('../config/appConfig.js');

exports.verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(403).json({ message: 'Token tidak diberikan' });
    }

    try {
        const decoded = jwt.verify(token, config.jwt.secret);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token tidak valid' });
    }
};
