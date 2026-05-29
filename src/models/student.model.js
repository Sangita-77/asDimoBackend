import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: Number,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    parentId: {
      type: Number,
      required: false,
    },
    organizationId: {
      type: Number,
      required: false,
    },
    teacherId: {
      type: Number,
      required: false,
    },
    status: {
      type: Number,
      enum: [0, 1],
      default: 1,
    },
  },
  { timestamps: true }
);

studentSchema.pre("save", async function () {
  if (!this.isNew) return;

  const last = await this.constructor.findOne({}).sort({ studentId: -1 }).select("studentId").lean();
  this.studentId = last?.studentId ? last.studentId + 1 : 1;
});

export default mongoose.model("Student", studentSchema);