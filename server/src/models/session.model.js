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
  status: { 
    type: String, 
    enum: ['Scheduled', 'Completed', 'Cancelled', 'Ongoing'], // Added 'Ongoing' for active meetings
    default: 'Scheduled' 
  },
  type: { type: String, enum: ['Service', 'Booking'], default: 'Service' },
  bufferHeld: {
    type: Number,
    default: 0
  },
  isReleased: {
    type: Boolean,
    default: false
  },
  meetingStarted: { type: Boolean, default: false }, // Track if meeting actually started
  meetingEnded: { type: Boolean, default: false }    // Track if meeting ended
});

// ✅ FIXED: Use default export
export default mongoose.model("Session", sessionSchema)
