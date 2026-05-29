export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (!allowedRoles.length) {
      return next();
    }

    const userRole = req.user.role || req.user.flag || "";
    if (allowedRoles.includes(userRole)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Forbidden: insufficient permissions",
    });
  };
};
