import mongoose from "mongoose";

const personalizeSchema = new mongoose.Schema(
  {
    parentId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    questionAnswers: [
      {
        question: {
          type: String,
          required: true,
          trim: true,
        },
        answer: {
          type: mongoose.Schema.Types.Mixed,
          required: true,
        },
      },
    ],
  },
  { timestamps: true, collection: "personalize" }
);

export default mongoose.model("Personalize", personalizeSchema);
