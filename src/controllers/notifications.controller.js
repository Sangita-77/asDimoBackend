import { asyncHandler } from "../utils/asyncHandler.js";
import * as notificationsService from "../services/notifications.service.js";

export const sendNotification = asyncHandler(async (req, res) => {
  const notification = await notificationsService.sendNotification(req.body);
  res.status(200).json({
    success: true,
    message: "Notification sent successfully",
    data: notification,
  });
});

export const getNotifications = asyncHandler(async (req, res) => {
  const recipientId = Number(req.query.recipientId || req.user?.id);
  const notifications = await notificationsService.getNotifications(recipientId);
  res.status(200).json({
    success: true,
    message: "Notifications retrieved successfully",
    data: notifications,
  });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await notificationsService.markAsRead(req.params.id);
  res.status(200).json({
    success: true,
    message: "Notification marked as read",
    data: notification,
  });
});

export const updateNotificationPreferences = asyncHandler(async (req, res) => {
  const recipientId = Number(req.body.recipientId || req.user?.id);
  const preference = await notificationsService.setNotificationPreference(recipientId, req.body);
  res.status(200).json({
    success: true,
    message: "Notification preferences updated successfully",
    data: preference,
  });
});
