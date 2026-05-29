import mongoose from "mongoose";

const recommendationSchema = new mongoose.Schema(
  {
    recommendationId: {
      type: Number,
      unique: true,
      index: true,
    },
    studentId: {
      type: Number,
      required: false,
      index: true,
    },
    questionId: {
      type: Number,
      required: false,
      index: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

recommendationSchema.pre("save", async function () {
  if (!this.isNew) return;

  const last = await this.constructor.findOne({}).sort({ recommendationId: -1 }).select("recommendationId").lean();
  this.recommendationId = last?.recommendationId ? last.recommendationId + 1 : 1;
});

export default mongoose.model("Recommendation", recommendationSchema);