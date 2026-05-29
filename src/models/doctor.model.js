import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    doctorId: {
      type: Number,
      unique: true,
      index: true,
    },
    userId: {
      type: Number,
      required: false,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    organizationId: {
      type: Number,
      required: false,
    },
    availability: [
      {
        date: String,
        time: String,
      },
    ],
    status: {
      type: Number,
      enum: [0, 1],
      default: 1,
    },
  },
  { timestamps: true }
);

doctorSchema.pre("save", async function () {
  if (!this.isNew) return;

  const last = await this.constructor.findOne({}).sort({ doctorId: -1 }).select("doctorId").lean();
  this.doctorId = last?.doctorId ? last.doctorId + 1 : 1;
});

export default mongoose.model("Doctor", doctorSchema);