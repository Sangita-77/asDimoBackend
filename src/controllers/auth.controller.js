import {
  registerUser,
  loginUser,
  getUserById,
  getAllUsersService,
  logoutUser,
  refreshAuthToken,
  updateUserService,
  updateProfileById,
  deleteUsersService,
  verifyEmailAndSendOTP,
  validateOTP,
  resetPasswordWithOTP,
  getAllUsersServiceById,
} from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";


export const register = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    flag,
    organizationId,
    organization_type,
    superAdminId,
    zonalAdminId,
    adminId,
    organizationAdminId,
    therapistId,
    teacherId,
    city,
    state,
    pincode,
    address,
    phone,
    country,
  } = req.body;

  if (!name || !email || flag === undefined || flag === null) {
    return res.status(400).json({
      success: false,
      message: "Please provide name, email, and flag",
    });
  }

  const numericFlag = Number(flag);

  if (numericFlag === 6 && (!superAdminId || !city || !state || !pincode || !address)) {
    return res.status(400).json({
      success: false,
      message: "superAdminId and full address are required for Zonal Admin",
    });
  }

  if (numericFlag === 7 && (!zonalAdminId || !city || !state || !pincode || !address)) {
    return res.status(400).json({
      success: false,
      message: "zonalAdminId and full address are required for Admin",
    });
  }

  if (numericFlag === 1 && (!adminId || !city || !state || !pincode || !address)) {
    return res.status(400).json({
      success: false,
      message: "adminId and full address are required for Organization Admin",
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

  if (numericFlag === 3 && !organizationAdminId && !organizationId) {
    return res.status(400).json({
      success: false,
      message: "organizationAdminId is required for Therapist",
    });
  }

  if (numericFlag === 2 && !therapistId && !teacherId) {
    return res.status(400).json({
      success: false,
      message: "therapistId is required for Parent",
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
    phone,
    country,
    superAdminId,
    zonalAdminId,
    adminId,
    organizationAdminId,
    therapistId,
    teacherId,
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
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide email and password",
    });
  }

  const { user, token, accessToken, refreshToken } = await loginUser(email, password);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user,
      token,
      accessToken,
      refreshToken,
    },
  });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: tokenFromBody } = req.body;

  if (!tokenFromBody) {
    return res.status(400).json({
      success: false,
      message: "Refresh token is required",
    });
  }

  const { user, token, accessToken, refreshToken: newRefreshToken } =
    await refreshAuthToken(tokenFromBody);

  res.status(200).json({
    success: true,
    message: "Token refreshed successfully",
    data: {
      user,
      token,
      accessToken,
      refreshToken: newRefreshToken,
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
  const { flag, search, sort, sortBy, sortOrder } = req.body;

  if (flag === undefined || flag === null) {
    return res.status(400).json({
      success: false,
      message: "Flag is required",
    });
  }

  const users = await getAllUsersService(Number(flag), {
    search,
    sort,
    sortBy,
    sortOrder,
  });

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});


export const logout = asyncHandler(async (req, res) => {
  const token = req.token;

  const refreshToken = req.body.refreshToken;

  await logoutUser(token, refreshToken);

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

// export const updateUser = asyncHandler(async (req, res) => {
//   const userId = req.params.id;

//   const {
//     name,
//     email,
//     flag,
//     organizationId,
//     organization_type,
//     superAdminId,
//     zonalAdminId,
//     adminId,
//     organizationAdminId,
//     therapistId,
//     teacherId,
//     city,
//     state,
//     pincode,
//     address,
//     status,
//     profileImg
//   } = req.body;

//   const result = await updateUserService(userId, {
//     name,
//     email,
//     flag,
//     organizationId,
//     organization_type,
//     superAdminId,
//     zonalAdminId,
//     adminId,
//     organizationAdminId,
//     therapistId,
//     teacherId,
//     city,
//     state,
//     pincode,
//     address,
//     status,
//     profileImg
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
    superAdminId,
    zonalAdminId,
    adminId,
    organizationAdminId,
    therapistId,
    teacherId,
    city,
    state,
    pincode,
    address,
    status,
  } = req.body;

  const profileImg = req.file
    ? `/uploads/profile/${req.file.filename}`
    : req.body.profileImg;

  const result = await updateUserService(userId, {
    name,
    email,
    flag,
    organizationId,
    organization_type,
    superAdminId,
    zonalAdminId,
    adminId,
    organizationAdminId,
    therapistId,
    teacherId,
    city,
    state,
    pincode,
    address,
    status,
    profileImg,
  });

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: result,
  });
});

export const deleteUsersCon = asyncHandler(async (req, res) => {
  const { userIds } = req.body;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Please provide userIds array",
    });
  }

  const result = await deleteUsersService(userIds);

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  res.status(200).json({
    success: true,
    message: "Password reset email sent successfully",
    data: { email },
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, password } = req.body;
  if (!email || !otp || !password) {
    return res.status(400).json({ success: false, message: "Email, OTP, and new password are required" });
  }

  const result = await resetPasswordWithOTP(email, otp, password);

  res.status(200).json({
    success: true,
    message: result.message,  
  });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  const result = await verifyEmailAndSendOTP(email);

  res.status(200).json({
    success: true,
    message: result.message,
    data: { email: result.email },
  });
});

export const validateEmailOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ success: false, message: "Email and OTP are required" });
  }

  const result = await validateOTP(email, otp);

  res.status(200).json({
    success: true,
    message: result.message,
    data: { userId: result.userId },
  });
});

export const updateProfile = asyncHandler(async (req, res) => {

  const profileData = {
    ...req.body,
    profileImg: req.file
      ? `/uploads/profile/${req.file.filename}`
      : req.body.profileImg,
  };

  const updatedProfile = await updateProfileById(
    req.user._id,
    profileData
  );

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: updatedProfile,
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: "Current and new password are required" });
  }

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});


export const getAllUsersById = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "userId is required",
    });
  }

  const users = await getAllUsersServiceById(userId);

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});