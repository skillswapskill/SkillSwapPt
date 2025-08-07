import {Session} from "../models/session.model.js";
import {User} from "../models/user.model.js"
import mongoose from "mongoose";


export const subscribeToSession = async (req, res) => {
  try {
    const { userId, sessionId } = req.body;

    // ✅ Step 1: Validate input
    if (!userId || !sessionId) {
      return res.status(400).json({ message: "Missing userId or sessionId" });
    }

    // ✅ Step 2: Validate ObjectIds
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(sessionId)
    ) {
      return res.status(400).json({ message: "Invalid userId or sessionId" });
    }

    // ✅ Step 3: Find session
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // ✅ Step 4: Prevent duplicate subscription
    if (session.learner?.toString() === userId) {
      return res.status(400).json({ message: "Booking Confirmed" });
    }

    // ✅ Step 5: Subscribe the user
    session.learner = userId;
    session.subscribed = true;
    session.type = "Booking"; // Optional but recommended
    await session.save();

    // ✅ Step 6: Respond success
    res.status(200).json({ message: "Subscribed successfully" });
  } catch (error) {
    console.error("❌ Subscribe error:", error);
    res.status(500).json({ message: "Server error" });
  }
};






export const getSubscribedSessions = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log("API called with userId:", userId);

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid or missing userId" });
    }

    const objId = new mongoose.Types.ObjectId(userId);

    // Find sessions where learner = user’s ObjectId
    const sessions = await Session.find({ learner: objId })
      .populate("teacher", "name email") // populate teacher's name and email
      .sort({ dateTime: 1 });

    console.log(`Found ${sessions.length} sessions for learner ${userId}`);

    res.status(200).json(sessions);
  } catch (error) {
    console.error("Error fetching subscribed sessions:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// NEW: Endpoint for instructor view

export const getTeachingSessions = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid or missing userId" });
    }

    const objId = new mongoose.Types.ObjectId(userId);

    // Sessions where user is the TEACHER and session has been BOOKED (has learner)
    const sessions = await Session.find({ 
      teacher: objId, 
      learner: { $exists: true, $ne: null } 
    })
      .populate("learner", "name email") // Populate learner details
      .sort({ dateTime: -1 });

    res.status(200).json(sessions);
  } catch (error) {
    console.error("Error fetching teaching sessions:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};





