import { asyncHandler } from "../utils/asyncHandler.js";
import * as analyticsService from "../services/analytics.service.js";

export const getRevenueAnalytics = asyncHandler(async (req, res) => {
  const analytics = await analyticsService.getRevenueAnalytics();
  res.status(200).json({
    success: true,
    message: "Revenue analytics retrieved successfully",
    data: analytics,
  });
});

export const getSubscriptionGrowthAnalytics = asyncHandler(async (req, res) => {
  const analytics = await analyticsService.getSubscriptionGrowthAnalytics();
  res.status(200).json({
    success: true,
    message: "Subscription growth analytics retrieved successfully",
    data: analytics,
  });
});

export const getUserGrowthAnalytics = asyncHandler(async (req, res) => {
  const analytics = await analyticsService.getUserGrowthAnalytics();
  res.status(200).json({
    success: true,
    message: "User growth analytics retrieved successfully",
    data: analytics,
  });
});

export const getStudentEngagementAnalytics = asyncHandler(async (req, res) => {
  const analytics = await analyticsService.getStudentEngagementAnalytics();
  res.status(200).json({
    success: true,
    message: "Student engagement analytics retrieved successfully",
    data: analytics,
  });
});

export const getGameEngagementAnalytics = asyncHandler(async (req, res) => {
  const analytics = await analyticsService.getGameEngagementAnalytics();
  res.status(200).json({
    success: true,
    message: "Game engagement analytics retrieved successfully",
    data: analytics,
  });
});
