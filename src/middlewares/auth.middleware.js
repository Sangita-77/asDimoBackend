import { verifyToken } from "../utils/jwt.js";
import User from "../models/user.model.js";

/**
 * Authentication middleware to protect routes
 * Verifies JWT token and attaches user to request object
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided. Access denied.",
      });
    }

    // Extract token (remove "Bearer " prefix)
    const token = authHeader.substring(7);

    // Verify token
    const decoded = verifyToken(token);

    // Get user from database (exclude password)
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Token invalid.",
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || "Invalid or expired token",
    });
  }
};
