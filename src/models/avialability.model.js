import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema(
    {
      userId: {
        type: Number,
        required: true,
        index: true,
      },
  
      date: {
        type: String, // "dd-mm-yyyy"
        required: true,
      },
  
      time: {
        type: String, // "HH:mm"
        required: true,
      },
      isBooked: { 
        type: Boolean, 
        default: false 
      },

      medium: {
        type: String, // "online" or "center" or "home"
        required: true,
      },

      zoomLink: String,
      zoomMeetingId: String,
      zoomPassword: String,

    },
    { timestamps: true }
);

availabilitySchema.index({ userId: 1, date: 1, time: 1 }, { unique: true });

export default mongoose.model("availability", availabilitySchema);