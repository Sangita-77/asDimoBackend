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

  // 1. Check availability
  const availability = await Availability.findOne({
    userId: teacherId,
    date,
    time,
  });

  // const availability = await Availability.findById(appointment.availabilityId);

  if (!availability) {
    throw new Error("This time slot is not available");
  }

  // 2. Check already approved
  const alreadyApproved = await Appointment.findOne({
    teacherId,
    date,
    time,
    status: "approved",
  });

  if (alreadyApproved) {
    throw new Error("This slot is already booked");
  }

  // 3. Prevent duplicate
  const existingAppointment = await Appointment.findOne({
    parentId,
    teacherId,
    date,
    time,
  });

  if (existingAppointment) {
    throw new Error("You already requested this slot");
  }


  const appointment = await Appointment.create({
    parentId,
    teacherId,
    availabilityId: availability._id,
    date,
    time,
    status: "pending",
    zoomLink: availability.zoomLink,
  });

  return appointment;
};

// export const bookAppoinmentSer = async (parentId, teacherId, date, time) => {

//   // 1. Check availability
//   const availability = await Availability.findOne({
//     userId: teacherId,
//     date,
//     time,
//   });

//   if (!availability) {
//     throw new Error("This time slot is not available");
//   }

//   // ❗ Only block if already APPROVED booking exists
//   const alreadyApproved = await Appointment.findOne({
//     teacherId,
//     date,
//     time,
//     status: "approved",
//   });

//   if (alreadyApproved) {
//     throw new Error("This slot is already booked");
//   }

//   // 2. Prevent duplicate booking by same parent
//   const existingAppointment = await Appointment.findOne({
//     parentId,
//     teacherId,
//     date,
//     time,
//   });

//   if (existingAppointment) {
//     throw new Error("You already requested this slot");
//   }

//   // 3. Create PENDING appointment
//   const appointment = await Appointment.create({
//     parentId,
//     teacherId,
//     date,
//     time,
//     status: "pending", // ✅ important
//   });

//   return appointment;
// };


export const cancelAppointmentSer = async (appointmentId) => {

  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  if (appointment.status === "cancelled") {
    throw new Error("Appointment already cancelled");
  }

  // 1. Update appointment status
  appointment.status = "cancelled";
  await appointment.save();

  // 2. Free the slot again
  await Availability.findOneAndUpdate(
    {
      userId: appointment.teacherId,
      date: appointment.date,
      time: appointment.time,
    },
    {
      isBooked: false,
    }
  );

  return appointment;
};

