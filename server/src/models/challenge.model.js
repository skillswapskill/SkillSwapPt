import mongoose from "mongoose";

const challengeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  type: { type: String, required: true }, // 'code', 'language', 'math', etc.
  title: { type: String, required: true },
  description: { type: String, required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  hint: { type: String },
  difficulty: { type: Number, default: 1, min: 1, max: 5 },
  reward: { type: Number, default: 10 },
  dateCreated: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

const userChallengeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  challengeId: { type: String, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  attemptsCount: { type: Number, default: 0 },
  creditsEarned: { type: Number, default: 0 },
  userAnswer: { type: String },
  date: { type: Date, default: Date.now }
});

export const Challenge = mongoose.model("Challenge", challengeSchema);
export const UserChallenge = mongoose.model("UserChallenge", userChallengeSchema);
