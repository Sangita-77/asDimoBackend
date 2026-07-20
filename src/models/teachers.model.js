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
    // This is the organization's users.userId (Number), not Mongo _id.
    // A flag-5 therapist is its own organization, so these fields contain
    // that therapist's userId as well.
    organizationId: {
      type: Number,
      default: null,
      index: true,
    },
    organizationAdminId: {
      type: Number,
      default: null,
      index: true,
    },
    zonalAdminId: {
      type: Number,
      default: null,
      index: true,
    },
    adminId: {
      type: Number,
      default: null,
      index: true,
    },

    // TODO: add more therapist-specific fields here (phone, specialization, etc.)
  },
  { timestamps: true }
);

export default mongoose.model("Teacher", teacherSchema);

