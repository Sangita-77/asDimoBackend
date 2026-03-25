import Assessment from "../models/assesment.model.js";
import Availability from "../models/avialability.model.js";
import Appointment from "../models/appoinment.model.js";


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

    if(totalPercentage < 50 ){
      message = "poor bacha";
    }else if(totalPercentage < 80){
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

export const bookAppoinmentSer = async (parentId, teacherId, date, time) => {

  // 1. Check if availability exists
  const availability = await Availability.findOne({
    userId: teacherId,
    date,
    time,
  });

  if (!availability) {
    throw new Error("This time slot is not available");
  }

  // 2. Check if already booked
  if (availability.isBooked) {
    throw new Error("This slot is already booked");
  }

  // 3. Prevent duplicate booking by same parent
  const existingAppointment = await Appointment.findOne({
    parentId,
    teacherId,
    date,
    time,
  });

  if (existingAppointment) {
    throw new Error("You already booked this slot");
  }

  // 4. Create appointment
  const appointment = await Appointment.create({
    parentId,
    teacherId,
    date,
    time,
  });

  // 5. Mark slot as booked
  availability.isBooked = true;
  await availability.save();

  return appointment;
};