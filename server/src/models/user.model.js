import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    creditEarned: {
      type: Number,
      default: 0,
    },
    creditSpent: {
      type: Number,
      default: 0,
    },
    demandedCredit: {
      type: Number,
      default: 0,
    },
    totalCredits: {
      type: Number,
      default: 0,
    },
    firstLoginRewarded: { type: Boolean, default: false },
    isSetupDone: { type: Boolean, default: false },
    profilePic: String, // New field if you store image URL or base64
    skills: [String],

  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
