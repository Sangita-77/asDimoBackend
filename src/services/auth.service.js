import User from "../models/user.model.js";
import Parent from "../models/parents.model.js";
import Teacher from "../models/teachers.model.js";
import SuperAdmin from "../models/superAdmin.model.js";
import OrganizationAdmin from "../models/organizationAdmin.model.js";
import BlacklistLog from "../models/blacklistLog.model.js";
import ZonalAdmin from "../models/zonalAdmin.model.js";
import mongoose from "mongoose";
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


    // organization_type required for organization admin
    if (flag === 1) {
      if (userData.organization_type === undefined) {
        const error = new Error("organization_type is required for Organization Admin");
        error.statusCode = 400;
        throw error;
      }

      const orgType = Number(userData.organization_type);

      if (![0, 1].includes(orgType)) {
        const error = new Error("organization_type must be 0 (Clinic) or 1 (School)");
        error.statusCode = 400;
        throw error;
      }
    }

    // If flag is 2 or 3, organizationId is required (stored only on Parent/Teacher docs)
    // Here organizationId is the organization's users.userId (Number)
    let organizationUserIdForPT = null;
    if (flag === 2 || flag === 3) {
      if (!userData.organizationId) {
        const error = new Error("organizationId is required for flag 2 and 3");
        error.statusCode = 400;
        throw error;
      }

      organizationUserIdForPT = Number(userData.organizationId);
      if (!Number.isFinite(organizationUserIdForPT) || organizationUserIdForPT <= 0) {
        const error = new Error("Invalid organizationId");
        error.statusCode = 400;
        throw error;
      }
    }

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
                adminId: user.userId,
                userId: user.userId,
                user: user._id,
                // for OrganizationAdmin, organizationId is this same user's userId
                organizationId: user.userId,
                organization_type: Number(userData.organization_type),
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
                organizationId: flag === 2 ? organizationUserIdForPT : null,
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
                organizationId: flag === 3 ? organizationUserIdForPT : null,
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
                address: userData.address,
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
              adminId: user.userId,
              userId: user.userId,
              user: user._id,
              // for OrganizationAdmin, organizationId is this same user's userId
              organizationId: user.userId,
            });
          } else if (flag === 2 || flag === 4) {
            roleDoc = await Parent.create({
              parentId: user.userId,
              userId: user.userId,
              user: user._id,
              organizationId: flag === 2 ? organizationUserIdForPT : null,
            });
          } else if (flag === 3 || flag === 5) {
            roleDoc = await Teacher.create({
              teacherId: user.userId,
              userId: user.userId,
              user: user._id,
              organizationId: flag === 3 ? organizationUserIdForPT : null,
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

  // Generate token
  const token = generateToken(user._id.toString());

  // Remove password
  const userObject = user.toObject();
  delete userObject.password;

  return { user: userObject, token };
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

  return {
    user,
    roleData
  };
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



export const logoutUser = async (token) => {
  if (!token) {
    const error = new Error("Token not provided");
    error.statusCode = 400;
    throw error;
  }

  await BlacklistLog.create({
    token,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return true;
};

export const updateUserService = async (userId, userData) => {
  const session = await mongoose.startSession();

  let user;
  let roleDoc;

  try {
    await session.withTransaction(async () => {

      // 1. Find existing user
      user = await User.findById(userId).session(session);
      if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
      }

      const flag = Number(userData.flag ?? user.flag);

      // 2. Validate conditions
      if (flag === 1 && userData.organization_type === undefined) {
        throw new Error("organization_type is required for Organization Admin");
      }

      if (flag === 1 && ![0, 1].includes(Number(userData.organization_type))) {
        throw new Error("organization_type must be 0 (Clinic) or 1 (School)");
      }

      if ((flag === 2 || flag === 3) && !userData.organizationId) {
        throw new Error("organizationId is required for flag 2 and 3");
      }

      // 3. Update USER
      user.name = userData.name ?? user.name;
      user.email = userData.email ?? user.email;
      user.flag = flag;

      await user.save({ session });

      // 4. Update ROLE COLLECTION
      if (flag === 0) {
        roleDoc = await SuperAdmin.findOneAndUpdate(
          { userId: user.userId },
          {},
          { new: true, session }
        );
      }

      else if (flag === 1) {
        roleDoc = await OrganizationAdmin.findOneAndUpdate(
          { userId: user.userId },
          {
            organization_type: Number(userData.organization_type),
          },
          { new: true, session }
        );
      }

      else if (flag === 2 || flag === 4) {
        roleDoc = await Parent.findOneAndUpdate(
          { userId: user.userId },
          {
            organizationId: flag === 2 ? Number(userData.organizationId) : null,
          },
          { new: true, session }
        );
      }

      else if (flag === 3 || flag === 5) {
        roleDoc = await Teacher.findOneAndUpdate(
          { userId: user.userId },
          {
            organizationId: flag === 3 ? Number(userData.organizationId) : null,
          },
          { new: true, session }
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