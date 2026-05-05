import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
    // foreign key to users.userId for this teacher
    teacherId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Only for TeachersOrg (flag 3). For TeachersGlobal (flag 5) keep null.
    // This is the organization's users.userId (Number), not Mongo _id
    organizationId: {
      type: Number,
      default: null,
      index: true,
    },

    // TODO: add more teacher-specific fields here (phone, subject, etc.)
  },
  { timestamps: true }
);

export default mongoose.model("Teacher", teacherSchema);

