import { asyncHandler } from "../utils/asyncHandler.js";
import * as doctorsService from "../services/doctors.service.js";

export const createDoctor = asyncHandler(async (req, res) => {
  const doctor = await doctorsService.createDoctor(req.body);
  res.status(201).json({
    success: true,
    message: "Doctor created successfully",
    data: doctor,
  });
});

export const getDoctors = asyncHandler(async (req, res) => {
  const doctors = await doctorsService.getDoctors();
  res.status(200).json({
    success: true,
    message: "Doctors retrieved successfully",
    data: doctors,
  });
});

export const getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await doctorsService.getDoctorById(req.params.id);
  res.status(200).json({
    success: true,
    message: "Doctor details retrieved successfully",
    data: doctor,
  });
});

export const updateDoctorById = asyncHandler(async (req, res) => {
  const doctor = await doctorsService.updateDoctorById(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: "Doctor updated successfully",
    data: doctor,
  });
});

export const deleteDoctorById = asyncHandler(async (req, res) => {
  const doctor = await doctorsService.deleteDoctorById(req.params.id);
  res.status(200).json({
    success: true,
    message: "Doctor deleted successfully",
    data: doctor,
  });
});

export const updateDoctorAvailability = asyncHandler(async (req, res) => {
  const doctor = await doctorsService.updateDoctorAvailability(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: "Doctor availability updated successfully",
    data: doctor,
  });
});

export const assignDoctorOrganization = asyncHandler(async (req, res) => {
  const doctor = await doctorsService.assignDoctorOrganization(req.params.id, req.body.organizationId);
  res.status(200).json({
    success: true,
    message: "Doctor assigned to organization successfully",
    data: doctor,
  });
});
