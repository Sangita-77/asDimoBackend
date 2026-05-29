import Upload from "../models/upload.model.js";
import User from "../models/user.model.js";

export const uploadProfileImage = async (userId, fileData) => {
  if (!fileData) {
    const error = new Error("No file provided");
    error.statusCode = 400;
    throw error;
  }

  const upload = await Upload.create({
    userId,
    fileType: "profile_image",
    fileName: fileData.filename || fileData.originalname,
    filePath: fileData.path || fileData.destination,
    fileSize: fileData.size,
    mimeType: fileData.mimetype,
  });

  await User.findOneAndUpdate({ userId }, { profileImage: upload._id }, { new: true });
  return upload;
};

export const uploadStudentDocuments = async (studentId, filesData) => {
  if (!filesData || filesData.length === 0) {
    const error = new Error("No files provided");
    error.statusCode = 400;
    throw error;
  }

  const uploads = await Upload.insertMany(
    filesData.map((file) => ({
      studentId,
      fileType: "student_document",
      fileName: file.filename || file.originalname,
      filePath: file.path || file.destination,
      fileSize: file.size,
      mimeType: file.mimetype,
    }))
  );

  return uploads;
};

export const uploadReports = async (uploadedBy, filesData) => {
  if (!filesData || filesData.length === 0) {
    const error = new Error("No files provided");
    error.statusCode = 400;
    throw error;
  }

  const uploads = await Upload.insertMany(
    filesData.map((file) => ({
      uploadedBy,
      fileType: "report",
      fileName: file.filename || file.originalname,
      filePath: file.path || file.destination,
      fileSize: file.size,
      mimeType: file.mimetype,
    }))
  );

  return uploads;
};

export const getUploadsByUserId = async (userId) => {
  return await Upload.find({ userId });
};

export const getUploadsByStudentId = async (studentId) => {
  return await Upload.find({ studentId });
};

export const deleteUpload = async (id) => {
  const upload = await Upload.findByIdAndDelete(id);
  if (!upload) {
    const error = new Error("Upload not found");
    error.statusCode = 404;
    throw error;
  }
  return upload;
};
