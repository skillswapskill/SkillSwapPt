import mongoose from "mongoose"

const sessionSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  learner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  skill: String,
  scheduledAt: Date,
  duration: Number,
  creditsUsed: Number,
  subscribed: Boolean,
  unsubscribed: { type: Boolean, default: false },
  dateTime: { type: Date, required: true },
  status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' },
  type: { type: String, enum: ['Service', 'Booking'], default: 'Service' }
});


export const Session=mongoose.model("Session",sessionSchema)