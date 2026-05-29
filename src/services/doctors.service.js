import Doctor from "../models/doctor.model.js";

export const createDoctor = async (data) => {
  const doctor = await Doctor.create(data);
  return doctor;
};

export const getDoctors = async () => {
  return await Doctor.find();
};

export const getDoctorById = async (id) => {
  const doctor = await Doctor.findById(id);
  if (!doctor) {
    const error = new Error("Doctor not found");
    error.statusCode = 404;
    throw error;
  }
  return doctor;
};

export const updateDoctorById = async (id, data) => {
  const doctor = await Doctor.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!doctor) {
    const error = new Error("Doctor not found");
    error.statusCode = 404;
    throw error;
  }
  return doctor;
};

export const deleteDoctorById = async (id) => {
  const doctor = await Doctor.findByIdAndDelete(id);
  if (!doctor) {
    const error = new Error("Doctor not found");
    error.statusCode = 404;
    throw error;
  }
  return doctor;
};

export const updateDoctorAvailability = async (id, availability) => {
  const doctor = await Doctor.findByIdAndUpdate(
    id,
    { availability },
    { new: true, runValidators: true }
  );
  if (!doctor) {
    const error = new Error("Doctor not found");
    error.statusCode = 404;
    throw error;
  }
  return doctor;
};

export const assignDoctorOrganization = async (id, organizationId) => {
  const doctor = await Doctor.findByIdAndUpdate(
    id,
    { organizationId },
    { new: true, runValidators: true }
  );
  if (!doctor) {
    const error = new Error("Doctor not found");
    error.statusCode = 404;
    throw error;
  }
  return doctor;
};