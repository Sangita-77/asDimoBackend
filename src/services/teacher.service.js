import Availability from "../models/avialability.model.js";
import User from "../models/user.model.js";


export const addAvailabilityservice = async (userId, date, time) => {

    // const user = await User.findById(userId).select("-password");
    const user = await User.findOne({ userId }).select("flag");
    const flag = user?.flag;

    if( flag !== 3 && flag !== 5 ){
        const error = new Error("This user is not Doctor/Therapist/Teacher");
        error.statusCode = 404;
        throw error;
    }

    const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
    if (!dateRegex.test(date)) {
      throw new Error("Invalid date format. Use dd-mm-yyyy");
    }
  
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(time)) {
      throw new Error("Invalid time format. Use HH:mm");
    }
  
    const [day, month, year] = date.split("-");
    const inputDate = new Date(`${year}-${month}-${day}`);
  
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    const maxDate = new Date();
    maxDate.setHours(0, 0, 0, 0);
    maxDate.setDate(maxDate.getDate() + 30);
  
    if (inputDate < today) {
      throw new Error("You cannot select a past date");
    }
  
    if (inputDate > maxDate) {
      throw new Error("You can only set availability within next 30 days");
    }
  
    const existing = await Availability.findOne({ userId, date, time });
  
    if (existing) {
      throw new Error("This time slot already exists for this user");
    }
  
    const availability = await Availability.create({
      userId,
      date,
      time,
    });
  
    return availability;
};

// export const getAvailabilityWTSer = async () => {

//   const availability = await Availability.find().select();
//   const userIds = [...new Set(availability.map(item => item.userId))];

//   const users = await User.find({ userId: { $in: userIds } });

//   return { availability, users };
// };


// export const getAvailabilityWTSer = async () => {
//   const availability = await Availability.find();

//   const userIds = [...new Set(availability.map(item => item.userId))];

//   const users = await User.find({ userId: { $in: userIds } });

//   const result = availability.map(item => {
//     const user = users.find(u => u.userId === item.userId);

//     return {
//       ...item.toObject(),
//       userDetails: user || null
//     };
//   });

//   return result;
// };


export const getAvailabilityWTSer = async () => {
  const data = await Availability.aggregate([
    {
      $lookup: {
        from: "users", // collection name
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

