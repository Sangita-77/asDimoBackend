import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    adminId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    zonalAdminId: {
      type: Number,
      required: true,
      index: true,
    },
    status: {
      type: Number,
      default: 1,
      enum: [0, 1],
    },
    city: {
      type: String,
      required: true,
      index: true,
    },
    state: {
      type: String,
      required: true,
      index: true,
    },
    pincode: {
      type: String,
      required: true,
      index: true,
    },
    address: String,
  },
  { timestamps: true }
);

export default mongoose.model("Admin", adminSchema);
