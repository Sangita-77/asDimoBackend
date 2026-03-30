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
    city: {
        type: String,
        required: true,
        index: true
    },
    state: {
        type: String,
        required: true,
        index: true
    },
    pincode: {
        type: String,
        required: true,
        index: true
    },
    address: String
  },
  { timestamps: true }
);

export default mongoose.model("ZonalAdmin", zonalAdminSchema);