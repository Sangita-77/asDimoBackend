import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    status: {
      type: Number,
      default: 1,
      enum: [0, 1],
    },
    // TODO: add more organization fields here (address, contact, code, etc.)
  },
  { timestamps: true }
);

export default mongoose.model("Organization", organizationSchema);
