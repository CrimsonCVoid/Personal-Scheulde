const jwt = require('jsonwebtoken');
const database = require('../database/connection');
const logger = require('../utils/logger');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header'
      });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database
      const user = await database('users')
        .where({ id: decoded.userId, is_active: true })
        .first();
        
      if (!user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'User not found or inactive'
        });
      }

      // Check if Canvas token is still valid
      if (user.canvas_token_expires_at && new Date(user.canvas_token_expires_at) <= new Date()) {
        logger.warn(`Canvas token expired for user ${user.id}`);
        // Could implement token refresh here
      }

      req.user = user;
      next();
    } catch (jwtError) {
      logger.warn('JWT verification failed:', jwtError.message);
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token'
      });
    }
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication error'
    });
  }
};

module.exports = authMiddleware;