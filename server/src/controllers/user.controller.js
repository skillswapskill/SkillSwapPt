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
