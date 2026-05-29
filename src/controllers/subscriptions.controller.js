import { asyncHandler } from "../utils/asyncHandler.js";
import * as subscriptionsService from "../services/subscriptions.service.js";

export const createSubscriptionPlan = asyncHandler(async (req, res) => {
  const plan = await subscriptionsService.createSubscriptionPlan(req.body);
  res.status(201).json({
    success: true,
    message: "Subscription plan created successfully",
    data: plan,
  });
});

export const getSubscriptionPlans = asyncHandler(async (req, res) => {
  const plans = await subscriptionsService.getSubscriptionPlans();
  res.status(200).json({
    success: true,
    message: "Subscription plans retrieved successfully",
    data: plans,
  });
});

export const updateSubscriptionPlan = asyncHandler(async (req, res) => {
  const plan = await subscriptionsService.updateSubscriptionPlan(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: "Subscription plan updated successfully",
    data: plan,
  });
});

export const deleteSubscriptionPlan = asyncHandler(async (req, res) => {
  const plan = await subscriptionsService.deleteSubscriptionPlan(req.params.id);
  res.status(200).json({
    success: true,
    message: "Subscription plan deleted successfully",
    data: plan,
  });
});

export const assignSubscription = asyncHandler(async (req, res) => {
  const subscription = await subscriptionsService.assignSubscription(req.body);
  res.status(200).json({
    success: true,
    message: "Subscription assigned successfully",
    data: subscription,
  });
});

export const getOrganizationSubscriptions = asyncHandler(async (req, res) => {
  const subscriptions = await subscriptionsService.getOrganizationSubscriptions(req.params.orgId);
  res.status(200).json({
    success: true,
    message: "Organization subscriptions retrieved successfully",
    data: subscriptions,
  });
});

export const cancelSubscription = asyncHandler(async (req, res) => {
  const subscription = await subscriptionsService.cancelSubscription(req.params.id);
  res.status(200).json({
    success: true,
    message: "Subscription cancelled successfully",
    data: subscription,
  });
});
