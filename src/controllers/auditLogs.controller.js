import { asyncHandler } from "../utils/asyncHandler.js";
import * as auditLogsService from "../services/auditLogs.service.js";

export const getAuditLogs = asyncHandler(async (req, res) => {
  const logs = await auditLogsService.getAuditLogs();
  res.status(200).json({
    success: true,
    message: "Audit logs retrieved successfully",
    data: logs,
  });
});

export const getAuditLogById = asyncHandler(async (req, res) => {
  const log = await auditLogsService.getAuditLogById(req.params.id);
  res.status(200).json({
    success: true,
    message: "Audit log retrieved successfully",
    data: log,
  });
});
