import { asyncHandler } from "../utils/asyncHandler.js";
import * as uploadsService from "../services/uploads.service.js";

export const uploadProfileImage = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const upload = await uploadsService.uploadProfileImage(userId, req.file);
  res.status(201).json({
    success: true,
    message: "Profile image uploaded successfully",
    data: upload,
  });
});

export const uploadStudentDocuments = asyncHandler(async (req, res) => {
  const studentId = req.body.studentId || req.query.studentId;
  const uploads = await uploadsService.uploadStudentDocuments(studentId, req.files);
  res.status(201).json({
    success: true,
    message: "Student documents uploaded successfully",
    data: uploads,
  });
});

export const uploadReports = asyncHandler(async (req, res) => {
  const uploadedBy = req.user?.id;
  const uploads = await uploadsService.uploadReports(uploadedBy, req.files);
  res.status(201).json({
    success: true,
    message: "Reports uploaded successfully",
    data: uploads,
  });
});
