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
  const { name, email, flag, organizationId, organization_type } = req.body;

  if (!name || !email || flag === undefined || flag === null) {
    return res.status(400).json({
      success: false,
      message: "Please provide name, email, and flag",
    });
  }

  const numericFlag = Number(flag);

  // organization_type mandatory for OrganizationAdmin
  if (numericFlag === 1 && organization_type === undefined) {
    return res.status(400).json({
      success: false,
      message: "organization_type is required for Organization Admin",
    });
  }

  // Validate organization_type value
  if (numericFlag === 1 && ![0, 1].includes(Number(organization_type))) {
    return res.status(400).json({
      success: false,
      message: "organization_type must be 0 (Clinic) or 1 (School)",
    });
  }

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
    organization_type
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      user,
      generatedPassword,
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
