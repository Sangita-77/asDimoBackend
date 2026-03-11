import SuperAdmin from "../models/superAdmin.model.js";
import Assessment from "../models/assesment.model.js";
import mongoose from "mongoose";
import { generateToken } from "../utils/jwt.js";

export const addAssesmentSet = async (assesmentData) => {

    const { question, ansOptions } = assesmentData;
  
    const formattedOptions = ansOptions.map((opt, index) => ({
      ansOptionsId: index + 1,
      option: opt
    }));
  
    const lastQuestion = await Assessment.findOne().sort({ questionId: -1 });
  
    const questionId = lastQuestion ? lastQuestion.questionId + 1 : 1;
  
    const newAssessment = new Assessment({
      questionId,
      question,
      ansOptions: formattedOptions
    });
  
    return await newAssessment.save();
};

export const getAssesmentSet = async () => {

  const assesment = await Assessment.find().select();

  if(!assesment){
    const error = new Error("Assesment not found");
    error.statusCode = 404;
    throw error;
  }

  return assesment;

};

export const assetmentTestService = async (testData) => {

  const { parentId, answers } = testData;

  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    throw new Error("Answers are required");
  }

  const assesment = await Assessment.find();

  const totalQuestions = assesment.length;

  if (!totalQuestions) {
    throw new Error("No questions found");
  }

  const questionWeight = 100 / totalQuestions;

  let totalPercentage = 0;
  let result = [];

  for (const ans of answers) {

    const { questionId, ansOptionsId } = ans;

    if (!questionId) {
      throw new Error("questionId is required");
    }

    if (!ansOptionsId) {
      throw new Error(`ansOptionsId is required for question ${questionId}`);
    }

    const question = assesment.find(q => q.questionId === questionId);

    if (!question) {
      throw new Error(`Question ${questionId} not found`);
    }

    const option = question.ansOptions.find(
      opt => opt.ansOptionsId === ansOptionsId
    );

    if (!option) {
      throw new Error(
        `Option ${ansOptionsId} not found under question ${questionId}`
      );
    }

    const totalOptions = question.ansOptions.length;

    const optionWeight = questionWeight / totalOptions;

    const percentage = optionWeight * ansOptionsId;

    totalPercentage +=  percentage;

    var message = "";

    if(totalPercentage <= 50 ){
      message = "poor bacha";
    }else if(totalPercentage <= 80){
      message = "average bacha";
    }else{
      message = "normal bacha";
    }

    result.push({
      questionId,
      ansOptionsId,
      percentage
    });

  }

  return {
    answers: result,
    totalPercentage,
    message
  };

};