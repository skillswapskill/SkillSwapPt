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
    notifications: {
      type: [
        {
          message: { type: String, required: true },
          isRead: { type: Boolean, default: false },
          createdAt: { type: Date, default: Date.now },
          type: {
            type: String,
            enum: ["welcome", "credit", "course", "debit"],
            default: "welcome",
          },
        },
      ],
      // Each new user starts with a single unread welcome message
      default: () => [{ message: "Welcome to SkillSwap 😊", type: "welcome" }],
    },
    // Add this to your user schema
    skillCoins: { type: Number, default: 0 },

    firstLoginRewarded: { type: Boolean, default: false },
    isSetupDone: { type: Boolean, default: false },
    profilePic: String, // New field if you store image URL or base64
    skills: [String],

    // Add this to your existing User schema
    challenges: {
      type: Map,
      of: {
        challengeId: String,
        answer: String,
        creditsEarned: Number,
        completedAt: Date,
        challengeTitle: String,
      },
      default: new Map(),
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
