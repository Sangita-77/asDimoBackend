import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    notificationId: {
      type: Number,
      unique: true,
      index: true,
    },
    userId: {
      type: Number,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

notificationSchema.pre("save", async function () {
  if (!this.isNew) return;

  const last = await this.constructor.findOne({}).sort({ notificationId: -1 }).select("notificationId").lean();
  this.notificationId = last?.notificationId ? last.notificationId + 1 : 1;
});

export default mongoose.model("Notification", notificationSchema);