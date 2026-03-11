import mongoose from "mongoose";

const assesmentSchema = new mongoose.Schema(
    {
      questionId: {
        type: Number,
        required: true,
        unique: true,
        index: true,
      },
    
      question: {
        type: String,
        required: true,
        trim: true,
      },
    
      ansOptions: [
        {
          id: {
            type: Number,
            required: true
          },
          option: {
            type: String,
            required: true,
            trim: true
          }
        }
      ]
    
    },
    { timestamps: true }
);

export default mongoose.model("assesment", assesmentSchema);

