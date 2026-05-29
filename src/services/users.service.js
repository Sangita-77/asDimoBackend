import User from "../models/user.model.js";

const generateRandomPassword = (length = 10) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < length; i += 1) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export const createUser = async (data) => {
  const payload = { ...data };

  if (!payload.password) {
    payload.password = generateRandomPassword();
  }

  const user = await User.create(payload);

  const userObject = user.toObject();
  delete userObject.password;
  return userObject;
};

export const getUsers = async () => {
  return await User.find().select("-password");
};

export const getUserById = async (id) => {
  const user = await User.findById(id).select("-password");
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  return user;
};

export const updateUserById = async (id, data) => {
  const user = await User.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
    context: "query",
  }).select("-password");
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  return user;
};

export const updateUserStatus = async (id, status) => {
  const user = await User.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  ).select("-password");
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  return user;
};

export const deleteUserById = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  return user;
};

export const updateUserRole = async (id, role) => {
  const user = await User.findByIdAndUpdate(
    id,
    { flag: role },
    { new: true, runValidators: true }
  ).select("-password");
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  return user;
};