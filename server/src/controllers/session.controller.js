import Session from "../models/session.model.js"
import { User } from "../models/user.model.js"
import mongoose from "mongoose"
import { sendBookingConfirmationEmails } from "../services/emailService.js"

// BOOK SESSION with proper credit deduction and buffer system
export const subscribeToSession = async (req, res) => {
  try {
    const { userId, sessionId } = req.body
    console.log("🔍 Booking request:", { userId, sessionId })
    
    if (!userId || !sessionId) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    // Convert Clerk ID -> Mongo ObjectId
    let learner = null
    let actualUserId = userId

    if (userId.startsWith('user_') || userId.includes('temp_')) {
      learner = await User.findOne({ clerkId: userId })
      if (!learner) {
        return res.status(404).json({ 
          message: "User not found. Try re-login or setup completion." 
        })
      }
      actualUserId = learner._id.toString()
    }

    if (!mongoose.Types.ObjectId.isValid(actualUserId)) {
      return res.status(400).json({ message: "Invalid userId format" })
    }

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ message: "Invalid sessionId format" })
    }

    const userObjectId = new mongoose.Types.ObjectId(actualUserId)
    const sessionObjectId = new mongoose.Types.ObjectId(sessionId)

    if (!learner) {
      learner = await User.findById(userObjectId)
    }
    if (!learner) {
      return res.status(404).json({ message: "User not found" })
    }

    // Get session info
    const session = await Session.findById(sessionObjectId).populate('teacher')
    if (!session) {
      return res.status(404).json({ message: "Session not found" })
    }

    if (session.teacher._id.toString() === actualUserId) {
      return res.status(400).json({ message: "Cannot book your own session" })
    }

    if (session.learner && session.learner.toString() === actualUserId) {
      return res.status(200).json({ message: "Already booked" })
    }

    if (session.learner && session.learner.toString() !== actualUserId) {
      return res.status(400).json({ message: "Session already booked" })
    }

    // ✅ FIXED: Credit logic using totalCredits (available balance)
    const creditsToHold = Number(session.creditsUsed || 0)
    const userCredits = Number(learner.totalCredits || 0) // Use totalCredits for available balance
    
    console.log("💰 Credit Check:", { userCredits, creditsToHold })
    
    if (userCredits < creditsToHold) {
      return res.status(400).json({ 
        message: "Insufficient credits", 
        available: userCredits,
        required: creditsToHold 
      })
    }

    // ✅ FIXED: Properly deduct credits and hold in buffer
    learner.totalCredits = userCredits - creditsToHold  // Deduct from available balance
    learner.creditSpent += creditsToHold                // Track spent credits
    
    session.bufferHeld = creditsToHold                  // Hold in buffer
    session.learner = userObjectId
    session.subscribed = true
    session.type = "Booking"
    session.status = "Scheduled"

    // Add notification to learner
    learner.notifications.push({
      message: `You booked "${session.skill}" session. ${creditsToHold} credits deducted and held securely.`,
      type: 'debit',
      isRead: false,
      createdAt: new Date()
    })

    await learner.save()
    await session.save()
    
    console.log("✅ Session booked successfully with credits held in buffer")

    // Send Confirmation Emails (non-blocking)
    try {
      if (session.teacher && session.teacher.email) {
        const date = new Date(session.dateTime)
        const emailData = {
          learnerEmail: learner.email,
          learnerName: learner.name,
          teacherEmail: session.teacher.email,
          teacherName: session.teacher.name,
          sessionTitle: session.name || session.skill,
          sessionDate: date.toLocaleDateString('en-US'),
          sessionTime: date.toLocaleTimeString('en-US')
        }
        await sendBookingConfirmationEmails(emailData)
      }
    } catch (err) {
      console.error("Email error (non-blocking):", err)
    }

    res.status(200).json({
      success: true,
      message: "Session booked successfully",
      sessionDetails: {
        id: session._id,
        skill: session.skill,
        teacher: session.teacher.name,
        creditsDeducted: creditsToHold,
        creditsHeld: session.bufferHeld,
        remainingCredits: learner.totalCredits,
        dateTime: session.dateTime
      }
    })

  } catch (error) {
    console.error("❌ Booking error:", error)
    res.status(500).json({ 
      message: "Server error", 
      details: error.message 
    })
  }
}

// MEETING START HANDLER
export const startMeeting = async (req, res) => {
  try {
    const { sessionId } = req.body
    
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ message: "Invalid session ID" })
    }

    const session = await Session.findById(sessionId)
    if (!session) {
      return res.status(404).json({ message: "Session not found" })
    }

    session.status = "Ongoing"
    session.meetingStarted = true
    await session.save()

    console.log("🚀 Meeting started:", sessionId)

    res.status(200).json({ 
      success: true, 
      message: "Meeting started successfully" 
    })

  } catch (error) {
    console.error("Error starting meeting:", error)
    res.status(500).json({ 
      message: "Server error", 
      details: error.message 
    })
  }
}

// ✅ FIXED: MEETING END HANDLER with proper credit release
export const endMeeting = async (req, res) => {
  try {
    const { sessionId } = req.body
    
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ message: "Invalid session ID" })
    }

    const session = await Session.findById(sessionId).populate('teacher')
    if (!session) {
      return res.status(404).json({ message: "Session not found" })
    }

    // Only mark as completed if meeting actually started
    if (session.meetingStarted) {
      session.status = "Completed"
      session.meetingEnded = true
      
      // ✅ AUTO-RELEASE CREDITS TO TEACHER
      if (!session.isReleased && session.bufferHeld > 0) {
        const teacher = await User.findById(session.teacher._id)
        if (teacher) {
          const bufferAmount = Number(session.bufferHeld || 0)
          
          // ✅ FIXED: Add credits to teacher's account properly
          teacher.creditEarned = Number(teacher.creditEarned || 0) + bufferAmount
          teacher.totalCredits = Number(teacher.totalCredits || 0) + bufferAmount
          
          // Add notification to teacher
          teacher.notifications.push({
            message: `You earned ${bufferAmount} credits for completing session "${session.skill}".`,
            type: 'credit',
            isRead: false,
            createdAt: new Date()
          })

          // Clear buffer and mark as released
          session.bufferHeld = 0
          session.isReleased = true

          await teacher.save()
          console.log(`✅ Auto-released ${bufferAmount} credits to teacher ${teacher.name}`)
        }
      }
      
      await session.save()

      res.status(200).json({ 
        success: true, 
        message: "Meeting completed and credits automatically released to teacher!",
        creditsReleased: session.bufferHeld || 0
      })
    } else {
      return res.status(400).json({ 
        message: "Cannot complete meeting that never started" 
      })
    }

  } catch (error) {
    console.error("Error ending meeting:", error)
    res.status(500).json({ 
      message: "Server error", 
      details: error.message 
    })
  }
}

// CANCEL SESSION AND REFUND TO LEARNER
export const cancelSessionAndRefund = async (req, res) => {
  try {
    const { sessionId } = req.body
    
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ message: "Invalid session ID" })
    }

    const session = await Session.findById(sessionId).populate('learner')
    if (!session) {
      return res.status(404).json({ message: "Session not found" })
    }

    if (session.isReleased) {
      return res.status(400).json({ 
        message: "Credits already released, cannot refund" 
      })
    }

    const learner = await User.findById(session.learner._id)
    if (!learner) {
      return res.status(404).json({ message: "Learner not found" })
    }

    // ✅ FIXED: Refund credits properly
    const refundAmount = Number(session.bufferHeld || 0)
    learner.totalCredits = Number(learner.totalCredits || 0) + refundAmount
    learner.creditSpent -= refundAmount  // Adjust spent credits back
    
    // Add notification to learner
    learner.notifications.push({
      message: `Refunded ${refundAmount} credits for cancelled session "${session.skill}".`,
      type: 'credit',
      isRead: false,
      createdAt: new Date()
    })

    session.bufferHeld = 0
    session.status = "Cancelled"
    session.isReleased = true

    await learner.save()
    await session.save()

    console.log(`✅ Refunded ${refundAmount} credits to learner ${learner.name}`)

    res.status(200).json({
      success: true,
      message: "Session cancelled and credits refunded",
      refundAmount,
      newBalance: learner.totalCredits
    })

  } catch (err) {
    console.error("Error refunding session:", err)
    res.status(500).json({ 
      message: "Server error", 
      details: err.message 
    })
  }
}

// GET LEARNING SESSIONS
export const getSubscribedSessions = async (req, res) => {
  try {
    const { userId } = req.params
    
    if (!userId) {
      return res.status(400).json({ message: "Missing userId" })
    }

    let actualUserId = userId
    if (userId.startsWith('user_')) {
      const user = await User.findOne({ clerkId: userId })
      if (!user) {
        return res.status(404).json({ message: "User not found" })
      }
      actualUserId = user._id.toString()
    }

    if (!mongoose.Types.ObjectId.isValid(actualUserId)) {
      return res.status(400).json({ message: "Invalid userId" })
    }

    const sessions = await Session.find({ 
      learner: actualUserId 
    })
    .populate('teacher', 'name email')
    .sort({ dateTime: -1 })

    res.status(200).json(sessions.map(s => ({
      id: s._id,
      skill: s.skill,
      teacher: s.teacher,
      creditsUsed: s.creditsUsed,
      bufferHeld: s.bufferHeld || 0,
      dateTime: s.dateTime,
      status: s.status || "Scheduled"
    })))

  } catch (err) {
    console.error("Error fetching subscribed sessions:", err)
    res.status(500).json({ 
      message: "Server error", 
      details: err.message 
    })
  }
}

// GET TEACHING SESSIONS
export const getTeachingSessions = async (req, res) => {
  try {
    const { userId } = req.params
    
    if (!userId) {
      return res.status(400).json({ message: "Missing userId" })
    }

    let actualUserId = userId
    if (userId.startsWith('user_')) {
      const user = await User.findOne({ clerkId: userId })
      if (!user) {
        return res.status(404).json({ message: "User not found" })
      }
      actualUserId = user._id.toString()
    }

    const sessions = await Session.find({ 
      teacher: actualUserId, 
      learner: { $ne: null }, 
      subscribed: true 
    })
    .populate('learner', 'name email')
    .sort({ dateTime: -1 })

    res.status(200).json(sessions.map(s => ({
      id: s._id,
      skill: s.skill,
      learner: s.learner,
      creditsUsed: s.creditsUsed,
      bufferHeld: s.bufferHeld || 0,
      dateTime: s.dateTime,
      status: s.status || "Scheduled"
    })))

  } catch (err) {
    console.error("Error fetching teaching sessions:", err)
    res.status(500).json({ 
      message: "Server error", 
      details: err.message 
    })
  }
}

// MANUAL CREDIT RELEASE (backup endpoint)
export const releaseSessionCredits = async (req, res) => {
  try {
    const { sessionId } = req.body
    
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ message: "Invalid session ID" })
    }

    const session = await Session.findById(sessionId).populate('teacher')
    if (!session) {
      return res.status(404).json({ message: "Session not found" })
    }

    if (session.isReleased) {
      return res.status(400).json({ message: "Credits already released" })
    }

    if (session.status !== "Completed") {
      return res.status(400).json({ 
        message: "Can only release credits for completed sessions" 
      })
    }

    const teacher = await User.findById(session.teacher._id)
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" })
    }

    const bufferAmount = Number(session.bufferHeld || 0)
    teacher.creditEarned = Number(teacher.creditEarned || 0) + bufferAmount
    teacher.totalCredits = Number(teacher.totalCredits || 0) + bufferAmount
    
    teacher.notifications.push({
      message: `You earned ${bufferAmount} credits for teaching "${session.skill}".`,
      type: 'credit',
      isRead: false,
      createdAt: new Date()
    })

    session.bufferHeld = 0
    session.isReleased = true

    await teacher.save()
    await session.save()

    console.log(`✅ Released ${bufferAmount} credits to teacher ${teacher.name}`)

    res.status(200).json({
      success: true,
      message: "Credits released successfully",
      creditsReleased: bufferAmount,
      teacher: teacher.name
    })

  } catch (err) {
    console.error("Error releasing credits:", err)
    res.status(500).json({ 
      message: "Server error", 
      details: err.message 
    })
  }
}
