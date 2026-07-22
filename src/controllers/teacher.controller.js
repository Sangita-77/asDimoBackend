import {
  addAvailabilityservice,
  getAvailabilityWTSer,
  approveAppointmentSer,
  getAvailabilitySlotsService,
  } from "../services/teacher.service.js";
  import { asyncHandler } from "../utils/asyncHandler.js";

export const addAvailabilityCon = asyncHandler(async (req, res) => {
  const { userId, date, time, medium } = req.body;

  if (!userId || !date || !time || !medium) {
    return res.status(400).json({
      success: false,
      message: "please provide userId, date, time, medium",
    });
  }

  const allowedMediums = ["online", "center", "home"];

  if (!allowedMediums.includes(medium.toLowerCase())) {
    return res.status(400).json({
      success: false,
      message: "Medium must be one of: online, center, home",
    });
  }

  const user = await addAvailabilityservice(userId, date, time, medium.toLowerCase());

  res.status(200).json({
    success: true,
    message: "Availability added successfully",
    data: {user},
  });
});

export const getAvailabilityWTCon = asyncHandler(async (req,res) => {

  const availability = await getAvailabilityWTSer();
  res.status(200).json({
    success: true,
    message: "Availability added successfully",
    data: {availability},
  });

});


export const approveAppointmentCon = asyncHandler(async (req, res) => {
  const { appointmentId, status } = req.body;

  if (!appointmentId || !status) {
    return res.status(400).json({
      success: false,
      message: "appointmentId and status are required",
    });
  }

  const data = await approveAppointmentSer(appointmentId, status);

  res.status(200).json({
    success: true,
    message: `Appointment ${status} successfully`,
    data,
  });
});

export const getAvilabilitySlotsOfTherapist = asyncHandler(async (req, res) => {
  const { therapistId } = req.body;
  const availabilitySlots = await getAvailabilitySlotsService(therapistId);

  res.status(200).json({
    success: true,
    message: "Availability slots retrieved successfully",
    data: availabilitySlots,
  });
});