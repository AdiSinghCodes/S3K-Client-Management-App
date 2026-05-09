import { verifyToken, extractTokenFromHeader } from '../utils/jwt.js';

// Authentication middleware - verify JWT token
export function authMiddleware(req, res, next) {
  try {
    // Get authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No authorization header provided'
      });
    }

    // Extract token from "Bearer <token>"
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid authorization header format. Use: Bearer <token>'
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token'
      });
    }

    // Attach user info to request
    req.user = {
      id: decoded.id,
      role: decoded.role,
      name: decoded.name
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
}

// Optional authentication - doesn't fail if no token
export function optionalAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const token = extractTokenFromHeader(authHeader);
      
      if (token) {
        const decoded = verifyToken(token);
        
        if (decoded) {
          req.user = {
            id: decoded.id,
            role: decoded.role
          };
        }
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error.message);
    next();
  }
}
