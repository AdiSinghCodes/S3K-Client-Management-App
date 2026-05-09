// Role middleware - check if user is senior_management/admin
export function founderOnly(req, res, next) {
  try {
    // Check if user exists (authMiddleware must run first)
    if (!req.user) {
      console.warn('No user found in request');
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No user found. Please login first.'
      });
    }

    console.log('Role check - User role:', req.user.role, 'User ID:', req.user.id);

    // Check if user is senior_management or admin
    const isFounder = req.user.role === 'senior_management' || req.user.role === 'admin';

    if (!isFounder) {
      console.warn('User', req.user.id, 'with role', req.user.role, 'attempted to access restricted resource');
      return res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Required role: senior_management or admin. Your role: ${req.user.role}`
      });
    }

    // User has access, proceed
    console.log('User', req.user.id, 'with role', req.user.role, 'granted access');
    next();
  } catch (error) {
    console.error('Senior management middleware error:', error.message);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
}

// Role middleware - check if user is team member
export function teamOnly(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No user found. Please login first.'
      });
    }

    const isTeam = req.user.role === 'team';

    if (!isTeam) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only team members can access this resource'
      });
    }

    next();
  } catch (error) {
    console.error('Team only middleware error:', error.message);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
}

// Role middleware - check if user owns the resource
export function ownerOrFounder(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No user found. Please login first.'
      });
    }

    // Get userId from params (e.g., /users/:userId)
    const resourceUserId = parseInt(req.params.userId || req.params.id);
    const isFounder = req.user.role === 'founder' || req.user.role === 'admin';
    const isOwner = req.user.id === resourceUserId;

    if (!isOwner && !isFounder) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only access your own resources. Founders can access all.'
      });
    }

    next();
  } catch (error) {
    console.error('Owner or founder middleware error:', error.message);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
}

// Role middleware - allow multiple roles
export function allowRoles(...roles) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'No user found. Please login first.'
        });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          error: 'Forbidden',
          message: `Only users with roles: ${roles.join(', ')} can access this resource`
        });
      }

      next();
    } catch (error) {
      console.error('Allow roles middleware error:', error.message);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  };
}
