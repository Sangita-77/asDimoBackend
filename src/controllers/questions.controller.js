import { asyncHandler } from "../utils/asyncHandler.js";
import * as questionsService from "../services/questions.service.js";

export const createQuestion = asyncHandler(async (req, res) => {
  const question = await questionsService.createQuestion(req.body);
  res.status(201).json({
    success: true,
    message: "Question created successfully",
    data: question,
  });
});

export const getQuestions = asyncHandler(async (req, res) => {
  const questions = await questionsService.getQuestions();
  res.status(200).json({
    success: true,
    message: "Questions retrieved successfully",
    data: questions,
  });
});

export const updateQuestionById = asyncHandler(async (req, res) => {
  const question = await questionsService.updateQuestionById(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: "Question updated successfully",
    data: question,
  });
});

export const deleteQuestionById = asyncHandler(async (req, res) => {
  const question = await questionsService.deleteQuestionById(req.params.id);
  res.status(200).json({
    success: true,
    message: "Question deleted successfully",
    data: question,
  });
});

export const createQuestionOption = asyncHandler(async (req, res) => {
  const option = await questionsService.createQuestionOption(req.body);
  res.status(201).json({
    success: true,
    message: "Question option created successfully",
    data: option,
  });
});

export const createRecommendation = asyncHandler(async (req, res) => {
  const recommendation = await questionsService.createRecommendation(req.body);
  res.status(201).json({
    success: true,
    message: "Recommendation created successfully",
    data: recommendation,
  });
});
