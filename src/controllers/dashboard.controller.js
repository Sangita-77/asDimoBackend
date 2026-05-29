import { asyncHandler } from "../utils/asyncHandler.js";
import * as dashboardService from "../services/dashboard.service.js";

export const getSuperAdminDashboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.getSuperAdminDashboard();
  res.status(200).json({
    success: true,
    message: "Super admin dashboard data",
    data,
  });
});

export const getOrganizationAdminDashboard = asyncHandler(async (req, res) => {
  const organizationId = req.user?.organizationId || req.query.organizationId;
  const data = await dashboardService.getOrganizationAdminDashboard(organizationId);
  res.status(200).json({
    success: true,
    message: "Organization admin dashboard data",
    data,
  });
});

export const getParentDashboard = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const data = await dashboardService.getParentDashboard(userId);
  res.status(200).json({
    success: true,
    message: "Parent dashboard data",
    data,
  });
});

export const getDoctorDashboard = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const data = await dashboardService.getDoctorDashboard(userId);
  res.status(200).json({
    success: true,
    message: "Doctor dashboard data",
    data,
  });
});

export const getTeacherDashboard = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const data = await dashboardService.getTeacherDashboard(userId);
  res.status(200).json({
    success: true,
    message: "Teacher dashboard data",
    data,
  });
});
