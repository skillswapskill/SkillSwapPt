import { User } from "../models/user.model.js";
import { clerkClient } from "@clerk/clerk-sdk-node";

export const handleClerkWebhook = async (req, res) => {
  try {
    const { id, email_addresses, first_name, last_name } = req.body.data;

    const email = email_addresses?.[0]?.email_address || "";

    const existingUser = await User.findOne({ clerkId: id });

    if (existingUser) {
      return res.status(200).json({ message: "User already exists" });
    }

    const newUser = new User({
      name: `${first_name} ${last_name}`,
      email,
      clerkId: id,
      password: "external-auth", // Dummy value since password isn't stored via Clerk
    });
    
    await newUser.save();

    // Add this section:
    await clerkClient.users.updateUserMetadata(id, {
      publicMetadata: { mongoId: newUser._id.toString() }
    });
    
    res.status(201).json({ message: "User created", user: newUser });
  } catch (error) {
    console.error("Webhook Error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

export const syncUserMetadata = async (req, res) => {
  try {
    const { clerkId } = req.body;
    
    if (!clerkId) {
      return res.status(400).json({ message: "clerkId required" });
    }

    // Find user in MongoDB by clerkId
    const mongoUser = await User.findOne({ clerkId });
    
    if (!mongoUser) {
      return res.status(404).json({ message: "User not found in MongoDB" });
    }

    // Update Clerk user metadata
    await clerkClient.users.updateUserMetadata(clerkId, {
      publicMetadata: { mongoId: mongoUser._id.toString() }
    });

    res.json({ 
      success: true, 
      mongoId: mongoUser._id.toString(),
      message: "User metadata synced successfully" 
    });
  } catch (error) {
    console.error("Sync error:", error);
    res.status(500).json({ error: "Sync failed", details: error.message });
  }
};

// ✅ ADD THIS NEW FUNCTION - This is what the frontend is calling
export const syncUser = async (req, res) => {
  try {
    const { clerkId, name, email } = req.body;

    console.log("Sync request for:", clerkId);

    // Find user by clerkId
    let user = await User.findOne({ clerkId });
    
    if (!user) {
      // Create new user if doesn't exist
      user = new User({
        clerkId,
        name,
        email,
        creditEarned: 0,
        creditSpent: 0,
        totalCredits: 0,
        eRupees: 0,
        skillCoins: 0
      });
      await user.save();
      console.log("Created new user");
    } else {
      // Update existing user info
      user.name = name;
      user.email = email;
      await user.save();
      console.log("Updated existing user");
    }

    // Ensure all fields are properly set
    const responseUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      clerkId: user.clerkId,
      totalCredits: user.totalCredits || 0,
      creditEarned: user.creditEarned || 0,
      creditSpent: user.creditSpent || 0,
      eRupees: user.eRupees || 0,
      skillCoins: user.skillCoins || 0
    };

    console.log("Returning user data:", responseUser);

    return res.status(200).json(responseUser);
    
  } catch (error) {
    console.error("User sync error:", error);
    return res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};
