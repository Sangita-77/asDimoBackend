import { asyncHandler } from "../utils/asyncHandler.js";
import * as settingsService from "../services/settings.service.js";

export const getSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.getSettings();
  res.status(200).json({
    success: true,
    message: "Settings retrieved successfully",
    data: settings,
  });
});

export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.updateSettings(req.body);
  res.status(200).json({
    success: true,
    message: "Settings updated successfully",
    data: settings,
  });
});

export const updateNotificationSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.updateNotificationSettings(req.body);
  res.status(200).json({
    success: true,
    message: "Notification settings updated successfully",
    data: settings,
  });
});

export const updatePermissionSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.updatePermissionSettings(req.body);
  res.status(200).json({
    success: true,
    message: "Permission settings updated successfully",
    data: settings,
  });
});

export const updatePlatformSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.updatePlatformSettings(req.body);
  res.status(200).json({
    success: true,
    message: "Platform settings updated successfully",
    data: settings,
  });
});
