import Availability from "../models/avialability.model.js";
import User from "../models/user.model.js";
import Appointment from "../models/appoinment.model.js";
import { createZoomMeeting } from "../utils/zoom.js";
import { sendEmail } from "../utils/mailer.js";




export const addAvailabilityservice = async (userId, date, time) => {

  const user = await User.findOne({ userId }).select("flag");
  const flag = user?.flag;

  if (flag !== 3 && flag !== 5) {
    throw new Error("This user is not Doctor/Therapist/Teacher");
  }


  const existing = await Availability.findOne({ userId, date, time });

  if (existing) {
    throw new Error("This time slot already exists for this user");
  }

  const zoomMeeting = await createZoomMeeting(date, time);

  const availability = await Availability.create({
    userId,
    date,
    time,
    zoomLink: zoomMeeting.join_url,
    zoomMeetingId: zoomMeeting.id,
  });

  return availability;
};


export const getAvailabilityWTSer = async () => {
  const data = await Availability.aggregate([
    {
      $lookup: {
        from: "users", 
        localField: "userId",
        foreignField: "userId",
        as: "userDetails"
      }
    },
    {
      $unwind: {
        path: "$userDetails",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: "teachers",
        localField: "userId",
        foreignField: "userId",
        as: "teacherDetails"
      }
    },
    {
      $unwind: {
        path: "$teacherDetails",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: "organizationadmins",
        localField: "teacherDetails.organizationId",
        foreignField: "organizationId",
        as: "organizationDetails"
      }
    },
    {
      $unwind: {
        path: "$organizationDetails",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $addFields: {
        isGlobalTeacher: {
          $cond: [
            { $eq: ["$teacherDetails.organizationId", null] },
            true,
            false
          ]
        }
      }
    },
    {
      $project: {
        __v : 0,
        _id : 0,
        createdAt : 0,
        updatedAt : 0,
        "userDetails._id": 0, 
        "userDetails.password": 0, 
        "userDetails.__v": 0,
        "userDetails.createdAt": 0,
        "userDetails.updatedAt": 0,

        "teacherDetails._id": 0,
        "teacherDetails.__v": 0,
        "teacherDetails.createdAt": 0,
        "teacherDetails.updatedAt": 0,

        "organizationDetails._id": 0,
        "organizationDetails.__v": 0,
        "organizationDetails.createdAt": 0,
        "organizationDetails.updatedAt": 0
      }
    }
  ]);

  return data;
};

export const approveAppointmentSer = async (appointmentId, status) => {

  const allowedStatus = ["approved", "rejected"];

  if (!allowedStatus.includes(status)) {
    throw new Error("Invalid status. Use 'approved' or 'rejected'");
  }

  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  if (appointment.status !== "pending") {
    throw new Error("Only pending appointments can be updated");
  }

  if (status === "approved") {

    const alreadyApproved = await Appointment.findOne({
      teacherId: appointment.teacherId,
      date: appointment.date,
      time: appointment.time,
      status: "approved",
    });

    if (alreadyApproved) {
      throw new Error("Slot already booked by another user");
    }

    appointment.status = "approved";
    await appointment.save();

    const availability = await Availability.findOne({
      userId: appointment.teacherId,
      date: appointment.date,
      time: appointment.time,
    });

    if (availability) {
      availability.isBooked = true;
      await availability.save();
    }

    await Appointment.updateMany(
      {
        teacherId: appointment.teacherId,
        date: appointment.date,
        time: appointment.time,
        status: "pending",
        _id: { $ne: appointmentId },
      },
      { status: "rejected" }
    );
  }

  if (status === "rejected") {
    appointment.status = "rejected";
    await appointment.save();
  }

  return appointment;
};