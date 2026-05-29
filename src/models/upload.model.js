import mongoose from "mongoose";

const uploadSchema = new mongoose.Schema(
  {
    uploadId: {
      type: Number,
      unique: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: Number,
      required: false,
    },
    studentId: {
      type: Number,
      required: false,
    },
    filePath: {
      type: String,
      required: true,
    },
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

uploadSchema.pre("save", async function () {
  if (!this.isNew) return;

  const last = await this.constructor.findOne({}).sort({ uploadId: -1 }).select("uploadId").lean();
  this.uploadId = last?.uploadId ? last.uploadId + 1 : 1;
});

export default mongoose.model("Upload", uploadSchema);