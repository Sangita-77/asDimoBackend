import mongoose from "mongoose";

const organizationAdminSchema = new mongoose.Schema(
  {
    // foreign key to users.userId for this organization admin
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
    // organizationId here is the organization *user's* userId (Number)
    organizationId: {
      type: Number,
      required: true,
    },

    // TODO: add more org-admin-specific fields/permissions here.
  },
  { timestamps: true }
);

export default mongoose.model("OrganizationAdmin", organizationAdminSchema);

