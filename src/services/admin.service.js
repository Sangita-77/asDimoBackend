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

