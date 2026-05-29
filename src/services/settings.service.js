import Setting from "../models/setting.model.js";

export const getSettings = async () => {
  const settings = await Setting.find();
  return settings.reduce((acc, item) => {
    acc[item.key] = item.value;
    return acc;
  }, {});
};

export const updateSettings = async (data) => {
  const keys = Object.keys(data);
  const updates = [];
  for (const key of keys) {
    updates.push(
      Setting.findOneAndUpdate(
        { key },
        { value: data[key] },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      )
    );
  }
  await Promise.all(updates);
  return await getSettings();
};

export const updateNotificationSettings = async (data) => {
  return await updateSettings({ notificationSettings: data });
};

export const updatePermissionSettings = async (data) => {
  return await updateSettings({ permissionSettings: data });
};

export const updatePlatformSettings = async (data) => {
  return await updateSettings({ platformSettings: data });
};