const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer ')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            message: 'Not authorized, no token',
        });
    }

    let decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded || typeof decoded.id !== 'string') {
            return res.status(401).json({
                message: 'Not authorized, invalid token',
            });
        }
    } catch (error) {
        return res.status(401).json({
            message: 'Not authorized, token failed',
        });
    }

    try {
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({
                message: 'Not authorized, user not found',
            });
        }

        return next();
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(401).json({
                message: 'Not authorized, invalid user',
            });
        }

        return res.status(500).json({
            message: 'Unable to verify account. Please try again.',
        });
    }
};

module.exports = { protect };