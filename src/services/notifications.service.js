import Notification from "../models/notification.model.js";
import NotificationPreference from "../models/notificationPreference.model.js";

export const sendNotification = async (data) => {
  return await Notification.create({
    recipientId: data.recipientId,
    title: data.title,
    message: data.message,
    type: data.type || "system",
    read: false,
    metadata: data.metadata || {},
  });
};

export const getNotifications = async (recipientId) => {
  const query = recipientId ? { recipientId } : {};
  return await Notification.find(query).sort({ createdAt: -1 });
};

export const markAsRead = async (id) => {
  const notification = await Notification.findById(id);
  if (!notification) {
    const error = new Error("Notification not found");
    error.statusCode = 404;
    throw error;
  }
  notification.read = true;
  await notification.save();
  return notification;
};

export const setNotificationPreference = async (recipientId, data) => {
  const preference = await NotificationPreference.findOneAndUpdate(
    { recipientId },
    { preferences: data.preferences || {} },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return preference;
};

export const getNotificationPreferences = async (recipientId) => {
  const preference = await NotificationPreference.findOne({ recipientId });
  return preference || { recipientId, preferences: {} };
};