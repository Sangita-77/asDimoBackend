import User from "../models/user.model.js";
import { generateToken } from "../utils/jwt.js";

/**
 * Register a new user
 * @param {object} userData - User data (name, email, password)
 * @returns {object} Created user object
 */
export const registerUser = async (userData) => {
  // Check if user already exists
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    const error = new Error("User with this email already exists");
    error.statusCode = 400;
    throw error;
  }

  try {
    // Create user (password will be hashed by pre-save hook)
    const user = await User.create({
      name: userData.name,
      email: userData.email,
      password: userData.password,
    });

    // Return user without password
    const userObject = user.toObject();
    delete userObject.password;
    return userObject;
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      error.statusCode = 400;
    }
    throw error;
  }
};

/**
 * Login user and return token
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {object} User object and JWT token
 */
export const loginUser = async (email, password) => {
  // Find user and include password field
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  // Compare password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  // Generate token
  const token = generateToken(user._id.toString());

  // Return user without password and token
  const userObject = user.toObject();
  delete userObject.password;
  return { user: userObject, token };
};

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {object} User object
 */
export const getUserById = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  return user;
};
