import {Session} from "../models/session.model.js";
import {User} from "../models/user.model.js"
import mongoose from "mongoose";
import { sendBookingConfirmationEmails } from "../services/emailService.js"; 


export const subscribeToSession = async (req, res) => {
  try {
    const { userId, sessionId } = req.body;

    // Validation
    if (!userId || !sessionId) {
      return res.status(400).json({ message: "Missing userId or sessionId" });
    }

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(sessionId)
    ) {
      return res.status(400).json({ message: "Invalid userId or sessionId" });
    }

    // Find session and populate teacher
    const session = await Session.findById(sessionId).populate('teacher');
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Prevent duplicate subscription
    if (session.learner?.toString() === userId) {
      return res.status(400).json({ message: "Booking Confirmed" });
    }

    // Find learner details
    const learner = await User.findById(userId);
    if (!learner) {
      return res.status(404).json({ message: "User not found" });
    }

    // Subscribe the user
    session.learner = userId;
    session.subscribed = true;
    session.type = "Booking";
    await session.save();

    // ✅ NEW: Correct email data preparation
    try {
      // Extract date and time from dateTime field
      const getFormattedDateTime = (session) => {
        let sessionDate = 'Date not set';
        let sessionTime = 'Time not set';
        let sessionDateTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

        if (session.dateTime) {
          let dateValue;
          
          // Handle MongoDB date format
          if (session.dateTime.$date && session.dateTime.$date.$numberLong) {
            dateValue = new Date(Number(session.dateTime.$date.$numberLong));
          } else {
            dateValue = new Date(session.dateTime);
          }
          
          if (!isNaN(dateValue)) {
            sessionDate = dateValue.toLocaleDateString('en-US', { 
              day: '2-digit', 
              month: 'short', 
              year: 'numeric' 
            });
            sessionTime = dateValue.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit', 
              hour12: true 
            });
            sessionDateTime = dateValue;
          }
        }

        return { sessionDate, sessionTime, sessionDateTime };
      };

      const { sessionDate, sessionTime, sessionDateTime } = getFormattedDateTime(session);
      
      const emailData = {
        learnerEmail: learner.email,
        learnerName: learner.name,
        teacherEmail: session.teacher.email,
        teacherName: session.teacher.name,
        sessionTitle: session.name || 'Your Booked Session 🪙🪙', // ✅ Use session.name
        sessionDate: sessionDate, // ✅ Properly formatted date
        sessionTime: sessionTime, // ✅ Properly formatted time
        sessionDateTime: sessionDateTime // ✅ Full datetime object
      };

      console.log('📧 Sending booking confirmation emails...');
      console.log('📦 Email data:', emailData);
      
      await sendBookingConfirmationEmails(emailData);
      console.log('✅ Booking confirmation emails sent successfully');
    } catch (emailError) {
      console.error('❌ Error sending emails:', emailError);
      // Don't fail the booking if email fails
    }

    // Response
    res.status(200).json({ 
      message: "Subscribed successfully",
      emailsSent: true,
      sessionDetails: {
        name: session.name,
        teacher: session.teacher.name,
        dateTime: session.dateTime
      }
    });
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





