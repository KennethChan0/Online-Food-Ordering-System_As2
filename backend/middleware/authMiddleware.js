const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware: Verify the JWT signature, re-check the user by id, and post it to req.user. All failures are 401.
const protect = async (req, res, next) => {
    let token;

    // No "Authorization: Bearer xxx" results in a 401 error with "no token".
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

    //Verify signature + inspect payload JWT verification failed (expired, altered, secret incorrect). 401. Also, an additional check on the decoded ID. The ID must be a string.
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
// Each request checks the user anew; Even if the token is valid within 30 days, if the user is deleted and findById returns null, it results in a 401 "user not found." This is the reason for "the token becomes invalid immediately after the account is deleted."
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