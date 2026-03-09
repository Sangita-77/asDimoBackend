import mongoose from "mongoose";

const parentSchema = new mongoose.Schema(
  {
    // foreign key to users.userId for this parent
    parentId: {
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
    // Only for ParentsOrg (flag 2). For ParentsGlobal (flag 4) keep null.
    // This is the organization's users.userId (Number), not Mongo _id
    organizationId: {
      type: Number,
      default: null,
      index: true,
    },

    // TODO: add more parent-specific fields here (phone, address, children, etc.)
  },
  { timestamps: true }
);

export default mongoose.model("Parent", parentSchema);
