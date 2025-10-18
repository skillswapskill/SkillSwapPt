import express from "express";
import Session from "../models/session.model.js"; // ✅ FIXED: Use default import
import {
  subscribeToSession,
  getSubscribedSessions,
  getTeachingSessions,
  cancelSessionAndRefund,
  releaseSessionCredits,
  startMeeting,
  endMeeting
} from "../controllers/session.controller.js";

const router = express.Router();

// ✅ Health check
router.get("/ping", (req, res) => res.json({ status: "alive" }));

// ✅ Meeting lifecycle routes (NEW)
router.post("/start-meeting", startMeeting);
router.post("/end-meeting", endMeeting); // This auto-releases credits

// ✅ Booking + credit routes (keep clean and consistent)
router.post("/subscribe", subscribeToSession);

// ⚠️ FIXED: Changed to use req.body instead of req.params
router.post("/cancel-and-refund", cancelSessionAndRefund);
router.post("/release-credits", releaseSessionCredits);

// ✅ Offer service (create session)
router.post("/offer", async (req, res) => {
  const { teacher, skill, creditsUsed, dateTime } = req.body;

  if (!teacher || !skill || !creditsUsed || !dateTime) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const session = await Session.create({
      teacher,
      skill,
      creditsUsed,
      dateTime,
      type: "Service",
      subscribed: false,
      status: "Scheduled" // ✅ FIXED: Added proper status
    });
    res.status(201).json({ message: "Service added successfully", session });
  } catch (error) {
    console.error("Failed to offer session:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Get all services offered by teacher
router.get("/offered/:teacherId", async (req, res) => {
  const { teacherId } = req.params;
  try {
    const sessions = await Session.find({ teacher: teacherId });
    res.status(200).json(sessions);
  } catch (error) {
    console.error("Failed to fetch offered sessions:", error);
    res.status(500).json({ message: "Failed to fetch offered sessions" });
  }
});

// ✅ My services (formatted)
router.get("/my-services/:teacherId", async (req, res) => {
  const { teacherId } = req.params;
  try {
    const sessions = await Session.find({ teacher: teacherId });
    const formatted = sessions.map((s) => ({
      name: s.skill,
      credits: s.creditsUsed,
    }));
    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Delete a session
router.delete("/delete/:sessionId", async (req, res) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    return res.status(400).json({ message: "Session ID is required" });
  }

  try {
    const session = await Session.findByIdAndDelete(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    res.status(200).json({ message: "Session deleted successfully" });
  } catch (error) {
    console.error("Error deleting session:", error);
    res.status(500).json({ message: "Failed to delete session" });
  }
});

// ✅ Subscribed sessions (handles Clerk + Mongo IDs)
router.get("/subscribed/:userId", getSubscribedSessions);

// ✅ Teaching sessions
router.get("/teaching/:userId", getTeachingSessions);

// ✅ Get single session by ID (NEW - needed for JoinRoom)
router.get("/session/:sessionId", async (req, res) => {
  const { sessionId } = req.params;
  try {
    const session = await Session.findById(sessionId).populate('teacher', 'name email');
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    res.status(200).json(session);
  } catch (error) {
    console.error("Error fetching session:", error);
    res.status(500).json({ message: "Failed to fetch session" });
  }
});

// ⚠️ KEEP THIS LAST: catch-all for fetching teacher's sessions
router.get("/:teacherId", async (req, res) => {
  const { teacherId } = req.params;
  try {
    const sessions = await Session.find({ teacher: teacherId });
    res.status(200).json(sessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ message: "Failed to fetch sessions" });
  }
});

// GET SESSION BY ID (for JoinRoom component)
router.get("/session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params
    
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ message: "Invalid session ID format" })
    }
    
    const session = await Session.findById(sessionId)
      .populate('teacher', 'name email clerkId _id')
      .populate('learner', 'name email clerkId _id')
    
    if (!session) {
      return res.status(404).json({ message: "Session not found" })
    }
    
    console.log("📋 Session found for meeting:", {
      id: session._id,
      skill: session.skill,
      status: session.status,
      bufferHeld: session.bufferHeld
    })
    
    res.status(200).json(session)
  } catch (error) {
    console.error("Error fetching session for meeting:", error)
    res.status(500).json({ message: "Failed to fetch session", error: error.message })
  }
})


export default router;
