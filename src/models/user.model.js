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
      // SuperAdmin - 0, OrganizationAdmin - 1, Parent - 2,
      // Therapist - 3, ParentsGlobal - 4, TherapistsGlobal - 5,
      // ZonalAdmin - 6, Admin - 7
      enum: [0, 1, 2, 3, 4, 5, 6, 7],
    },
    status: {
      type: Number,
      default: 1, // 1 = Active, 0 = Inactive
      enum: [0, 1],
    },
    profileImg: {
      type: String,
      default: null,
      trim: true,
    },
    city: {
      type: String,
      default: null,
      trim: true,
    },
    state: {
      type: String,
      default: null,
      trim: true,
    },
    pincode: {
      type: String,
      default: null,
      trim: true,
    },
    address: {
      type: String,
      default: null,
      trim: true,
    },
    phone: {
      type: String,
      default: null,
      trim: true,
    },
    country: {
      type: String,
      default: null,
      trim: true,
    },
    resetPasswordOTP: {
      type: String,
      default: null,
    },
    resetPasswordOTPExpiry: {
      type: Date,
      default: null,
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
