import Evaluation from "../models/evaluation.model.js";

export const createEvaluation = async (data) => {
  const evaluation = await Evaluation.create(data);
  return evaluation;
};

export const getEvaluations = async () => {
  return await Evaluation.find();
};

export const getEvaluationById = async (id) => {
  const evaluation = await Evaluation.findById(id);
  if (!evaluation) {
    const error = new Error("Evaluation not found");
    error.statusCode = 404;
    throw error;
  }
  return evaluation;
};

export const updateEvaluationById = async (id, data) => {
  const evaluation = await Evaluation.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!evaluation) {
    const error = new Error("Evaluation not found");
    error.statusCode = 404;
    throw error;
  }
  return evaluation;
};

export const deleteEvaluationById = async (id) => {
  const evaluation = await Evaluation.findByIdAndDelete(id);
  if (!evaluation) {
    const error = new Error("Evaluation not found");
    error.statusCode = 404;
    throw error;
  }
  return evaluation;
};

export const startEvaluation = async (data) => {
  const evaluation = await Evaluation.create({ ...data, status: "in-progress", startedAt: new Date() });
  return evaluation;
};

export const submitEvaluation = async (data) => {
  const evaluation = await Evaluation.findOneAndUpdate(
    { evaluationId: data.evaluationId },
    { status: "submitted", report: data.report || {}, completedAt: new Date(), questions: data.answers || [] },
    { new: true, runValidators: true }
  );
  if (!evaluation) {
    const error = new Error("Evaluation not found");
    error.statusCode = 404;
    throw error;
  }
  return evaluation;
};

export const getEvaluationReport = async (id) => {
  const evaluation = await Evaluation.findOne({ evaluationId: Number(id) });
  if (!evaluation) {
    const error = new Error("Evaluation not found");
    error.statusCode = 404;
    throw error;
  }
  return evaluation.report || {};
};

export const getEvaluationHistory = async (studentId) => {
  return await Evaluation.find({ studentId: Number(studentId) });
};