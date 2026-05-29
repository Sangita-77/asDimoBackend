import AuditLog from "../models/auditLog.model.js";

export const getAuditLogs = async () => {
  return await AuditLog.find();
};

export const getAuditLogById = async (id) => {
  const auditLog = await AuditLog.findById(id);
  if (!auditLog) {
    const error = new Error("Audit log not found");
    error.statusCode = 404;
    throw error;
  }
  return auditLog;
};

export const createAuditLog = async (data) => {
  const auditLog = await AuditLog.create(data);
  return auditLog;
};