import {
  registerUser,
  loginUser,
  getUserById,
} from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, flag } = req.body;

  // Validate required fields
  if (!name || !email || flag === undefined || flag === null) {
    return res.status(400).json({
      success: false,
      message: "Please provide name, email, and flag",
    });
  }

  const { user, generatedPassword } = await registerUser({
    name,
    email,
    flag,
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      user,
      generatedPassword, // send auto-generated password so it can be shown/sent to the user
    },
  });
});

/**
 * Login user
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide email and password",
    });
  }

  const { user, token } = await loginUser(email, password);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user,
      token,
    },
  });
});

/**
 * Get current user profile (protected route)
 * GET /api/auth/profile
 */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await getUserById(req.user._id);

  res.status(200).json({
    success: true,
    data: user,
  });
});
