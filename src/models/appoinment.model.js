import mongoose from "mongoose";

const appoinmentSchema = new mongoose.Schema(
    {
      parentId: {
        type: Number,
        required: true,
      },
  
      teacherId: {
        type: Number,
        required: true,
      },
  
      availabilityId: {   
        type: mongoose.Schema.Types.ObjectId,
        ref: "Availability",
        required: true,
      },
  
      date: {
        type: String,
        required: true,
      },
  
      time: {
        type: String,
        required: true,
      },
  
    //   status: {
    //     type: String,
    //     default: "pending",
    //   },

      status: {
        type: String,
        enum: ["pending", "approved", "rejected", "cancelled" , "rescheduled" , "completed"],
        default: "pending",
      },

      reason: {
        type: String,
        default: "payment done",
      },

      paymentId: {
        type: String,
        required: false,
      },
  
      zoomLink: String,
      doneBy: {
        type: String,
        enum: ["parent", "teacher" , "admin" , "superadmin" , "zonaladmin" , "organizationadmin"],
        default: "parent",
      },
    },
    { timestamps: true }
  );

export default mongoose.model("appoinment", appoinmentSchema);