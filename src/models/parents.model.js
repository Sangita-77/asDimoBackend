import mongoose from "mongoose";

const parentsSchema = new mongoose.Schema(
  {
    parentId: {
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
    organizationId: {
      type: Number,
      default: null,
      index: true,
    },

    // TODO: add more teacher-specific fields here (phone, subject, etc.)
  },
  { timestamps: true }
);

export default mongoose.model("Parent", parentsSchema);

