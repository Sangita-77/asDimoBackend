import SubscriptionPlan from "../models/subscriptionPlan.model.js";
import Subscription from "../models/subscription.model.js";

export const createSubscriptionPlan = async (data) => {
  const plan = await SubscriptionPlan.create(data);
  return plan;
};

export const getSubscriptionPlans = async () => {
  return await SubscriptionPlan.find();
};

export const updateSubscriptionPlan = async (id, data) => {
  const plan = await SubscriptionPlan.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!plan) {
    const error = new Error("Subscription plan not found");
    error.statusCode = 404;
    throw error;
  }
  return plan;
};

export const deleteSubscriptionPlan = async (id) => {
  const plan = await SubscriptionPlan.findByIdAndDelete(id);
  if (!plan) {
    const error = new Error("Subscription plan not found");
    error.statusCode = 404;
    throw error;
  }
  return plan;
};

export const assignSubscription = async (data) => {
  const subscription = await Subscription.create({
    organizationId: data.organizationId,
    planId: data.planId,
    startDate: data.startDate ? new Date(data.startDate) : new Date(),
    endDate: data.endDate ? new Date(data.endDate) : null,
    status: data.status || "active",
  });
  return subscription;
};

export const getOrganizationSubscriptions = async (orgId) => {
  return await Subscription.find({ organizationId: Number(orgId) });
};

export const cancelSubscription = async (id) => {
  const subscription = await Subscription.findByIdAndUpdate(
    id,
    { status: "cancelled" },
    { new: true }
  );
  if (!subscription) {
    const error = new Error("Subscription not found");
    error.statusCode = 404;
    throw error;
  }
  return subscription;
};