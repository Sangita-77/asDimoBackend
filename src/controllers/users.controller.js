import { asyncHandler } from "../utils/asyncHandler.js";
import * as usersService from "../services/users.service.js";

export const createUser = asyncHandler(async (req, res) => {
  const user = await usersService.createUser(req.body);
  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: user,
  });
});

export const getUsers = asyncHandler(async (req, res) => {
  const users = await usersService.getUsers();
  res.status(200).json({
    success: true,
    message: "Users retrieved successfully",
    data: users,
  });
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await usersService.getUserById(req.params.id);
  res.status(200).json({
    success: true,
    message: "User details retrieved successfully",
    data: user,
  });
});

export const updateUserById = asyncHandler(async (req, res) => {
  const user = await usersService.updateUserById(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: user,
  });
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await usersService.updateUserStatus(req.params.id, req.body.status);
  res.status(200).json({
    success: true,
    message: "User status updated successfully",
    data: user,
  });
});

export const deleteUserById = asyncHandler(async (req, res) => {
  const user = await usersService.deleteUserById(req.params.id);
  res.status(200).json({
    success: true,
    message: "User deleted successfully",
    data: user,
  });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const user = await usersService.updateUserRole(req.params.id, req.body.role);
  res.status(200).json({
    success: true,
    message: "User role updated successfully",
    data: user,
  });
});
