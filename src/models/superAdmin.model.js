import mongoose from "mongoose";

const superAdminSchema = new mongoose.Schema(
  {
    // foreign key to users.userId for this super admin
    adminId: {
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

    // TODO: add more super-admin-specific fields/permissions here.
  },
  { timestamps: true }
);

export default mongoose.model("SuperAdmin", superAdminSchema);

