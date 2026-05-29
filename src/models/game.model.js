import mongoose from "mongoose";

const gameSchema = new mongoose.Schema(
  {
    gameId: {
      type: Number,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

gameSchema.pre("save", async function () {
  if (!this.isNew) return;

  const last = await this.constructor.findOne({}).sort({ gameId: -1 }).select("gameId").lean();
  this.gameId = last?.gameId ? last.gameId + 1 : 1;
});

export default mongoose.model("Game", gameSchema);