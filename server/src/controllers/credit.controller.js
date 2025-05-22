import { User } from "../models/user.model.js";
import { Session } from "../models/session.model.js";

// Debit credits when a user subscribes to a session
export const debitCreditsOnSubscription = async (req, res) => {
  try {
    const { userId, sessionId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.subscribed && !session.unsubscribed) {
      if (user.totalCredits < session.creditsUsed) {
        return res.status(400).json({ message: "Insufficient credits" });
      }

      user.creditSpent += session.creditsUsed;
      user.totalCredits -= session.creditsUsed;

      await user.save();
      return res.status(200).json({ message: "Credits debited successfully", user });
    } else {
      return res.status(400).json({ message: "Session is not subscribed or is unsubscribed" });
    }
  } catch (err) {
    console.error("Debit error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Credit the teacher when a session is completed
export const earnCredits = async (req, res) => {
  try {
    const { userId, sessionId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.subscribed && !session.unsubscribed) {
      // Teacher earns credits
      user.creditEarned += session.creditsUsed;
      user.totalCredits += session.creditsUsed;

      await user.save();
      return res.status(200).json({ message: "Credits credited successfully", user });
    } else {
      return res.status(400).json({ message: "Session is not subscribed or is unsubscribed" });
    }
  } catch (err) {
    console.error("Credit error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
