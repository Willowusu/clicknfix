const jwt = require('jsonwebtoken');
const User = require('../models/User');
const response = require('../utils/response');

/**
 * Authentication middleware to verify JWT token and set user info
 * Expects token in Authorization header in format: "Bearer <token>"
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json(response(401, 'error', null, 'No token provided'));
    }

    // Check if header format is correct
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json(response(401, 'error', null, 'Token format invalid'));
    }

    const token = parts[1];

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user and attach to request
      const user = await User.findById(decoded.userId)
        .select('-password')
        .populate('branch')
        .populate('organization');

      if (!user) {
        return res.status(401).json(response(401, 'error', null, 'User not found'));
      }

      // Set user info in request object
      req.user = user;
      req.userId = user._id; // Keep for backward compatibility
      req.role = user.role; // Keep for backward compatibility

      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json(response(401, 'error', null, 'Token expired'));
      }
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json(response(401, 'error', null, 'Invalid token'));
      }
      throw err;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json(response(500, 'error', null, 'Server error in authentication'));
  }
};

module.exports = authenticateToken;
