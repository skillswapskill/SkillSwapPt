import { Session } from "../models/session.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import { sendBookingConfirmationEmails } from "../services/emailService.js";

export const subscribeToSession = async (req, res) => {
  try {
    const { userId, sessionId } = req.body;

    console.log("🔍 Raw booking request:", { userId, sessionId });

    // Enhanced validation
    if (!userId || !sessionId) {
      return res.status(400).json({ 
        message: "Missing required fields",
        details: "Both userId and sessionId are required"
      });
    }

    // **NEW: Handle Clerk temporary IDs and find user by clerkId if needed**
    let actualUserId = userId;
    let learner = null;

    // Check if this is a temporary ID or clerkId
    if (userId === "temp_id" || userId.includes("temp") || userId.startsWith("user_")) {
      console.log("🔍 Detected Clerk ID or temp ID:", userId);
      
      // Try to find user by clerkId
      try {
        learner = await User.findOne({ clerkId: userId });
        if (learner) {
          actualUserId = learner._id.toString();
          console.log("✅ Found user by clerkId:", actualUserId);
        } else {
          return res.status(404).json({ 
            message: "User not found",
            details: "Please complete your registration or try logging out and logging back in",
            suggestion: "Your account setup may still be in progress",
            clerkId: userId
          });
        }
      } catch (clerkError) {
        console.error("Error finding user by clerkId:", clerkError);
        return res.status(404).json({ 
          message: "User lookup failed",
          details: "Could not find user account. Please try logging out and logging back in."
        });
      }
    }

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(actualUserId)) {
      console.error("❌ Invalid userId format:", actualUserId);
      return res.status(400).json({ 
        message: "Invalid userId format",
        details: "User ID must be a valid MongoDB ObjectId",
        received: actualUserId,
        suggestion: "Please try logging out and logging back in"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ 
        message: "Invalid sessionId format",
        details: "Session ID must be a valid MongoDB ObjectId",
        received: sessionId
      });
    }

    // Convert to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(actualUserId);
    const sessionObjectId = new mongoose.Types.ObjectId(sessionId);

    console.log("✅ Valid ObjectIds:", { userObjectId, sessionObjectId });

    // Find user if not already found
    if (!learner) {
      let retryCount = 0;
      const maxRetries = 3;

      while (!learner && retryCount < maxRetries) {
        try {
          learner = await User.findById(userObjectId);
          if (!learner) {
            console.log(`⏳ User not found on attempt ${retryCount + 1}, retrying...`);
            retryCount++;
            if (retryCount < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
        } catch (error) {
          console.error(`❌ Database error on attempt ${retryCount + 1}:`, error);
          retryCount++;
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }
    }

    if (!learner) {
      console.error("❌ User not found:", userObjectId);
      return res.status(404).json({ 
        message: "User not found",
        details: "Your user account was not found in our database",
        suggestion: "Please try logging out and logging back in to refresh your session",
        searchedId: userObjectId
      });
    }

    console.log("✅ User found:", learner.name, learner.email);

    // Find session
    const session = await Session.findById(sessionObjectId).populate('teacher');
    if (!session) {
      return res.status(404).json({ 
        message: "Session not found",
        details: "The specified session does not exist or has been removed"
      });
    }

    // Check if already booked
    if (session.learner && session.learner.toString() === actualUserId) {
      return res.status(200).json({ 
        message: "Already booked",
        details: "You have already booked this session",
        sessionDetails: {
          name: session.name,
          teacher: session.teacher?.name,
          dateTime: session.dateTime,
          status: "confirmed"
        }
      });
    }

    // Check if session is taken
    if (session.learner && session.learner.toString() !== actualUserId) {
      return res.status(400).json({ 
        message: "Session unavailable",
        details: "This session has already been booked by another user"
      });
    }

    // Check if trying to book own session
    if (session.teacher._id.toString() === actualUserId) {
      return res.status(400).json({ 
        message: "Cannot book own session",
        details: "You cannot book a session that you are teaching"
      });
    }

    console.log("✅ All validations passed, booking session...");

    // Book the session
    session.learner = userObjectId;
    session.subscribed = true;
    session.type = "Booking";
    
    const savedSession = await session.save();
    console.log("💾 Session booked successfully:", savedSession._id);

    // Send confirmation emails (non-blocking)
    try {
      const getFormattedDateTime = (session) => {
        let sessionDate = 'Date not set';
        let sessionTime = 'Time not set';
        let sessionDateTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
        
        if (session.dateTime) {
          let dateValue;
          
          if (session.dateTime.$date && session.dateTime.$date.$numberLong) {
            dateValue = new Date(Number(session.dateTime.$date.$numberLong));
          } else {
            dateValue = new Date(session.dateTime);
          }
          
          if (!isNaN(dateValue)) {
            sessionDate = dateValue.toLocaleDateString('en-US', { 
              day: '2-digit', month: 'short', year: 'numeric' 
            });
            sessionTime = dateValue.toLocaleTimeString('en-US', { 
              hour: '2-digit', minute: '2-digit', hour12: true 
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
        sessionTitle: session.name || 'Your Booked Session 🪙',
        sessionDate, sessionTime, sessionDateTime
      };

      await sendBookingConfirmationEmails(emailData);
      console.log('✅ Confirmation emails sent');
    } catch (emailError) {
      console.error('❌ Email error (non-blocking):', emailError);
    }

    // Success response
    res.status(200).json({ 
      success: true,
      message: "Session booked successfully",
      sessionDetails: {
        id: session._id,
        name: session.name,
        teacher: session.teacher.name,
        dateTime: session.dateTime,
        learnerName: learner.name,
        status: "confirmed"
      }
    });

  } catch (error) {
    console.error("❌ Booking error:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "Invalid ID format",
        details: "The provided user or session ID is not valid"
      });
    }

    res.status(500).json({ 
      message: "Server error",
      details: "An unexpected error occurred while processing your booking"
    });
  }
};

export const getSubscribedSessions = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("API called with userId:", userId);

    if (!userId) {
      return res.status(400).json({ 
        message: "Missing userId"
      });
    }

    let actualUserId = userId;
    let objId;

    // Handle Clerk IDs
    if (userId.startsWith("user_") || userId === "temp_id") {
      const user = await User.findOne({ clerkId: userId });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      actualUserId = user._id.toString();
    }

    if (!mongoose.Types.ObjectId.isValid(actualUserId)) {
      return res.status(400).json({ 
        message: "Invalid userId format"
      });
    }

    objId = new mongoose.Types.ObjectId(actualUserId);

    const sessions = await Session.find({ learner: objId })
      .populate("teacher", "name email")
      .sort({ dateTime: 1 });

    console.log(`Found ${sessions.length} sessions for learner ${userId}`);
    
    res.status(200).json({
      success: true,
      count: sessions.length,
      sessions: sessions
    });

  } catch (error) {
    console.error("Error fetching subscribed sessions:", error);
    res.status(500).json({ 
      message: "Server error", 
      details: error.message 
    });
  }
};

export const getTeachingSessions = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ 
        message: "Missing userId"
      });
    }

    let actualUserId = userId;

    // Handle Clerk IDs
    if (userId.startsWith("user_") || userId === "temp_id") {
      const user = await User.findOne({ clerkId: userId });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      actualUserId = user._id.toString();
    }

    if (!mongoose.Types.ObjectId.isValid(actualUserId)) {
      return res.status(400).json({ 
        message: "Invalid userId format"
      });
    }

    const objId = new mongoose.Types.ObjectId(actualUserId);

    const sessions = await Session.find({ 
      teacher: objId, 
      learner: { $exists: true, $ne: null } 
    })
      .populate("learner", "name email")
      .sort({ dateTime: -1 });

    res.status(200).json({
      success: true,
      count: sessions.length,
      sessions: sessions
    });

  } catch (error) {
    console.error("Error fetching teaching sessions:", error);
    res.status(500).json({ 
      message: "Server error", 
      details: error.message 
    });
  }
};
