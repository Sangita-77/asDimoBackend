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