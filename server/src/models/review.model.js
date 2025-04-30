import mongoose from "mongoose"

// Review.js
const reviewSchema = new mongoose.Schema({
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: Number,
    comment: String,
    createdAt: { type: Date, default: Date.now }
});


export const Review=mongoose.model("Review",reviewSchema)