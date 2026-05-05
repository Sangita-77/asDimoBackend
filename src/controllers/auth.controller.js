import {
  registerUser,
  loginUser,
  getUserById,
  getAllUsersService,
  logoutUser,
  updateUserService,
  deleteUserService,
} from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";


export const register = asyncHandler(async (req, res) => {
  const { name, email, flag, organizationId, organization_type ,zonalAdminId,city,state,pincode,address } = req.body;

  if (!name || !email || flag === undefined || flag === null) {
    return res.status(400).json({
      success: false,
      message: "Please provide name, email, and flag",
    });
  }

  const numericFlag = Number(flag);

  if (numericFlag === 6 && !city && !state && !pincode && !address) {
    return res.status(400).json({
      success: false,
      message: "full address is required for Zonal Admin",
    });
  }

  if (numericFlag === 1 && !city && !state && !pincode && !address && !zonalAdminId) {
    return res.status(400).json({
      success: false,
      message: "full address and zonal admin id is required",
    });
  }

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

  // const { user, generatedPassword, role } = await registerUser({
  //   name,
  //   email,
  //   flag,
  //   organizationId,
  //   organization_type,
  //   address
  // });

  const { user, generatedPassword, role } = await registerUser({
    name,
    email,
    flag,
    organizationId,
    organization_type,
    address,
    zonalAdminId,
    city,
    state,
    pincode
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

export const getProfile = asyncHandler(async (req, res) => {
  const user = await getUserById(req.user._id);

  res.status(200).json({
    success: true,
    data: user,
  });
});


export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await getAllUsersService();

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});


export const logout = asyncHandler(async (req, res) => {
  const token = req.token; // coming from middleware

  await logoutUser(token);

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});


// export const updateUser = asyncHandler(async (req, res) => {
//   const userId = req.params.id;
//   const { name, email, flag, organizationId, organization_type } = req.body;

//   const result = await updateUserService(userId, {
//     name,
//     email,
//     flag,
//     organizationId,
//     organization_type,
//   });

//   res.status(200).json({
//     success: true,
//     message: "User updated successfully",
//     data: result,
//   });
// });

export const updateUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  const {
    name,
    email,
    flag,
    organizationId,
    organization_type,
    city,
    state,
    pincode,
    address,
    status
  } = req.body;

  const result = await updateUserService(userId, {
    name,
    email,
    flag,
    organizationId,
    organization_type,
    city,
    state,
    pincode,
    address,
    status
  });

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: result,
  });
});

export const deleteUserCon = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const result = await deleteUserService(userId);

  res.status(200).json({
    success: true,
    message: result.message,
  });
});