import mongoose from "mongoose";

const childSchema = new mongoose.Schema(
  {
    childId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    parentId: {
      type: Number,
      required: true,
      index: true,
    },
    childName: {
      type: String,
      required: true,
      trim: true,
    },
    childGender: {
      type: String,
      required: true,
      trim: true,
    },
    childAge: {
      type: Number,
      required: true,
      min: 0,
    },
    grade: {
      type: String,
      required: true,
      trim: true,
    },
    familyType: {
      type: String,
      required: true,
      trim: true,
    },
    language: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

childSchema.pre("validate", async function () {
  if (!this.isNew || this.childId) return;

  const lastChild = await this.constructor
    .findOne({})
    .sort({ childId: -1 })
    .select("childId")
    .lean();

  this.childId = lastChild?.childId ? lastChild.childId + 1 : 1;
});

export default mongoose.model("Child", childSchema);
