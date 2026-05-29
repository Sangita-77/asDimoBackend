import { asyncHandler } from "../utils/asyncHandler.js";
import * as appointmentsService from "../services/appointments.service.js";

export const createAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentsService.createAppointment(req.body);
  res.status(201).json({
    success: true,
    message: "Appointment created successfully",
    data: appointment,
  });
});

export const getAppointments = asyncHandler(async (req, res) => {
  const appointments = await appointmentsService.getAppointments();
  res.status(200).json({
    success: true,
    message: "Appointments retrieved successfully",
    data: appointments,
  });
});

export const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await appointmentsService.getAppointmentById(req.params.id);
  res.status(200).json({
    success: true,
    message: "Appointment retrieved successfully",
    data: appointment,
  });
});

export const confirmAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentsService.confirmAppointment(req.params.id);
  res.status(200).json({
    success: true,
    message: "Appointment confirmed successfully",
    data: appointment,
  });
});

export const rescheduleAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentsService.rescheduleAppointment(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: "Appointment rescheduled successfully",
    data: appointment,
  });
});

export const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentsService.cancelAppointment(req.params.id);
  res.status(200).json({
    success: true,
    message: "Appointment cancelled successfully",
    data: appointment,
  });
});

export const completeAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentsService.completeAppointment(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: "Appointment completed successfully",
    data: appointment,
  });
});

export const getAvailableSlots = asyncHandler(async (req, res) => {
  const slots = await appointmentsService.getAvailableSlots(req.params.doctorId, req.query);
  res.status(200).json({
    success: true,
    message: "Available slots retrieved successfully",
    data: slots,
  });
});
