import User from "../models/user.model.js";
import Parent from "../models/parents.model.js";
import Teacher from "../models/teachers.model.js";
import SuperAdmin from "../models/superAdmin.model.js";
import OrganizationAdmin from "../models/organizationAdmin.model.js";
import BlacklistLog from "../models/blacklistLog.model.js";
import ZonalAdmin from "../models/zonalAdmin.model.js";
import Admin from "../models/admin.model.js";
import RefreshToken from "../models/refreshToken.model.js";
import mongoose from "mongoose";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
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

const getTokenExpiryDate = (token) => {
  const decoded = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
  return new Date(decoded.exp * 1000);
};

const createRefreshTokenRecord = async (userId, userObjectId) => {
  const refreshToken = generateRefreshToken(userId);

  await RefreshToken.create({
    token: refreshToken,
    user: userObjectId,
    expiresAt: getTokenExpiryDate(refreshToken),
  });

  return refreshToken;
};

const toPositiveNumber = (value, fieldName) => {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) {
    const error = new Error(`Invalid ${fieldName}`);
    error.statusCode = 400;
    throw error;
  }
  return number;
};

const requireField = (value, fieldName, roleName) => {
  if (value === undefined || value === null || value === "") {
    const error = new Error(`${fieldName} is required for ${roleName}`);
    error.statusCode = 400;
    throw error;
  }
};

const getRoleParents = async (flag, userData) => {
  const parents = {};

  if (flag === 6) {
    requireField(userData.superAdminId, "superAdminId", "Zonal Admin");
    const superAdminId = toPositiveNumber(userData.superAdminId, "superAdminId");
    const superAdmin = await SuperAdmin.findOne({ adminId: superAdminId });
    if (!superAdmin) {
      const error = new Error("Super Admin not found with given superAdminId");
      error.statusCode = 404;
      throw error;
    }
    parents.superAdmin = superAdmin;
  }

  if (flag === 7) {
    requireField(userData.zonalAdminId, "zonalAdminId", "Admin");
    const zonalAdminId = toPositiveNumber(userData.zonalAdminId, "zonalAdminId");
    const zonalAdmin = await ZonalAdmin.findOne({ zonalAdminId });
    if (!zonalAdmin) {
      const error = new Error("Zonal Admin not found with given zonalAdminId");
      error.statusCode = 404;
      throw error;
    }
    parents.zonalAdmin = zonalAdmin;
  }

  if (flag === 1) {
    requireField(userData.adminId, "adminId", "Organization Admin");
    const adminId = toPositiveNumber(userData.adminId, "adminId");
    const admin = await Admin.findOne({ adminId });
    if (!admin) {
      const error = new Error("Admin not found with given adminId");
      error.statusCode = 404;
      throw error;
    }
    parents.admin = admin;
  }

  if (flag === 3) {
    const orgAdminLookup = userData.organizationAdminId ?? userData.organizationId;
    requireField(orgAdminLookup, "organizationAdminId", "Therapist");
    const organizationAdminId = toPositiveNumber(orgAdminLookup, "organizationAdminId");
    const organizationAdmin = await OrganizationAdmin.findOne({
      $or: [{ organizationAdminId }, { organizationId: organizationAdminId }],
    });
    if (!organizationAdmin) {
      const error = new Error("Organization Admin not found with given organizationAdminId");
      error.statusCode = 404;
      throw error;
    }
    parents.organizationAdmin = organizationAdmin;
  }

  if (flag === 2) {
    const therapistLookup = userData.therapistId ?? userData.teacherId;
    requireField(therapistLookup, "therapistId", "Parent");
    const therapistId = toPositiveNumber(therapistLookup, "therapistId");
    const therapist = await Teacher.findOne({ teacherId: therapistId });
    if (!therapist) {
      const error = new Error("Therapist not found with given therapistId");
      error.statusCode = 404;
      throw error;
    }
    parents.therapist = therapist;
  }

  return parents;
};


export const registerUser = async (userData) => {

  // return userData;
  // Check if user already exists
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    const error = new Error("User with this email already exists");
    error.statusCode = 400;
    throw error;
  }

  try {
    const generatedPassword = generateRandomPassword();

    const flag = Number(userData.flag);


    if (flag === 1) {
      requireField(userData.organization_type, "organization_type", "Organization Admin");
      if (![0, 1].includes(Number(userData.organization_type))) {
        const error = new Error("organization_type must be 0 (Clinic) or 1 (School)");
        error.statusCode = 400;
        throw error;
      }
    }

    const parents = await getRoleParents(flag, userData);

    // Use transaction when available; fallback to manual rollback if transactions are not supported
    const session = await mongoose.startSession();
    let user;
    let roleDoc;

    try {
      await session.withTransaction(async () => {
        user = await User.create(
          [
            {
              name: userData.name,
              email: userData.email,
              flag,
              password: generatedPassword,
              status: 1,
            },
          ],
          { session }
        );
        user = user[0];

        // Create role-specific "table"
        if (flag === 0) {
          roleDoc = await SuperAdmin.create(
            [
              {
                adminId: user.userId,
                userId: user.userId,
                user: user._id,
              },
            ],
            { session }
          );
          roleDoc = roleDoc[0];
        } else if (flag === 1) {
          roleDoc = await OrganizationAdmin.create(
            [
              {
                organizationAdminId: user.userId,
                userId: user.userId,
                user: user._id,
                // for OrganizationAdmin, organizationId is this same user's userId
                organizationId: user.userId,
                adminId: parents.admin.adminId,
                organization_type: Number(userData.organization_type),
                zonalAdminId: parents.admin.zonalAdminId,
                city : userData.city,
                state : userData.state,
                pincode : userData.pincode,
                address : userData.address,
              },
            ],
            { session }
          );
          roleDoc = roleDoc[0];
        } else if (flag === 2 || flag === 4) {
          roleDoc = await Parent.create(
            [
              {
                parentId: user.userId,
                userId: user.userId,
                user: user._id,
                organizationId: flag === 2 ? parents.therapist.organizationId : null,
                therapistId: flag === 2 ? parents.therapist.teacherId : null,
              },
            ],
            { session }
          );
          roleDoc = roleDoc[0];
        } else if (flag === 3 || flag === 5) {
          roleDoc = await Teacher.create(
            [
              {
                teacherId: user.userId,
                userId: user.userId,
                user: user._id,
                organizationId: flag === 3 ? parents.organizationAdmin.organizationId : null,
                organizationAdminId: flag === 3 ? parents.organizationAdmin.organizationAdminId : null,
              },
            ],
            { session }
          );
          roleDoc = roleDoc[0];
        } else if (flag === 6) {
          roleDoc = await ZonalAdmin.create(
            [
              {
                zonalAdminId: user.userId,
                userId: user.userId,
                user: user._id,
                superAdminId: parents.superAdmin.adminId,
                city : userData.city,
                state : userData.state,
                pincode : userData.pincode,
                address : userData.address,
              },
            ],
            { session }
          );
          roleDoc = roleDoc[0];
        } else if (flag === 7) {
          roleDoc = await Admin.create(
            [
              {
                adminId: user.userId,
                userId: user.userId,
                user: user._id,
                zonalAdminId: parents.zonalAdmin.zonalAdminId,
                city: userData.city,
                state: userData.state,
                pincode: userData.pincode,
                address: userData.address,
                status: 1,
              },
            ],
            { session }
          );
          roleDoc = roleDoc[0];
        } else {
          const error = new Error("Invalid flag value");
          error.statusCode = 400;
          throw error;
        }
      });
    } catch (txErr) {
      // If transactions are not supported (e.g., standalone Mongo), do a best-effort rollback flow
      if (
        typeof txErr?.message === "string" &&
        (txErr.message.includes("Transaction") ||
          txErr.message.includes("replica set") ||
          txErr.message.includes("not supported"))
      ) {
        // Create user first
        user = await User.create({
          name: userData.name,
          email: userData.email,
          flag,
          password: generatedPassword,
          status: 1,
        });

        try {
          if (flag === 0) {
            roleDoc = await SuperAdmin.create({
              adminId: user.userId,
              userId: user.userId,
              user: user._id,
            });
          } else if (flag === 1) {
            roleDoc = await OrganizationAdmin.create({
              organizationAdminId: user.userId,
              userId: user.userId,
              user: user._id,
              organizationId: user.userId,
              adminId: parents.admin.adminId,
              organization_type: Number(userData.organization_type),
              zonalAdminId: parents.admin.zonalAdminId,
              city : userData.city,
              state : userData.state,
              pincode : userData.pincode,
              address : userData.address,
            });
          }else if (flag === 2 || flag === 4) {
            roleDoc = await Parent.create({
              parentId: user.userId,
              userId: user.userId,
              user: user._id,
              organizationId: flag === 2 ? parents.therapist.organizationId : null,
              therapistId: flag === 2 ? parents.therapist.teacherId : null,
            });
          } else if (flag === 3 || flag === 5) {
            roleDoc = await Teacher.create({
              teacherId: user.userId,
              userId: user.userId,
              user: user._id,
              organizationId: flag === 3 ? parents.organizationAdmin.organizationId : null,
              organizationAdminId: flag === 3 ? parents.organizationAdmin.organizationAdminId : null,
            });
          } else if (flag === 6) {
            roleDoc = await ZonalAdmin.create({
                  zonalAdminId: user.userId,
                  userId: user.userId,
                  user: user._id,
                  superAdminId: parents.superAdmin.adminId,
                  city : userData.city,
                  state : userData.state,
                  pincode : userData.pincode,
                  address : userData.address,
                });
          } else if (flag === 7) {
            roleDoc = await Admin.create({
              adminId: user.userId,
              userId: user.userId,
              user: user._id,
              zonalAdminId: parents.zonalAdmin.zonalAdminId,
              city: userData.city,
              state: userData.state,
              pincode: userData.pincode,
              address: userData.address,
              status: 1,
            });
          } else {
            const error = new Error("Invalid flag value");
            error.statusCode = 400;
            throw error;
          }
        } catch (roleErr) {
          await User.deleteOne({ _id: user._id });
          throw roleErr;
        }
      } else {
        throw txErr;
      }
    } finally {
      session.endSession();
    }

    // await sendEmail(
    //   userData.email,
    //   "Your Account Credentials",
    //   `
    //     <h2>Welcome ${userData.name}</h2>
    //     <p>Your account has been created successfully.</p>
    //     <p><strong>Email:</strong> ${userData.email}</p>
    //     <p><strong>Password:</strong> ${generatedPassword}</p>
    //     <p>Please login and change your password.</p>
    //   `
    // );
  

    // Return user without password, plus the generated password separately
    const userObject = user.toObject();
    delete userObject.password;
    return {
      user: userObject,
      generatedPassword,
      role: roleDoc
        ? { collection: roleDoc.constructor?.modelName, _id: roleDoc._id }
        : null,
    };
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      error.statusCode = 400;
    }
    throw error;
  }
};

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

  const token = generateAccessToken(user._id.toString());
  const refreshToken = await createRefreshTokenRecord(user._id.toString(), user._id);

  // Remove password
  const userObject = user.toObject();
  delete userObject.password;

  return { user: userObject, token, accessToken: token, refreshToken };
};

export const getUserById = async (userId) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  let roleData = null;

  if (user.flag === 0) {
    roleData = await SuperAdmin.findOne({ userId: user.userId });
  } 
  else if (user.flag === 1) {
    roleData = await OrganizationAdmin.findOne({ userId: user.userId });
  } 
  else if (user.flag === 2 || user.flag === 4) {
    roleData = await Parent.findOne({ userId: user.userId });
  } 
  else if (user.flag === 3 || user.flag === 5) {
    roleData = await Teacher.findOne({ userId: user.userId });
  }
  else if (user.flag === 6) {
    roleData = await ZonalAdmin.findOne({ userId: user.userId });
  }
  else if (user.flag === 7) {
    roleData = await Admin.findOne({ userId: user.userId });
  } 

  return {
    user,
    roleData
  };
};

export const updateProfileById = async (
  userId,
  profileData
  ) => {

  const allowedUpdates = {};

  if (profileData.name !== undefined) {
    allowedUpdates.name = profileData.name;
  }

  if (profileData.email !== undefined) {
    allowedUpdates.email = profileData.email;
  }

  if (profileData.profileImg !== undefined) {
    allowedUpdates.profileImg =
      profileData.profileImg;
  }

  const user = await User.findByIdAndUpdate(
    userId,
    allowedUpdates,
    {
      returnDocument: "after",
      runValidators: true,
      context: "query",
    }
  ).select("-password");

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

export const getAllUsersService = async () => {
  const users = await User.find().select("-password");

  if (!users) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return users; 
};



export const refreshAuthToken = async (refreshToken) => {
  if (!refreshToken) {
    const error = new Error("Refresh token not provided");
    error.statusCode = 400;
    throw error;
  }

  const decoded = verifyRefreshToken(refreshToken);

  const storedToken = await RefreshToken.findOne({
    token: refreshToken,
    revokedAt: null,
  });

  if (!storedToken || storedToken.expiresAt <= new Date()) {
    const error = new Error("Refresh token is invalid or expired");
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findById(decoded.userId).select("-password");

  if (!user || user.status !== 1) {
    const error = new Error("User not found or inactive");
    error.statusCode = 401;
    throw error;
  }

  storedToken.revokedAt = new Date();
  await storedToken.save();

  const token = generateAccessToken(user._id.toString());
  const newRefreshToken = await createRefreshTokenRecord(user._id.toString(), user._id);

  return {
    user,
    token,
    accessToken: token,
    refreshToken: newRefreshToken,
  };
};

export const logoutUser = async (token, refreshToken) => {
  if (!token) {
    const error = new Error("Token not provided");
    error.statusCode = 400;
    throw error;
  }

  await BlacklistLog.create({
    token,
    expiresAt: getTokenExpiryDate(token),
  });

  if (refreshToken) {
    await RefreshToken.findOneAndUpdate(
      { token: refreshToken, revokedAt: null },
      { revokedAt: new Date() }
    );
  }

  return true;
};

// export const updateUserService = async (userId, userData) => {
//   const session = await mongoose.startSession();

//   let user;
//   let roleDoc;

//   try {
//     await session.withTransaction(async () => {

//       // 1. Find existing user
//       user = await User.findById(userId).session(session);
//       if (!user) {
//         const error = new Error("User not found");
//         error.statusCode = 404;
//         throw error;
//       }

//       const flag = Number(userData.flag ?? user.flag);

//       // 2. Validate conditions
//       if (flag === 1 && userData.organization_type === undefined) {
//         throw new Error("organization_type is required for Organization Admin");
//       }

//       if (flag === 1 && ![0, 1].includes(Number(userData.organization_type))) {
//         throw new Error("organization_type must be 0 (Clinic) or 1 (School)");
//       }

//       if ((flag === 2 || flag === 3) && !userData.organizationId) {
//         throw new Error("organizationId is required for flag 2 and 3");
//       }

//       // 3. Update USER
//       user.name = userData.name ?? user.name;
//       user.email = userData.email ?? user.email;
//       user.flag = flag;

//       await user.save({ session });

//       // 4. Update ROLE COLLECTION
//       if (flag === 0) {
//         roleDoc = await SuperAdmin.findOneAndUpdate(
//           { userId: user.userId },
//           {},
//           { new: true, session }
//         );
//       }

//       else if (flag === 1) {
//         roleDoc = await OrganizationAdmin.findOneAndUpdate(
//           { userId: user.userId },
//           {
//             organization_type: Number(userData.organization_type),
//           },
//           { new: true, session }
//         );
//       }

//       else if (flag === 2 || flag === 4) {
//         roleDoc = await Parent.findOneAndUpdate(
//           { userId: user.userId },
//           {
//             organizationId: flag === 2 ? Number(userData.organizationId) : null,
//           },
//           { new: true, session }
//         );
//       }

//       else if (flag === 3 || flag === 5) {
//         roleDoc = await Teacher.findOneAndUpdate(
//           { userId: user.userId },
//           {
//             organizationId: flag === 3 ? Number(userData.organizationId) : null,
//           },
//           { new: true, session }
//         );
//       }

//       else {
//         throw new Error("Invalid flag");
//       }
//     });

//     session.endSession();

//     const userObj = user.toObject();
//     delete userObj.password;

//     return {
//       user: userObj,
//       role: roleDoc
//         ? { collection: roleDoc.constructor.modelName, _id: roleDoc._id }
//         : null,
//     };

//   } catch (error) {
//     session.endSession();
//     throw error;
//   }
// };


export const updateUserService = async (userId, userData) => {
  const session = await mongoose.startSession();

  let user;
  let roleDoc;

  try {
    await session.withTransaction(async () => {

      // 1. Find user
      user = await User.findById(userId).session(session);
      if (!user) {
        throw new Error("User not found");
      }

      const flag = Number(userData.flag ?? user.flag);

      if (flag === user.flag) {
        if (flag === 1) {
          const existingRole = await OrganizationAdmin.findOne({ userId: user.userId }).session(session);
          userData.adminId ??= existingRole?.adminId;
          userData.organization_type ??= existingRole?.organization_type;
        } else if (flag === 2) {
          const existingRole = await Parent.findOne({ userId: user.userId }).session(session);
          userData.therapistId ??= existingRole?.therapistId;
        } else if (flag === 3) {
          const existingRole = await Teacher.findOne({ userId: user.userId }).session(session);
          userData.organizationAdminId ??= existingRole?.organizationAdminId;
        } else if (flag === 6) {
          const existingRole = await ZonalAdmin.findOne({ userId: user.userId }).session(session);
          userData.superAdminId ??= existingRole?.superAdminId;
        } else if (flag === 7) {
          const existingRole = await Admin.findOne({ userId: user.userId }).session(session);
          userData.zonalAdminId ??= existingRole?.zonalAdminId;
        }
      }

      if (flag === 1) {
        if (userData.organization_type === undefined) {
          throw new Error("organization_type required");
        }

        if (![0, 1].includes(Number(userData.organization_type))) {
          throw new Error("organization_type must be 0 or 1");
        }
      }

      const parents = await getRoleParents(flag, userData);

      user.name = userData.name ?? user.name;
      user.email = userData.email ?? user.email;
      user.status = userData.status ?? user.status;
      user.profileImg = userData.profileImg ?? user.profileImg;
      user.flag = flag;

      await user.save({ session });


      if (flag === 0) {
        roleDoc = await SuperAdmin.findOneAndUpdate(
          { userId: user.userId },
          {},
          {
            returnDocument: "after",
            session
          }
        );
      }

      else if (flag === 1) {
        roleDoc = await OrganizationAdmin.findOneAndUpdate(
          { userId: user.userId },
          {
            organization_type: Number(userData.organization_type),
            adminId: parents.admin.adminId,
            zonalAdminId: parents.admin.zonalAdminId,
            city: userData.city,
            state: userData.state,
            pincode: userData.pincode,
            address: userData.address
          },
          {
            returnDocument: "after",
            session
          }
        );
      }

      else if (flag === 2 || flag === 4) {
        roleDoc = await Parent.findOneAndUpdate(
          { userId: user.userId },
          {
            organizationId: flag === 2 ? parents.therapist.organizationId : null,
            therapistId: flag === 2 ? parents.therapist.teacherId : null,
          },
          {
            returnDocument: "after",
            session
          }
        );
      }

      else if (flag === 3 || flag === 5) {
        roleDoc = await Teacher.findOneAndUpdate(
          { userId: user.userId },
          {
            organizationId: flag === 3 ? parents.organizationAdmin.organizationId : null,
            organizationAdminId: flag === 3 ? parents.organizationAdmin.organizationAdminId : null,
          },
          {
            returnDocument: "after",
            session
          }
        );
      }

      else if (flag === 6) {
        roleDoc = await ZonalAdmin.findOneAndUpdate(
          { userId: user.userId },
          {
            superAdminId: parents.superAdmin.adminId,
            city: userData.city,
            state: userData.state,
            pincode: userData.pincode,
            address: userData.address
          },
          {
            returnDocument: "after",
            session
          }
        );
      }

      else if (flag === 7) {
        roleDoc = await Admin.findOneAndUpdate(
          { userId: user.userId },
          {
            zonalAdminId: parents.zonalAdmin.zonalAdminId,
            city: userData.city,
            state: userData.state,
            pincode: userData.pincode,
            address: userData.address,
            status: userData.status ?? user.status,
          },
          {
            returnDocument: "after",
            session
          }
        );
      }

      else {
        throw new Error("Invalid flag");
      }

    });

    session.endSession();

    const userObj = user.toObject();
    delete userObj.password;

    return {
      user: userObj,
      role: roleDoc
        ? { collection: roleDoc.constructor.modelName, _id: roleDoc._id }
        : null,
    };

  } catch (error) {
    session.endSession();
    throw error;
  }
};

export const deleteUserService = async (userId) => {
  const session = await mongoose.startSession();

  try {
    let user;

    await session.withTransaction(async () => {

      user = await User.findById(userId).session(session);

      if (!user) {
        throw new Error("User not found");
      }

      const flag = user.flag;

      if (flag === 0) {
        await SuperAdmin.deleteOne({ userId: user.userId }).session(session);
      }

      else if (flag === 1) {
        await OrganizationAdmin.deleteOne({ userId: user.userId }).session(session);
      }

      else if (flag === 2 || flag === 4) {
        await Parent.deleteOne({ userId: user.userId }).session(session);
      }

      else if (flag === 3 || flag === 5) {
        await Teacher.deleteOne({ userId: user.userId }).session(session);
      }

      else if (flag === 6) {
        await ZonalAdmin.deleteOne({ userId: user.userId }).session(session);
      }

      else if (flag === 7) {
        await Admin.deleteOne({ userId: user.userId }).session(session);
      }

      else {
        throw new Error("Invalid flag");
      }


      await User.deleteOne({ _id: userId }).session(session);

    });

    session.endSession();

    return { success: true, message: "User deleted successfully" };

  } catch (error) {
    session.endSession();
    throw error;
  }
};

// Generate 5-digit OTP
const generateOTP = () => {
  return Math.floor(10000 + Math.random() * 90000).toString();
};

// Verify email and send OTP
export const verifyEmailAndSendOTP = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    const error = new Error("Email not registered in the system");
    error.statusCode = 404;
    throw error;
  }

  // Generate 5-digit OTP
  const otp = generateOTP();

  // Set OTP expiry to 10 minutes
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  // Update user with OTP and expiry
  user.resetPasswordOTP = otp;
  user.resetPasswordOTPExpiry = otpExpiry;
  await user.save();

  // Send OTP to email
  await sendEmail(
    email,
    "Password Reset OTP",
    `
      <h2>Password Reset Request</h2>
      <p>Hello ${user.name},</p>
      <p>Your OTP for password reset is:</p>
      <h1 style="color: #007bff; font-size: 32px; letter-spacing: 2px;">${otp}</h1>
      <p>This OTP is valid for 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `
  );

  return { success: true, message: "OTP sent to your registered email", email };
};

// Validate OTP
export const validateOTP = async (email, otp) => {
  const user = await User.findOne({ email });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (!user.resetPasswordOTP) {
    const error = new Error("No OTP request found. Please request a password reset first.");
    error.statusCode = 400;
    throw error;
  }

  // Check if OTP matches
  if (user.resetPasswordOTP !== otp) {
    const error = new Error("Invalid OTP");
    error.statusCode = 400;
    throw error;
  }

  // Check if OTP has expired
  if (new Date() > user.resetPasswordOTPExpiry) {
    const error = new Error("OTP has expired. Please request a new one.");
    error.statusCode = 400;
    throw error;
  }

  return { success: true, message: "OTP validated successfully", userId: user._id };
};

// Reset password with OTP
export const resetPasswordWithOTP = async (email, otp, newPassword) => {
  const user = await User.findOne({ email });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (!user.resetPasswordOTP) {
    const error = new Error("No OTP request found");
    error.statusCode = 400;
    throw error;
  }

  // Validate OTP
  if (user.resetPasswordOTP !== otp) {
    const error = new Error("Invalid OTP");
    error.statusCode = 400;
    throw error;
  }

  // Check if OTP has expired
  if (new Date() > user.resetPasswordOTPExpiry) {
    const error = new Error("OTP has expired");
    error.statusCode = 400;
    throw error;
  }

  // Update password
  user.password = newPassword;
  user.resetPasswordOTP = null;
  user.resetPasswordOTPExpiry = null;
  await user.save();

  return { success: true, message: "Password updated successfully" };
};
