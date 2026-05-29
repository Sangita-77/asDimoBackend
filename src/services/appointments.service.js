import Appointment from "../models/appoinment.model.js";
import Availability from "../models/avialability.model.js";

export const createAppointment = async (data) => {
  const availability = await Availability.findOne({
    userId: data.doctorId || data.teacherId,
    date: data.date,
    time: data.time,
  });

  if (!availability) {
    const error = new Error("No availability found for requested slot");
    error.statusCode = 400;
    throw error;
  }

  const appointment = await Appointment.create({
    parentId: data.parentId,
    teacherId: data.teacherId || data.doctorId,
    availabilityId: availability._id,
    date: data.date,
    time: data.time,
    status: data.status || "pending",
    zoomLink: availability.zoomLink,
  });
  return appointment;
};

export const getAppointments = async () => {
  return await Appointment.find();
};

export const getAppointmentById = async (id) => {
  const appointment = await Appointment.findById(id);
  if (!appointment) {
    const error = new Error("Appointment not found");
    error.statusCode = 404;
    throw error;
  }
  return appointment;
};

export const confirmAppointment = async (id) => {
  const appointment = await Appointment.findById(id);
  if (!appointment) {
    const error = new Error("Appointment not found");
    error.statusCode = 404;
    throw error;
  }
  appointment.status = "approved";
  await appointment.save();
  return appointment;
};

export const rescheduleAppointment = async (id, data) => {
  const appointment = await Appointment.findById(id);
  if (!appointment) {
    const error = new Error("Appointment not found");
    error.statusCode = 404;
    throw error;
  }
  appointment.date = data.date || appointment.date;
  appointment.time = data.time || appointment.time;
  await appointment.save();
  return appointment;
};

export const cancelAppointment = async (id) => {
  const appointment = await Appointment.findById(id);
  if (!appointment) {
    const error = new Error("Appointment not found");
    error.statusCode = 404;
    throw error;
  }
  appointment.status = "cancelled";
  await appointment.save();
  await Availability.findOneAndUpdate(
    { userId: appointment.teacherId, date: appointment.date, time: appointment.time },
    { isBooked: false }
  );
  return appointment;
};

export const completeAppointment = async (id) => {
  const appointment = await Appointment.findById(id);
  if (!appointment) {
    const error = new Error("Appointment not found");
    error.statusCode = 404;
    throw error;
  }
  appointment.status = "completed";
  await appointment.save();
  return appointment;
};

export const getAvailableSlots = async (doctorId) => {
  return await Availability.find({ userId: Number(doctorId), isBooked: false });
};