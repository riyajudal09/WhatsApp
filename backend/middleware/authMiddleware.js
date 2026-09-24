const jwt = require('jsonwebtoken');
const response = require('../utils/responseHandler');

module.exports = (req, res, next) => {
  try {
    // Get JWT from Authorization header
    const bearer = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null;

    // First use Bearer token.
    // If Bearer token is not available, use cookie.
    const token = bearer || req.cookies?.auth_token;

    if (!token) {
      return response(res, 401, 'Unauthorized');
    }

    if (!process.env.JWT_SECRET) {
      return response(
        res,
        500,
        'JWT_SECRET is not configured'
      );
    }

    // Verify JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Save authenticated user information
    req.user = {
      ...decoded,
      userId: decoded.userId || decoded.id,
    };

    if (!req.user.userId) {
      return response(
        res,
        401,
        'Invalid authentication token'
      );
    }

    next();

  } catch (error) {
    return response(
      res,
      401,
      'Unauthorized: invalid or expired token'
    );
  }
};