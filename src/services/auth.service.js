import User from "../models/user.model.js";
import { generateToken } from "../utils/jwt.js";
import { sendEmail } from "../utils/sendEmail.js";

const generateRandomPassword = (length = 8) => {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

/**
 * Register a new user
 * @param {object} userData - User data (name, email, flag)
 * @returns {object} Created user object and generated password
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
    const generatedPassword = generateRandomPassword();

    // Create user (password will be hashed by pre-save hook)
    const user = await User.create({
      name: userData.name,
      email: userData.email,
      flag: Number(userData.flag),
      password: generatedPassword,
      status: 1 ,
    });

    await sendEmail(
      userData.email,
      "Your Account Credentials",
      `
        <h2>Welcome ${userData.name}</h2>
        <p>Your account has been created successfully.</p>
        <p><strong>Email:</strong> ${userData.email}</p>
        <p><strong>Password:</strong> ${generatedPassword}</p>
        <p>Please login and change your password.</p>
      `
    );
  

    // Return user without password, plus the generated password separately
    const userObject = user.toObject();
    delete userObject.password;
    return { user: userObject, generatedPassword };
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
  // Find user and include password
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  //  CHECK STATUS FIRST
  if (user.status !== 1) {
    const error = new Error("Your account is inactive. Please contact admin.");
    error.statusCode = 403;
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

  // Remove password
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


/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {object} User object
 */

export const getAllUsersService = async () => {
  const users = await User.find().select("-password");

  if (!users) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return users; 
};
