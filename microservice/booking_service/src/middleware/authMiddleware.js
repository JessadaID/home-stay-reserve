// src/middleware/authMiddleware.js
// JWT authentication middleware — validates Bearer token and checks role

const jwt = require('jsonwebtoken');

/**
 * Middleware factory that verifies JWT and enforces role-based access.
 * @param {string[]} roles - Allowed roles (e.g., ['admin'], ['customer', 'admin'])
 *                           Pass empty array to allow any authenticated user.
 */
const authMiddleware = (roles = []) => {
    return (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ message: 'Authorization token required' });
            }

            const token = authHeader.split(' ')[1];

            // Verify token with same secret as auth_service
            const decoded = jwt.verify(token, process.env.JWT_SECRET, {
                issuer: process.env.JWT_ISSUER,
                audience: process.env.JWT_AUDIENCE,
            });

            req.user = decoded;

            // Check role authorization
            if (roles.length && !roles.includes(req.user.role)) {
                return res.status(403).json({ message: 'Forbidden: Insufficient privileges' });
            }

            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expired' });
            }
            return res.status(401).json({ message: 'Invalid token' });
        }
    };
};

module.exports = authMiddleware;
