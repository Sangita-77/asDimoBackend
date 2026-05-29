import { asyncHandler } from "../utils/asyncHandler.js";
import * as studentsService from "../services/students.service.js";

export const createStudent = asyncHandler(async (req, res) => {
  const student = await studentsService.createStudent(req.body);
  res.status(201).json({
    success: true,
    message: "Student created successfully",
    data: student,
  });
});

export const getStudents = asyncHandler(async (req, res) => {
  const students = await studentsService.getStudents();
  res.status(200).json({
    success: true,
    message: "Students retrieved successfully",
    data: students,
  });
});

export const getStudentById = asyncHandler(async (req, res) => {
  const student = await studentsService.getStudentById(req.params.id);
  res.status(200).json({
    success: true,
    message: "Student details retrieved successfully",
    data: student,
  });
});

export const updateStudentById = asyncHandler(async (req, res) => {
  const student = await studentsService.updateStudentById(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: "Student updated successfully",
    data: student,
  });
});

export const deleteStudentById = asyncHandler(async (req, res) => {
  const student = await studentsService.deleteStudentById(req.params.id);
  res.status(200).json({
    success: true,
    message: "Student deleted successfully",
    data: student,
  });
});

export const assignTeacherToStudent = asyncHandler(async (req, res) => {
  const student = await studentsService.assignTeacherToStudent(req.params.id, req.body.teacherId);
  res.status(200).json({
    success: true,
    message: "Teacher assigned to student successfully",
    data: student,
  });
});

export const getStudentReport = asyncHandler(async (req, res) => {
  const report = await studentsService.getStudentReport(req.params.id);
  res.status(200).json({
    success: true,
    message: "Student report retrieved successfully",
    data: report,
  });
});

export const getStudentProgress = asyncHandler(async (req, res) => {
  const progress = await studentsService.getStudentProgress(req.params.id);
  res.status(200).json({
    success: true,
    message: "Student progress retrieved successfully",
    data: progress,
  });
});
