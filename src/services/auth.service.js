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
// import { generateSessionId } from "../utils/session.js";
import { sendNotification } from "./notifications.service.js";


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

    const organizationLookup = [];
    if (therapist.organizationAdminId !== undefined && therapist.organizationAdminId !== null) {
      organizationLookup.push({ organizationAdminId: therapist.organizationAdminId });
    }
    if (therapist.organizationId !== undefined && therapist.organizationId !== null) {
      organizationLookup.push({ organizationId: therapist.organizationId });
    }

    const organizationAdmin = organizationLookup.length
      ? await OrganizationAdmin.findOne({ $or: organizationLookup })
      : null;

    if (therapist.organizationId && !organizationAdmin) {
      const error = new Error("Organization Admin not found for given therapistId");
      error.statusCode = 404;
      throw error;
    }

    parents.organizationAdmin = organizationAdmin;
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
              city : userData.city,
              state : userData.state,
              pincode : userData.pincode,
              address : userData.address,
              phone : userData.phone,
              country : userData.country,
            },
          ],
          { session }
        );
        user = user[0];
        // user = await User.findById(user._id);
        user = await User.findById(user._id).session(session);
        // await user.save({ session });
        // console.log("Created user:", {
        //   _id: user._id,
        //   userId: user.userId,
        // });

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
                country : userData.country,
                phone : userData.phone,
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
                organizationAdminId:
                  flag === 2 ? parents.therapist.organizationAdminId : null,
                zonalAdminId:
                  flag === 2
                    ? parents.therapist.zonalAdminId ??
                      parents.organizationAdmin?.zonalAdminId
                    : null,
                adminId:
                  flag === 2
                    ? parents.therapist.adminId ?? parents.organizationAdmin?.adminId
                    : null,
                therapistId: flag === 2 ? parents.therapist.teacherId : null,
                teacherId: flag === 2 ? parents.therapist.teacherId : null,
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
                zonalAdminId: flag === 3 ? parents.organizationAdmin.zonalAdminId : null,
                adminId: flag === 3 ? parents.organizationAdmin.adminId : null,
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
                superAdminId: userData.superAdminId,
                // superAdminId: parents.superAdmin.adminId,
                city : userData.city,
                state : userData.state,
                pincode : userData.pincode,
                address : userData.address,
                phone : userData.phone,
                country : userData.country,
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
                phone: userData.phone,
                country: userData.country,
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
          city : userData.city,
          state : userData.state,
          pincode : userData.pincode,
          address : userData.address,
          phone : userData.phone,
          country : userData.country,
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
              phone : userData.phone,
              country : userData.country,
            });
          }else if (flag === 2 || flag === 4) {
            roleDoc = await Parent.create({
              parentId: user.userId,
              userId: user.userId,
              user: user._id,
              organizationId: flag === 2 ? parents.therapist.organizationId : null,
              organizationAdminId:
                flag === 2 ? parents.therapist.organizationAdminId : null,
              zonalAdminId:
                flag === 2
                  ? parents.therapist.zonalAdminId ??
                    parents.organizationAdmin?.zonalAdminId
                  : null,
              adminId:
                flag === 2
                  ? parents.therapist.adminId ?? parents.organizationAdmin?.adminId
                  : null,
              therapistId: flag === 2 ? parents.therapist.teacherId : null,
              teacherId: flag === 2 ? parents.therapist.teacherId : null,
            });
          } else if (flag === 3 || flag === 5) {
            roleDoc = await Teacher.create({
              teacherId: user.userId,
              userId: user.userId,
              user: user._id,
              organizationId: flag === 3 ? parents.organizationAdmin.organizationId : null,
              organizationAdminId: flag === 3 ? parents.organizationAdmin.organizationAdminId : null,
              zonalAdminId: flag === 3 ? parents.organizationAdmin.zonalAdminId : null,
              adminId: flag === 3 ? parents.organizationAdmin.adminId : null,
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
                  phone : userData.phone,
                  country : userData.country,
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
              phone: userData.phone,
              country: userData.country,
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

    await sendNotification({
      userId: user.userId,
      title: "Registration Successful",
      message: `Welcome ${user.name}! Your account has been created successfully.`,
      metadata: {
        userId: user.userId,
        email: user.email,
        flag: user.flag,
        role: roleDoc?.constructor?.modelName || null,
      },
    });

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

// export const loginUser = async (email, password) => {
//   // Find user and include password
//   const user = await User.findOne({ email }).select("+password");

//   if (!user) {
//     const error = new Error("Invalid email or password");
//     error.statusCode = 401;
//     throw error;
//   }

//   //  CHECK STATUS FIRST
//   if (user.status !== 1) {
//     const error = new Error("Your account is inactive. Please contact admin.");
//     error.statusCode = 403;
//     throw error;
//   }

//   // Compare password
//   const isPasswordValid = await user.comparePassword(password);

//   if (!isPasswordValid) {
//     const error = new Error("Invalid email or password");
//     error.statusCode = 401;
//     throw error;
//   }

//   const token = generateAccessToken(user._id.toString());
//   const refreshToken = await createRefreshTokenRecord(user._id.toString(), user._id);

//   // Remove password
//   const userObject = user.toObject();
//   delete userObject.password;

//   return { user: userObject, token, accessToken: token, refreshToken };
// };


export const loginUser = async (email, password) => {
  if (!email || !password) {
    const error = new Error("Email and password are required");
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const cleanPassword = password.trim();

  // Get user with password
  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+password");

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  // Check user status
  if (user.status !== 1) {
    const error = new Error(
      "Your account is inactive. Please contact admin."
    );
    error.statusCode = 403;
    throw error;
  }

  // Compare password
  const isMatch = await user.comparePassword(cleanPassword);

  if (!isMatch) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  // Generate JWT Access Token
  const accessToken = generateAccessToken(user._id.toString());

  // Generate Refresh Token & store in DB
  const refreshToken = await createRefreshTokenRecord(
    user._id.toString(),
    user._id
  );

  // Update last login time (optional)
  user.lastLoginAt = new Date();
  await user.save();

  // Remove password before returning
  const userObject = user.toObject();
  delete userObject.password;

  return {
    user: userObject,
    token: accessToken,
    accessToken,
    refreshToken,
  };
};

const withCount = (data) => ({
  count: data.length,
  data,
});

const uniqueNumbers = (values) => [
  ...new Set(values.filter((value) => value !== undefined && value !== null)),
];

const getRelatedCount = (item, key) =>
  item.relatedData?.[key]?.count ?? item.relatedData?.[key]?.data?.length ?? 0;

const normalizeSortOptions = ({ sort, sortBy, sortOrder } = {}) => {
  const sortText = String(sort ?? "").toLowerCase().trim();
  const fieldText = String(sortBy ?? "").toLowerCase().trim();
  const orderText = String(sortOrder ?? "").toLowerCase().trim();
  const joinedSortText = [sortText, fieldText, orderText].filter(Boolean).join(" ");
  const compactFieldText = fieldText.replace(/[^a-z0-9]/g, "");
  const compactSortText = sortText.replace(/[^a-z0-9]/g, "");

  let field = "name";
  if (["admin", "admins", "admincount", "adminscount"].includes(compactFieldText)) {
    field = "admin";
  } else if (
    [
      "organization",
      "organizations",
      "organisation",
      "organisations",
      "org",
      "orgs",
      "organizationcount",
      "organizationscount",
      "organisationcount",
      "organisationscount",
      "orgcount",
      "orgscount",
    ].includes(compactFieldText)
  ) {
    field = "organizations";
  } else if (["name", "username"].includes(fieldText)) {
    field = "name";
  } else if (
    compactSortText.includes("organization") ||
    compactSortText.includes("organisation") ||
    compactSortText.includes("orgcount")
  ) {
    field = "organizations";
  } else if (compactSortText.includes("admin")) {
    field = "admin";
  } else if (compactSortText.includes("name")) {
    field = "name";
  }

  let direction = orderText || sortText;
  if (
    joinedSortText.includes("z-a") ||
    joinedSortText.includes("za") ||
    joinedSortText.includes("desc") ||
    joinedSortText.includes("max-min") ||
    joinedSortText.includes("max to min")
  ) {
    direction = "desc";
  } else if (
    joinedSortText.includes("a-z") ||
    joinedSortText.includes("az") ||
    joinedSortText.includes("asc") ||
    joinedSortText.includes("min-max") ||
    joinedSortText.includes("min to max")
  ) {
    direction = "asc";
  }

  return {
    field,
    direction: direction === "desc" ? "desc" : "asc",
  };
};

const getSortableValue = (item, field) => {
  if (field === "admin") {
    return getRelatedCount(item, "admins");
  }

  if (field === "organizations") {
    return getRelatedCount(item, "organizations");
  }

  return String(item.name ?? "").toLowerCase();
};

const searchableText = (item) =>
  [
    item.name,
    item.email,
    item.userId,
    item.phone,
    item.city,
    item.state,
    item.country,
    item.roleData?.city,
    item.roleData?.state,
    item.roleData?.country,
  ]
    .filter((value) => value !== undefined && value !== null)
    .join(" ")
    .toLowerCase();

const applySearchAndSort = (users, options = {}) => {
  const search = String(options.search ?? "").trim().toLowerCase();
  const filteredUsers = search
    ? users.filter((user) => searchableText(user).includes(search))
    : users;

  if (!options.sort && !options.sortBy && !options.sortOrder) {
    return filteredUsers;
  }

  const { field, direction } = normalizeSortOptions(options);
  const multiplier = direction === "desc" ? -1 : 1;

  return [...filteredUsers].sort((first, second) => {
    const firstValue = getSortableValue(first, field);
    const secondValue = getSortableValue(second, field);

    if (typeof firstValue === "number" && typeof secondValue === "number") {
      return (firstValue - secondValue) * multiplier;
    }

    return String(firstValue).localeCompare(String(secondValue)) * multiplier;
  });
};

const getRelatedRoleData = async (user, roleData) => {
  if (!roleData || Object.keys(roleData).length === 0) {
    return null;
  }

  if (user.flag === 6) {
    const admins = await Admin.find({
      zonalAdminId: roleData.zonalAdminId,
    }).lean();
    const adminIds = uniqueNumbers(admins.map((admin) => admin.adminId));

    const organizations = await OrganizationAdmin.find({
      zonalAdminId: roleData.zonalAdminId,
      ...(adminIds.length ? { adminId: { $in: adminIds } } : {}),
    }).lean();

    const organizationIds = uniqueNumbers(
      organizations.map((org) => org.organizationId)
    );
    const organizationAdminIds = uniqueNumbers(
      organizations.map((org) => org.organizationAdminId)
    );

    const teachers = organizationIds.length
      ? await Teacher.find({
          $or: [
            {
              zonalAdminId: roleData.zonalAdminId,
              adminId: { $in: adminIds },
              organizationId: { $in: organizationIds },
            },
            {
              organizationId: { $in: organizationIds },
              organizationAdminId: { $in: organizationAdminIds },
            },
          ],
        }).lean()
      : [];

    const teacherIds = uniqueNumbers(teachers.map((teacher) => teacher.teacherId));
    const parents =
      organizationIds.length && teacherIds.length
        ? await Parent.find({
            $or: [
              {
                zonalAdminId: roleData.zonalAdminId,
                adminId: { $in: adminIds },
                organizationId: { $in: organizationIds },
                teacherId: { $in: teacherIds },
              },
              {
                organizationId: { $in: organizationIds },
                therapistId: { $in: teacherIds },
              },
            ],
          }).lean()
        : [];

    return {
      admins: withCount(admins),
      organizations: withCount(organizations),
      teachers: withCount(teachers),
      parents: withCount(parents),
    };
  }

  if (user.flag === 7) {
    const organizations = await OrganizationAdmin.find({
      zonalAdminId: roleData.zonalAdminId,
      adminId: roleData.adminId,
    }).lean();

    const organizationIds = uniqueNumbers(
      organizations.map((org) => org.organizationId)
    );
    const organizationAdminIds = uniqueNumbers(
      organizations.map((org) => org.organizationAdminId)
    );

    const teachers = organizationIds.length
      ? await Teacher.find({
          $or: [
            {
              zonalAdminId: roleData.zonalAdminId,
              adminId: roleData.adminId,
              organizationId: { $in: organizationIds },
            },
            {
              organizationId: { $in: organizationIds },
              organizationAdminId: { $in: organizationAdminIds },
            },
          ],
        }).lean()
      : [];

    const teacherIds = uniqueNumbers(teachers.map((teacher) => teacher.teacherId));
    const parents =
      organizationIds.length && teacherIds.length
        ? await Parent.find({
            $or: [
              {
                zonalAdminId: roleData.zonalAdminId,
                adminId: roleData.adminId,
                organizationId: { $in: organizationIds },
                teacherId: { $in: teacherIds },
              },
              {
                organizationId: { $in: organizationIds },
                therapistId: { $in: teacherIds },
              },
            ],
          }).lean()
        : [];

    return {
      organizations: withCount(organizations),
      teachers: withCount(teachers),
      parents: withCount(parents),
    };
  }

  if (user.flag === 1) {
    const teachers = await Teacher.find({
      $or: [
        {
          zonalAdminId: roleData.zonalAdminId,
          adminId: roleData.adminId,
          organizationId: roleData.organizationId,
        },
        {
          organizationId: roleData.organizationId,
          organizationAdminId: roleData.organizationAdminId,
        },
      ],
    }).lean();

    const teacherIds = uniqueNumbers(teachers.map((teacher) => teacher.teacherId));
    const parents = teacherIds.length
      ? await Parent.find({
          $or: [
            {
              zonalAdminId: roleData.zonalAdminId,
              adminId: roleData.adminId,
              organizationId: roleData.organizationId,
              teacherId: { $in: teacherIds },
            },
            {
              organizationId: roleData.organizationId,
              therapistId: { $in: teacherIds },
            },
          ],
        }).lean()
      : [];

    return {
      teachers: withCount(teachers),
      parents: withCount(parents),
    };
  }

  if (user.flag === 3) {
    const parentFilters = [
      {
        organizationId: roleData.organizationId,
        therapistId: roleData.teacherId,
      },
    ];

    if (roleData.zonalAdminId !== undefined && roleData.zonalAdminId !== null) {
      parentFilters.push({
        zonalAdminId: roleData.zonalAdminId,
        adminId: roleData.adminId,
        organizationId: roleData.organizationId,
        teacherId: roleData.teacherId,
      });
    }

    const parents = await Parent.find({
      $or: parentFilters,
    }).lean();

    return {
      parents: withCount(parents),
    };
  }

  return null;
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

  const relatedData = await getRelatedRoleData(user, roleData);

  return {
    user,
    roleData,
    relatedData,
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
  if (profileData.phone !== undefined) {
    allowedUpdates.phone = profileData.phone;
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

// export const getAllUsersService = async (flag) => {
//   const users = await User.find({ flag }).select("-password");

//   if (!users || users.length === 0) {
//     const error = new Error("No users found");
//     error.statusCode = 404;
//     throw error;
//   }

//   return users;
// };


export const getAllUsersService = async (flag, options = {}) => {
  const users = await User.find({ flag }).select("-password").lean();

  if (!users || users.length === 0) {
    const error = new Error("No users found");
    error.statusCode = 404;
    throw error;
  }

  const enrichedUsers = await Promise.all(
    users.map(async (user) => {
      let roleData = null;

      switch (user.flag) {
        case 1:
          roleData =
            await OrganizationAdmin.findOne({
              userId: user.userId,
            }).lean();
          break;

        case 2:
        case 4:
          roleData =
            await Parent.findOne({
              userId: user.userId,
            }).lean();
          break;

        case 3:
        case 5:
          roleData =
            await Teacher.findOne({
              userId: user.userId,
            }).lean();
          break;

        case 6:
          roleData =
            await ZonalAdmin.findOne({
              userId: user.userId,
            }).lean();
          break;

        case 7:
          roleData =
            await Admin.findOne({
              userId: user.userId,
            }).lean();
          break;

        default:
          roleData = null;
      }

      const relatedData = await getRelatedRoleData(user, roleData);

      return {
        ...user,
        roleData,
        relatedData,
      };
    })
  );

  return applySearchAndSort(enrichedUsers, options);
};

// export const refreshAuthToken = async (refreshToken) => {
//   if (!refreshToken) {
//     const error = new Error("Refresh token not provided");
//     error.statusCode = 400;
//     throw error;
//   }

//   const decoded = verifyRefreshToken(refreshToken);

//   const storedToken = await RefreshToken.findOne({
//     token: refreshToken,
//     revokedAt: null,
//   });

//   if (!storedToken || storedToken.expiresAt <= new Date()) {
//     const error = new Error("Refresh token is invalid or expired");
//     error.statusCode = 401;
//     throw error;
//   }

//   const user = await User.findById(decoded.userId).select("-password");

//   if (!user || user.status !== 1) {
//     const error = new Error("User not found or inactive");
//     error.statusCode = 401;
//     throw error;
//   }

//   storedToken.revokedAt = new Date();
//   await storedToken.save();

//   const token = generateAccessToken(user._id.toString());
//   const newRefreshToken = await createRefreshTokenRecord(user._id.toString(), user._id);

//   return {
//     user,
//     token,
//     accessToken: token,
//     refreshToken: newRefreshToken,
//   };
// };

export const refreshAuthToken = async (userId, sessionId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const session = user.sessions.find((s) => s.sessionId === sessionId);

  if (!session) {
    throw new Error("Invalid session");
  }

  // Check if refresh token is expired
  if (new Date() > session.expiresAt) {
    user.sessions = user.sessions.filter((s) => s.sessionId !== sessionId);
    await user.save();
    throw new Error("Refresh token expired. Please login again.");
  }

  // Update last activity
  session.lastActivityAt = new Date();
  await user.save();

  return {
    user,
    sessionId,
    accessTokenExpiry: 3600, // 1 hour
  };
};

export const verifyRefreshTokenService = async (userId, sessionId, token) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const session = user.sessions.find((s) => s.sessionId === sessionId);

  if (!session) {
    throw new Error("Invalid session");
  }

  if (!session.refreshToken || session.refreshToken !== token) {
    throw new Error("Invalid refresh token");
  }

  return user;
};

// export const logoutUser = async (token, refreshToken) => {
//   if (!token) {
//     const error = new Error("Token not provided");
//     error.statusCode = 400;
//     throw error;
//   }

//   await BlacklistLog.create({
//     token,
//     expiresAt: getTokenExpiryDate(token),
//   });

//   if (refreshToken) {
//     await RefreshToken.findOneAndUpdate(
//       { token: refreshToken, revokedAt: null },
//       { revokedAt: new Date() }
//     );
//   }

//   return true;
// };

export const logoutUser = async (token, refreshToken = null) => {
  if (!token) {
    const error = new Error("Token not provided");
    error.statusCode = 400;
    throw error;
  }

  // Blacklist access token
  await BlacklistLog.create({
    token,
    expiresAt: getTokenExpiryDate(token),
  });

  // Revoke refresh token if provided
  if (refreshToken) {
    await RefreshToken.findOneAndUpdate(
      {
        token: refreshToken,
        revokedAt: null,
      },
      {
        revokedAt: new Date(),
      }
    );
  }

  return {
    success: true,
    message: "Logged out successfully",
  };
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
            organizationAdminId:
              flag === 2 ? parents.therapist.organizationAdminId : null,
            zonalAdminId:
              flag === 2
                ? parents.therapist.zonalAdminId ??
                  parents.organizationAdmin?.zonalAdminId
                : null,
            adminId:
              flag === 2
                ? parents.therapist.adminId ?? parents.organizationAdmin?.adminId
                : null,
            therapistId: flag === 2 ? parents.therapist.teacherId : null,
            teacherId: flag === 2 ? parents.therapist.teacherId : null,
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
            zonalAdminId: flag === 3 ? parents.organizationAdmin.zonalAdminId : null,
            adminId: flag === 3 ? parents.organizationAdmin.adminId : null,
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

export const deleteUsersService = async (userIds) => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      for (const userId of userIds) {
        await deleteUserById(userId, session);
      }
    });

    return {
      success: true,
      message:
        userIds.length === 1
          ? "User deleted successfully"
          : `${userIds.length} users deleted successfully`,
    };
  } finally {
    session.endSession();
  }
};

const deleteUserById = async (userId, session) => {
  const user = await User.findById(userId).session(session);

  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  const flag = user.flag;

  if (flag === 0) {
    await SuperAdmin.deleteOne({ userId: user.userId }).session(session);
  } else if (flag === 1) {
    await OrganizationAdmin.deleteOne({ userId: user.userId }).session(session);
  } else if (flag === 2 || flag === 4) {
    await Parent.deleteOne({ userId: user.userId }).session(session);
  } else if (flag === 3 || flag === 5) {
    await Teacher.deleteOne({ userId: user.userId }).session(session);
  } else if (flag === 6) {
    await ZonalAdmin.deleteOne({ userId: user.userId }).session(session);
  } else if (flag === 7) {
    await Admin.deleteOne({ userId: user.userId }).session(session);
  } else {
    throw new Error("Invalid flag");
  }

  await User.deleteOne({ _id: userId }).session(session);
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
