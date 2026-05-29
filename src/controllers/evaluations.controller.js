import { asyncHandler } from "../utils/asyncHandler.js";
import * as evaluationsService from "../services/evaluations.service.js";

export const createEvaluation = asyncHandler(async (req, res) => {
  const evaluation = await evaluationsService.createEvaluation(req.body);
  res.status(201).json({
    success: true,
    message: "Evaluation created successfully",
    data: evaluation,
  });
});

export const getEvaluations = asyncHandler(async (req, res) => {
  const evaluations = await evaluationsService.getEvaluations();
  res.status(200).json({
    success: true,
    message: "Evaluations retrieved successfully",
    data: evaluations,
  });
});

export const getEvaluationById = asyncHandler(async (req, res) => {
  const evaluation = await evaluationsService.getEvaluationById(req.params.id);
  res.status(200).json({
    success: true,
    message: "Evaluation details retrieved successfully",
    data: evaluation,
  });
});

export const updateEvaluationById = asyncHandler(async (req, res) => {
  const evaluation = await evaluationsService.updateEvaluationById(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: "Evaluation updated successfully",
    data: evaluation,
  });
});

export const deleteEvaluationById = asyncHandler(async (req, res) => {
  const evaluation = await evaluationsService.deleteEvaluationById(req.params.id);
  res.status(200).json({
    success: true,
    message: "Evaluation deleted successfully",
    data: evaluation,
  });
});

export const startEvaluation = asyncHandler(async (req, res) => {
  const evaluation = await evaluationsService.startEvaluation(req.body);
  res.status(200).json({
    success: true,
    message: "Evaluation started successfully",
    data: evaluation,
  });
});

export const submitEvaluation = asyncHandler(async (req, res) => {
  const evaluation = await evaluationsService.submitEvaluation(req.body);
  res.status(200).json({
    success: true,
    message: "Evaluation submitted successfully",
    data: evaluation,
  });
});

export const getEvaluationReport = asyncHandler(async (req, res) => {
  const report = await evaluationsService.getEvaluationReport(req.params.id);
  res.status(200).json({
    success: true,
    message: "Evaluation report retrieved successfully",
    data: report,
  });
});

export const getEvaluationHistory = asyncHandler(async (req, res) => {
  const history = await evaluationsService.getEvaluationHistory(req.params.studentId);
  res.status(200).json({
    success: true,
    message: "Evaluation history retrieved successfully",
    data: history,
  });
});
