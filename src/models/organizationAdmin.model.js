import mongoose from "mongoose";

const organizationAdminSchema = new mongoose.Schema(
  {
    organizationAdminId: {
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
      unique: true,
      index: true,
    },
    adminId: {
        type: String,
        required: function () {
            return this.flag === 1;
        },
    },
    organization_type: {
        type: Number,
        required: function () {
            return this.flag === 1;
        },
    },
    zonalAdminId: {
        type: String,
        required: function () {
            return this.flag === 1;
        },
    },
    city: {
      type: String,
      required: true,
      index: true
    },
    state: {
      type: String,
      required: true,
      index: true
    },
    pincode: {
      type: String,
      required: true,
      index: true
    },
    address: String

    // TODO: add more org-admin-specific fields/permissions here.
  },
  { timestamps: true }
);

export default mongoose.model("OrganizationAdmin", organizationAdminSchema);

