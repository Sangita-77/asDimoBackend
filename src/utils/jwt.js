import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

/**
 * Generate JWT token for a user
 * @param {string} userId - User ID to encode in token
 * @returns {string} JWT token
 */
export const generateToken = (userId) => {
  return jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

export const generateAccessToken = generateToken;

export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId, type: "refresh" }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });
};

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token to verify
 * @returns {object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

export const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);

    if (decoded.type !== "refresh") {
      throw new Error("Invalid refresh token");
    }

    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired refresh token");
  }
};
