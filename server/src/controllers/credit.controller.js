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

      user.notifications.push({
        message: `You have been debited ${session.creditsUsed} credits for subscribing to the session "${session.name}".`,
        type: "debit",
        isRead: false,
        createdAt: new Date()
      });

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

    const conditionMet = session.subscribed && !session.unsubscribed;
    
    if (conditionMet) {
      user.creditEarned += session.creditsUsed;
      user.totalCredits += session.creditsUsed;

      user.notifications.push({
        message: `You have earned ${session.creditsUsed} credits `,
        type: "credit",
        isRead: false,
        createdAt: new Date()
      });

      const savedUser = await user.save();
      
      return res.status(200).json({ 
        message: "Credits credited successfully", 
        user: savedUser 
      });
    } else {
      return res.status(400).json({ 
        message: "Session is not subscribed or is unsubscribed",
        debug: {
          subscribed: session.subscribed,
          unsubscribed: session.unsubscribed
        }
      });
    }
  } catch (err) {
    console.error("Credit error:", err);
    return res.status(500).json({ 
      message: "Server error",
      error: err.message 
    });
  }
};

// ✅ FIXED: Redeem Credits for E Rupees
export const redeemCredits = async (req, res) => {
  try {
    // ✅ Updated to accept eRupeesToReceive instead of skillCoinsToReceive
    const { userId, creditsToRedeem, eRupeesToReceive } = req.body;

    console.log("Redeem request:", { userId, creditsToRedeem, eRupeesToReceive });

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.totalCredits < creditsToRedeem) {
      return res.status(400).json({ message: "Insufficient credits" });
    }

    // ✅ Deduct credits and add E Rupees
    user.totalCredits -= creditsToRedeem;
    
    // ✅ Handle both old skillCoins field and new eRupees field for backward compatibility
    if (!user.eRupees && user.skillCoins) {
      // Migration: Convert existing skillCoins to eRupees
      user.eRupees = (user.skillCoins * 2000) || 0; // Convert old skillCoins to eRupees (1 skillCoin = 2000 eRupees)
    }
    
    user.eRupees = (user.eRupees || 0) + eRupeesToReceive;
    user.creditSpent += creditsToRedeem;

    // ✅ Updated notification message for E Rupees
    user.notifications.push({
      message: `You have redeemed ${creditsToRedeem} credits for ₹${eRupeesToReceive} E Rupees.`,
      type: "credit",
      isRead: false,
      createdAt: new Date()
    });

    const savedUser = await user.save();
    
    console.log("Redemption successful:", {
      remainingCredits: savedUser.totalCredits,
      totalERupees: savedUser.eRupees
    });

    return res.status(200).json({ 
      message: "Credits redeemed successfully", 
      user: savedUser,
      redeemed: {
        credits: creditsToRedeem,
        eRupees: eRupeesToReceive
      }
    });

  } catch (err) {
    console.error("Redeem error:", err);
    return res.status(500).json({ 
      message: "Server error",
      error: err.message,
      stack: err.stack
    });
  }
};

// Add this to your credit.controller.js
export const earnPostCredits = async (req, res) => {
  try {
    const { userId, creditsEarned = 1 } = req.body;
    
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    // Award credits for posting
    user.creditEarned += creditsEarned;
    user.totalCredits += creditsEarned;
    user.notifications.push({
      message: `You have earned ${creditsEarned} credit${creditsEarned > 1 ? 's' : ''} for sharing a post in the community!`,
      type: "credit",
      isRead: false,
      createdAt: new Date()
    });
    
    await user.save();
    
    return res.status(200).json({ 
      success: true,
      message: "Credits awarded successfully", 
      user,
      creditsEarned
    });
  } catch (err) {
    console.error("Post credit error:", err);
    return res.status(500).json({ 
      message: "Server error",
      error: err.message 
    });
  }
};
