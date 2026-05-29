import { asyncHandler } from "../utils/asyncHandler.js";
import * as organizationService from "../services/organization.service.js";

export const createOrganization = asyncHandler(async (req, res) => {
  const organization = await organizationService.createOrganization(req.body);
  res.status(201).json({
    success: true,
    message: "Organization created successfully",
    data: organization,
  });
});

export const getOrganizations = asyncHandler(async (req, res) => {
  const organizations = await organizationService.getOrganizations();
  res.status(200).json({
    success: true,
    message: "Organizations retrieved successfully",
    data: organizations,
  });
});

export const getOrganizationById = asyncHandler(async (req, res) => {
  const organization = await organizationService.getOrganizationById(req.params.id);
  res.status(200).json({
    success: true,
    message: "Organization details retrieved successfully",
    data: organization,
  });
});

export const updateOrganizationById = asyncHandler(async (req, res) => {
  const organization = await organizationService.updateOrganizationById(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: "Organization updated successfully",
    data: organization,
  });
});

export const updateOrganizationStatus = asyncHandler(async (req, res) => {
  const organization = await organizationService.updateOrganizationStatus(req.params.id, req.body.status);
  res.status(200).json({
    success: true,
    message: "Organization status updated successfully",
    data: organization,
  });
});

export const deleteOrganizationById = asyncHandler(async (req, res) => {
  const organization = await organizationService.deleteOrganizationById(req.params.id);
  res.status(200).json({
    success: true,
    message: "Organization deleted successfully",
    data: organization,
  });
});
