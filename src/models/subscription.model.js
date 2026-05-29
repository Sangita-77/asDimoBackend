import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    subscriptionId: {
      type: Number,
      unique: true,
      index: true,
    },
    organizationId: {
      type: Number,
      required: true,
      index: true,
    },
    planId: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: Date,
    status: {
      type: String,
      enum: ["active", "cancelled", "expired"],
      default: "active",
    },
  },
  { timestamps: true }
);

subscriptionSchema.pre("save", async function () {
  if (!this.isNew) return;

  const last = await this.constructor.findOne({}).sort({ subscriptionId: -1 }).select("subscriptionId").lean();
  this.subscriptionId = last?.subscriptionId ? last.subscriptionId + 1 : 1;
});

export default mongoose.model("Subscription", subscriptionSchema);