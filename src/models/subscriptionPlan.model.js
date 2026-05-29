import mongoose from "mongoose";

const subscriptionPlanSchema = new mongoose.Schema(
  {
    planId: {
      type: Number,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    durationMonths: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

subscriptionPlanSchema.pre("save", async function () {
  if (!this.isNew) return;

  const last = await this.constructor.findOne({}).sort({ planId: -1 }).select("planId").lean();
  this.planId = last?.planId ? last.planId + 1 : 1;
});

export default mongoose.model("SubscriptionPlan", subscriptionPlanSchema);