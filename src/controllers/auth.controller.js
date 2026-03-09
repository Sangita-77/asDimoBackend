import {
  registerUser,
  loginUser,
  getUserById,
  getAllUsersService,
} from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, flag, organizationId } = req.body;

  // Validate required fields
  if (!name || !email || flag === undefined || flag === null) {
    return res.status(400).json({
      success: false,
      message: "Please provide name, email, and flag",
    });
  }

  // For ParentsOrg (2) and TeachersOrg (3), organizationId is required
  const numericFlag = Number(flag);
  if ((numericFlag === 2 || numericFlag === 3) && !organizationId) {
    return res.status(400).json({
      success: false,
      message: "organizationId is required for flag 2 and 3",
    });
  }

  const { user, generatedPassword, role } = await registerUser({
    name,
    email,
    flag,
    organizationId,
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      user,
      generatedPassword, // send auto-generated password so it can be shown/sent to the user
      role,
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

/**
 * Get all users (protected route)
 * GET /api/auth/getAllUsers
 */

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await getAllUsersService();

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});
