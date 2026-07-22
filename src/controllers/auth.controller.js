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
  getAllUsersByRelationService,
  addChildInformationService,
} from "../services/auth.service.js";
import {
  sendEmailOtp,
  validateEmailOtp,
} from "../services/emailOtp.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import OrganizationAdmin from "../models/organizationAdmin.model.js";


export const register = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    flag,
    referralCode,
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
    org_name,
    therapist_category,
  } = req.body;

  // console.log("BODY =>", req.body);
  // console.log("FILE =>", req.file);

  const profileImg = req.file
  ? `/uploads/profile/${req.file.filename}`
  : null;

  if (!name || !email || flag === undefined || flag === null) {
    return res.status(400).json({
      success: false,
      message: "Please provide name, email, and flag",
    });
  }

  const numericFlag = Number(flag);

  const therapistCategories = [
    "Psychologist",
    "speech therapist",
    "special educator",
    "operational therapist",
  ];

  if (
    [3, 5].includes(numericFlag) &&
    !therapistCategories.includes(therapist_category)
  ) {
    return res.status(400).json({
      success: false,
      message:
        "therapist_category is required for Therapist and Global Therapist and must be Psychologist, speech therapist, special educator, or operational therapist",
    });
  }

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

  if (numericFlag === 5 && !adminId) {
    return res.status(400).json({
      success: false,
      message: "adminId is required for Global Therapist",
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

  if (
    numericFlag === 2 &&
    !therapistId &&
    !teacherId &&
    !referralCode
  ) {
    return res.status(400).json({
      success: false,
      message: "therapistId or referralCode is required for Parent",
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

  let generatedOrgName = org_name;

  if (numericFlag === 5) {
    // First 3 letters of name
    const prefix = name
      .trim()
      .substring(0, 3)
      .toUpperCase();

    // Find last generated org_name
    const lastOrg = await OrganizationAdmin.findOne({
      org_name: { $regex: `^${prefix}_` },
    }).sort({ org_name: -1 });

    let nextNumber = 1;

    if (lastOrg) {
      const lastSequence = parseInt(lastOrg.org_name.split("_")[1]) || 0;
      nextNumber = lastSequence + 1;
    }

    generatedOrgName = `${prefix}_${String(nextNumber).padStart(3, "0")}`;
  }

  if (numericFlag === 1) {
    generatedOrgName = name;
  }

  const { user, generatedPassword, role } = await registerUser({
    name,
    email,
    flag,
    referralCode,
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
    pincode,
    profileImg,
    org_name: generatedOrgName,
    therapist_category,
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

export const getAllUsersByRelation = asyncHandler(async (req, res) => {
  const {
    flag,
    userId,
    search,
    sort,
    sortBy,
    sortOrder,
  } = req.body;

  if (flag === undefined || flag === null) {
    return res.status(400).json({
      success: false,
      message: "Flag is required",
    });
  }

  const users = await getAllUsersByRelationService(Number(flag), userId, {
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

// export const updateProfile = asyncHandler(async (req, res) => {

//   const profileData = {
//     ...req.body,
//     profileImg: req.file
//       ? `/uploads/profile/${req.file.filename}`
//       : req.body.profileImg,
//   };

//   const updatedProfile = await updateProfileById(
//     req.user._id,
//     profileData
//   );

//   res.status(200).json({
//     success: true,
//     message: "Profile updated successfully",
//     data: updatedProfile,
//   });
// });


export const updateProfile = asyncHandler(async (req, res) => {
  // console.log("PARAM ID:", req.params.id);
  // console.log("BODY:", req.body);

  const profileData = {
    ...req.body,
    profileImg: req.file
      ? `/uploads/profile/${req.file.filename}`
      : req.body.profileImg,
  };

  const updatedProfile = await updateProfileById(
    req.params.id,
    profileData
  );

  console.log("UPDATED:", updatedProfile);

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

// OTP flow for any valid email address. It uses in-memory storage only.
export const sendOtpToEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await sendEmailOtp(email);

  res.status(200).json({
    success: true,
    message: "OTP sent successfully",
    data: result,
  });
});

export const validateUnregisteredEmailOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const result = validateEmailOtp(email, otp);

  res.status(200).json({
    success: true,
    message: "OTP validated successfully",
    data: { email: result.email, verified: true },
  });
});

export const addChildInformation = asyncHandler(async (req, res) => {
  const {
    parentId,
    childName,
    childAge,
    childGender,
    grade,
    familyType,
    language,
    dob,
  } = req.body;

  if (
    parentId === undefined ||
    !childName ||
    childAge === undefined ||
    !childGender ||
    !grade ||
    !familyType ||
    !language
  ) {
    return res.status(400).json({
      success: false,
      message:
        "parentId, childName, childAge, childGender, grade, familyType, and language are required",
    });
  }

  const child = await addChildInformationService(parentId, {
    childName,
    childAge,
    childGender,
    grade,
    familyType,
    language,
    dob,
  });

  res.status(201).json({
    success: true,
    message: "Child information added successfully",
    data: child,
  });
});
