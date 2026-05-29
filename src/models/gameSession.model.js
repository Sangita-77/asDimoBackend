import mongoose from "mongoose";

const gameSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: Number,
      unique: true,
      index: true,
    },
    studentId: {
      type: Number,
      required: true,
      index: true,
    },
    gameId: {
      type: Number,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["started", "completed"],
      default: "started",
    },
    score: Number,
  },
  { timestamps: true }
);

gameSessionSchema.pre("save", async function () {
  if (!this.isNew) return;

  const last = await this.constructor.findOne({}).sort({ sessionId: -1 }).select("sessionId").lean();
  this.sessionId = last?.sessionId ? last.sessionId + 1 : 1;
});

export default mongoose.model("GameSession", gameSessionSchema);