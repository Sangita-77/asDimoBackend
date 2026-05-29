import Organization from "../models/organization.model.js";

export const createOrganization = async (data) => {
  const organization = await Organization.create(data);
  return organization;
};

export const getOrganizations = async () => {
  return await Organization.find();
};

export const getOrganizationById = async (id) => {
  const organization = await Organization.findById(id);
  if (!organization) {
    const error = new Error("Organization not found");
    error.statusCode = 404;
    throw error;
  }
  return organization;
};

export const updateOrganizationById = async (id, data) => {
  const organization = await Organization.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!organization) {
    const error = new Error("Organization not found");
    error.statusCode = 404;
    throw error;
  }
  return organization;
};

export const updateOrganizationStatus = async (id, status) => {
  const organization = await Organization.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );
  if (!organization) {
    const error = new Error("Organization not found");
    error.statusCode = 404;
    throw error;
  }
  return organization;
};

export const deleteOrganizationById = async (id) => {
  const organization = await Organization.findByIdAndDelete(id);
  if (!organization) {
    const error = new Error("Organization not found");
    error.statusCode = 404;
    throw error;
  }
  return organization;
};