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
    
    console.log("🔍 EARN CREDITS DEBUG START");
    console.log("📨 Request body:", req.body);
    
    const user = await User.findById(userId);
    console.log("👤 User found:", !!user);
    console.log("💰 User current credits:", user?.totalCredits, user?.creditEarned);
    
    if (!user) {
      console.log("❌ User not found - returning 401");
      return res.status(401).json({ message: "User not found" });
    }

    const session = await Session.findById(sessionId);
    console.log("📚 Session found:", !!session);
    console.log("📊 Session details:", {
      subscribed: session?.subscribed,
      unsubscribed: session?.unsubscribed,
      creditsUsed: session?.creditsUsed
    });
    
    if (!session) {
      console.log("❌ Session not found - returning 404");
      return res.status(404).json({ message: "Session not found" });
    }

    const conditionMet = session.subscribed && !session.unsubscribed;
    console.log("🎯 Condition check result:", conditionMet);
    
    if (conditionMet) {
      console.log("✅ Condition met - proceeding with credit update");
      
      const oldEarned = user.creditEarned;
      const oldTotal = user.totalCredits;
      
      user.creditEarned += session.creditsUsed;
      user.totalCredits += session.creditsUsed;

      console.log("📈 Credit changes:", {
        creditsToAdd: session.creditsUsed,
        creditEarned: `${oldEarned} → ${user.creditEarned}`,
        totalCredits: `${oldTotal} → ${user.totalCredits}`
      });

      const savedUser = await user.save();
      console.log("💾 User saved successfully");
      console.log("🎉 Final user state:", {
        creditEarned: savedUser.creditEarned,
        totalCredits: savedUser.totalCredits
      });
      
      return res.status(200).json({ 
        message: "Credits credited successfully", 
        user: savedUser 
      });
    } else {
      console.log("❌ CONDITION FAILED:");
      console.log("   - session.subscribed:", session.subscribed);
      console.log("   - session.unsubscribed:", session.unsubscribed);
      console.log("   - Expected: subscribed=true AND unsubscribed=false");
      
      return res.status(400).json({ 
        message: "Session is not subscribed or is unsubscribed",
        debug: {
          subscribed: session.subscribed,
          unsubscribed: session.unsubscribed
        }
      });
    }
  } catch (err) {
    console.error("💥 Credit error:", err);
    return res.status(500).json({ 
      message: "Server error",
      error: err.message 
    });
  }
};
