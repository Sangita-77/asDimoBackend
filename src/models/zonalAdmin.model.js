import mongoose from "mongoose";

const zonalAdminSchema = new mongoose.Schema(
  {
    zonalAdminId: {
      type: Number,
      required: true,
      unique: true,
    },
    userId: {
      type: Number,
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ZonalAdmin", zonalAdminSchema);