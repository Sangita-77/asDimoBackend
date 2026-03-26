import {
  addAvailabilityservice,
  getAvailabilityWTSer,
  approveAppointmentSer,
  } from "../services/teacher.service.js";
  import { asyncHandler } from "../utils/asyncHandler.js";

export const addAvailabilityCon = asyncHandler(async (req, res) => {
  const { userId, date, time } = req.body;

  if (!userId || !date || !time) {
    return res.status(400).json({
      success: false,
      message: "please provide userId, date, time",
    });
  }

  const user = await addAvailabilityservice(userId, date, time);

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