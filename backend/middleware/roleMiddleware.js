/**
 * Role-based access control middleware.
 * Usage: router.get('/admin-route', protect, authorizeRoles('admin'), handler)
 *
 * @param {...string} roles - Allowed roles (e.g. 'admin', 'student')
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: 'Not authenticated.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(', ')}.`,
      });
    }

    next();
  };
};

module.exports = { authorizeRoles };
