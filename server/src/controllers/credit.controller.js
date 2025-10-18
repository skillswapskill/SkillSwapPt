import  {User}  from "../models/user.model.js";
import Session  from "../models/session.model.js";

/* 
-------------------------------------------
 🟢 DEBIT CREDITS ON SESSION SUBSCRIPTION
-------------------------------------------
  Learner books → credits deducted → stored in buffer (not transferred yet)
*/
export const debitCreditsOnSubscription = async (req, res) => {
  try {
    const { userId, sessionId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.subscribed && !session.unsubscribed) {
      const creditsToHold = session.creditsUsed;

      if (user.totalCredits < creditsToHold) {
        return res.status(400).json({ message: "Insufficient credits" });
      }

      // Deduct and hold in buffer
      user.totalCredits -= creditsToHold;
      session.bufferHeld = creditsToHold;
      session.status = "scheduled";
      await session.save();
      await user.save();

      user.notifications.push({
        message: `You booked "${session.skill}" session. ${creditsToHold} credits are temporarily held.`,
        type: "debit",
        isRead: false,
        createdAt: new Date(),
      });

      await user.save();

      return res.status(200).json({
        message: "Credits held in buffer successfully",
        bufferHeld: session.bufferHeld,
        user,
      });
    } else {
      return res.status(400).json({ message: "Invalid session state" });
    }
  } catch (err) {
    console.error("Debit error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* 
-------------------------------------------
 🟢 RELEASE CREDITS AFTER SESSION COMPLETION
-------------------------------------------
  After the meeting ends successfully, release buffer credits to teacher
*/
export const earnCredits = async (req, res) => {
  try {
    const { sessionId } = req.body;

    const session = await Session.findById(sessionId).populate("teacher");
    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.isReleased)
      return res.status(400).json({ message: "Credits already released" });

    if (session.status !== "completed" && session.status !== "ongoing")
      return res
        .status(400)
        .json({ message: "Session not yet completed" });

    const teacher = await User.findById(session.teacher._id);
    if (!teacher)
      return res.status(404).json({ message: "Teacher not found" });

    // Move from buffer → teacher
    const creditsToRelease = session.bufferHeld;
    teacher.creditEarned += creditsToRelease;
    teacher.totalCredits += creditsToRelease;

    teacher.notifications.push({
      message: `You earned ${creditsToRelease} credits for session "${session.skill}".`,
      type: "credit",
      isRead: false,
      createdAt: new Date(),
    });

    session.bufferHeld = 0;
    session.isReleased = true;
    session.status = "completed";

    await teacher.save();
    await session.save();

    res.status(200).json({
      success: true,
      message: "Credits released to teacher successfully",
      teacher,
    });
  } catch (err) {
    console.error("Credit release error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* 
-------------------------------------------
 🔴 CANCEL / REFUND SESSION
-------------------------------------------
  If teacher didn’t attend → refund buffer to learner
*/
export const cancelAndRefundCredits = async (req, res) => {
  try {
    const { sessionId } = req.body;

    const session = await Session.findById(sessionId).populate("learner");
    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.isReleased)
      return res
        .status(400)
        .json({ message: "Credits already released, cannot refund" });

    const learner = await User.findById(session.learner._id);
    if (!learner)
      return res.status(404).json({ message: "Learner not found" });

    // Refund from buffer
    learner.totalCredits += session.bufferHeld;
    learner.notifications.push({
      message: `Refunded ${session.bufferHeld} credits for cancelled session "${session.skill}".`,
      type: "credit",
      isRead: false,
      createdAt: new Date(),
    });

    session.bufferHeld = 0;
    session.status = "cancelled";

    await learner.save();
    await session.save();

    return res.status(200).json({
      success: true,
      message: "Session cancelled and credits refunded successfully",
      learner,
    });
  } catch (err) {
    console.error("Refund error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* 
-------------------------------------------
 💰 REDEEM CREDITS TO E-RUPEES
-------------------------------------------
*/
export const redeemCredits = async (req, res) => {
  try {
    const { userId, creditsToRedeem, eRupeesToReceive } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.totalCredits < creditsToRedeem)
      return res.status(400).json({ message: "Insufficient credits" });

    user.totalCredits -= creditsToRedeem;
    user.eRupees = (user.eRupees || 0) + eRupeesToReceive;
    user.creditSpent += creditsToRedeem;

    user.notifications.push({
      message: `You redeemed ${creditsToRedeem} credits for ₹${eRupeesToReceive}.`,
      type: "credit",
      isRead: false,
      createdAt: new Date(),
    });

    const savedUser = await user.save();

    return res.status(200).json({
      message: "Credits redeemed successfully",
      user: savedUser,
      redeemed: { credits: creditsToRedeem, eRupees: eRupeesToReceive },
    });
  } catch (err) {
    console.error("Redeem error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* 
-------------------------------------------
 🪙 EARN CREDITS BY POSTING
-------------------------------------------
*/
export const earnPostCredits = async (req, res) => {
  try {
    const { userId, creditsEarned = 1 } = req.body;

    const user = await User.findOne({ clerkId: userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.creditEarned += creditsEarned;
    user.totalCredits += creditsEarned;
    user.notifications.push({
      message: `You earned ${creditsEarned} credit${creditsEarned > 1 ? "s" : ""} for sharing a post.`,
      type: "credit",
      isRead: false,
      createdAt: new Date(),
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: "Credits awarded successfully",
      user,
    });
  } catch (err) {
    console.error("Post credit error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
