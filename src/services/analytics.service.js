import Payment from "../models/payment.model.js";
import Subscription from "../models/subscription.model.js";
import User from "../models/user.model.js";
import GameSession from "../models/gameSession.model.js";

export const getRevenueAnalytics = async () => {
  const payments = await Payment.find({ status: "completed" });
  const revenue = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
  return { revenue, paymentCount: payments.length };
};

export const getSubscriptionGrowthAnalytics = async () => {
  const subscriptions = await Subscription.find();
  const grouped = subscriptions.reduce((acc, item) => {
    const key = item.startDate?.toISOString().slice(0, 7) || "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  return { monthlyGrowth: grouped };
};

export const getUserGrowthAnalytics = async () => {
  const users = await User.find();
  const grouped = users.reduce((acc, user) => {
    const key = user.createdAt?.toISOString().slice(0, 7) || "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  return { monthlyGrowth: grouped, totalUsers: users.length };
};

export const getStudentEngagementAnalytics = async () => {
  const sessions = await GameSession.find();
  const students = [...new Set(sessions.map((item) => item.studentId))];
  return { activeStudents: students.length, totalSessions: sessions.length };
};

export const getGameEngagementAnalytics = async () => {
  const sessions = await GameSession.find();
  const games = [...new Set(sessions.map((item) => item.gameId))];
  return { activeGames: games.length, totalSessions: sessions.length };
};