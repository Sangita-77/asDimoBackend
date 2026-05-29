import Assessment from "../models/assesment.model.js";
import Recommendation from "../models/recommendation.model.js";

export const createQuestion = async (data) => {
  const question = await Assessment.create(data);
  return question;
};

export const getQuestions = async () => {
  return await Assessment.find();
};

export const updateQuestionById = async (id, data) => {
  const question = await Assessment.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!question) {
    const error = new Error("Question not found");
    error.statusCode = 404;
    throw error;
  }
  return question;
};

export const deleteQuestionById = async (id) => {
  const question = await Assessment.findByIdAndDelete(id);
  if (!question) {
    const error = new Error("Question not found");
    error.statusCode = 404;
    throw error;
  }
  return question;
};

export const createQuestionOption = async (data) => {
  const question = await Assessment.findById(data.questionId);
  if (!question) {
    const error = new Error("Question not found");
    error.statusCode = 404;
    throw error;
  }

  const nextOptionId = question.ansOptions.length > 0 ? Math.max(...question.ansOptions.map((opt) => opt.ansOptionsId)) + 1 : 1;
  question.ansOptions.push({ ansOptionsId: nextOptionId, option: data.option });
  await question.save();
  return question;
};

export const createRecommendation = async (data) => {
  const recommendation = await Recommendation.create(data);
  return recommendation;
};