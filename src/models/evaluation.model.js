import mongoose from "mongoose";

const evaluationSchema = new mongoose.Schema(
  {
    evaluationId: {
      type: Number,
      unique: true,
      index: true,
    },
    studentId: {
      type: Number,
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
    },
    questions: [
      {
        questionId: Number,
        answer: mongoose.Schema.Types.Mixed,
      },
    ],
    status: {
      type: String,
      enum: ["draft", "in-progress", "submitted", "completed"],
      default: "draft",
    },
    report: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    startedAt: Date,
    completedAt: Date,
  },
  { timestamps: true }
);

evaluationSchema.pre("save", async function () {
  if (!this.isNew) return;

  const last = await this.constructor.findOne({}).sort({ evaluationId: -1 }).select("evaluationId").lean();
  this.evaluationId = last?.evaluationId ? last.evaluationId + 1 : 1;
});

export default mongoose.model("Evaluation", evaluationSchema);