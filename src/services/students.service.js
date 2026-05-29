import Student from "../models/student.model.js";

export const createStudent = async (data) => {
  const student = await Student.create(data);
  return student;
};

export const getStudents = async () => {
  return await Student.find();
};

export const getStudentById = async (id) => {
  const student = await Student.findById(id);
  if (!student) {
    const error = new Error("Student not found");
    error.statusCode = 404;
    throw error;
  }
  return student;
};

export const updateStudentById = async (id, data) => {
  const student = await Student.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!student) {
    const error = new Error("Student not found");
    error.statusCode = 404;
    throw error;
  }
  return student;
};

export const deleteStudentById = async (id) => {
  const student = await Student.findByIdAndDelete(id);
  if (!student) {
    const error = new Error("Student not found");
    error.statusCode = 404;
    throw error;
  }
  return student;
};

export const assignTeacherToStudent = async (id, teacherId) => {
  const student = await Student.findByIdAndUpdate(
    id,
    { teacherId },
    { new: true, runValidators: true }
  );
  if (!student) {
    const error = new Error("Student not found");
    error.statusCode = 404;
    throw error;
  }
  return student;
};

export const getStudentReport = async (id) => {
  const student = await Student.findById(id);
  if (!student) {
    const error = new Error("Student not found");
    error.statusCode = 404;
    throw error;
  }
  return {
    studentId: student.studentId,
    report: {
      attendance: 95,
      progressScore: 78,
    },
  };
};

export const getStudentProgress = async (id) => {
  const student = await Student.findById(id);
  if (!student) {
    const error = new Error("Student not found");
    error.statusCode = 404;
    throw error;
  }
  return {
    studentId: student.studentId,
    progress: {
      completedLessons: 12,
      pendingLessons: 3,
      engagementScore: 82,
    },
  };
};