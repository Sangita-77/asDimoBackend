import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: Number,
      unique: true,
      index: true, // Fast lookup and ensure uniqueness
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // Don't include password in queries by default
    },
    flag: {
      type: Number,
      required: true,
      enum: [0, 1, 2, 3, 4, 5, 6], // SuperAdmin - 0 , OrganizationAdmin - 1 , ParentsOrg - 2 , TeachersOrg - 3 , parentsGlobal - 4 , teachersGlobal - 5 ,  zonalAdmin - 6
    },
    status: {
      type: Number,
      default: 1, // 1 = Active, 0 = Inactive
      enum: [0, 1],
    },
  },
  { timestamps: true }
);

// Auto-increment userId for each new user
userSchema.pre("save", async function () {
  if (!this.isNew) {
    return;
  }

  const session = this.$session?.() || undefined;

  // Find the user with the highest userId and increment it
  const lastUser = await this.constructor
    .findOne({})
    .sort({ userId: -1 })
    .select("userId")
    .session(session)
    .lean();

  this.userId = lastUser && lastUser.userId ? lastUser.userId + 1 : 1;
});

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);