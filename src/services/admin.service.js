import SuperAdmin from "../models/superAdmin.model.js";
import Assessment from "../models/assesment.model.js";
import mongoose from "mongoose";
import { generateToken } from "../utils/jwt.js";

export const addAssesmentSet = async (assesmentData) => {

    const { question, ansOptions } = assesmentData;
  
    const formattedOptions = ansOptions.map((opt, index) => ({
      id: index + 1,
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