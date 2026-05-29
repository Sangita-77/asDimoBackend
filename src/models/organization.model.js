import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    organizationId: {
      type: Number,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      trim: true,
    },
    city: String,
    state: String,
    address: String,
    status: {
      type: Number,
      enum: [0, 1],
      default: 1,
    },
  },
  { timestamps: true }
);

organizationSchema.pre("save", async function () {
  if (!this.isNew) return;

  const last = await this.constructor.findOne({}).sort({ organizationId: -1 }).select("organizationId").lean();
  this.organizationId = last?.organizationId ? last.organizationId + 1 : 1;
});

export default mongoose.model("Organization", organizationSchema);