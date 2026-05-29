import User from "../models/user.model.js";
import Organization from "../models/organization.model.js";
import Student from "../models/student.model.js";
import Doctor from "../models/doctor.model.js";
import Appointment from "../models/appoinment.model.js";
import Game from "../models/game.model.js";
import Subscription from "../models/subscription.model.js";
import Payment from "../models/payment.model.js";

export const getSuperAdminDashboard = async () => {
  const totalUsers = await User.countDocuments();
  const totalOrganizations = await Organization.countDocuments();
  const totalStudents = await Student.countDocuments();
  const totalDoctors = await Doctor.countDocuments();
  const totalAppointments = await Appointment.countDocuments();
  const totalGames = await Game.countDocuments();
  const totalPayments = await Payment.countDocuments();
  
  return {
    totalUsers,
    totalOrganizations,
    totalStudents,
    totalDoctors,
    totalAppointments,
    totalGames,
    totalPayments,
    timestamp: new Date(),
  };
};

export const getOrganizationAdminDashboard = async (organizationId) => {
  const organization = await Organization.findById(organizationId);
  const students = await Student.find({ organizationId });
  const doctors = await Doctor.find({ organizationId });
  const appointments = await Appointment.find({ organizationId });
  const subscriptions = await Subscription.find({ organizationId });
  
  return {
    organization: organization?.name || "Unknown",
    totalStudents: students.length,
    totalDoctors: doctors.length,
    totalAppointments: appointments.length,
    subscriptionStatus: subscriptions.length > 0 ? "active" : "inactive",
    recentAppointments: appointments.slice(-5),
  };
};

export const getParentDashboard = async (userId) => {
  const user = await User.findOne({ userId });
  const students = await Student.find({ parentId: userId });
  const appointments = await Appointment.find({ parentId: userId });
  const games = await Game.find({ studentIds: { $in: students.map((s) => s._id) } });
  
  return {
    userName: user?.name || "Unknown",
    totalChildren: students.length,
    upcomingAppointments: appointments.filter((a) => a.status === "scheduled").length,
    assignedGames: games.length,
    children: students,
  };
};

export const getDoctorDashboard = async (userId) => {
  const doctor = await Doctor.findOne({ userId });
  const todayAppointments = await Appointment.find({
    doctorId: doctor?._id,
    date: { $gte: new Date().setHours(0, 0, 0, 0), $lt: new Date().setHours(23, 59, 59, 999) },
  });
  const students = await Student.find({ doctorId: doctor?._id });
  
  return {
    doctorName: doctor?.name || "Unknown",
    todayAppointments: todayAppointments.length,
    totalStudents: students.length,
    upcomingAppointments: await Appointment.countDocuments({
      doctorId: doctor?._id,
      status: "scheduled",
    }),
    appointments: todayAppointments.slice(-5),
  };
};

export const getTeacherDashboard = async (userId) => {
  const teacher = await User.findOne({ userId });
  const students = await Student.find({ teacherId: userId });
  const games = await Game.find({ studentIds: { $in: students.map((s) => s._id) } });
  
  return {
    teacherName: teacher?.name || "Unknown",
    totalStudents: students.length,
    assignedGames: games.length,
    recentActivity: students.slice(-5),
    students: students,
  };
};
