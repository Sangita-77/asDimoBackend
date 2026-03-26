import Availability from "../models/avialability.model.js";
import User from "../models/user.model.js";
import { createZoomMeeting } from "../utils/zoom.js";




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

