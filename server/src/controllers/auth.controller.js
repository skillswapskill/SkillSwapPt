import User from "../models/user.model.js";
import { getAuth } from "@clerk/clerk-sdk-node";

/**
 * Get or create user based on Clerk's authenticated user
 */
export const handleUserSync = async (req, res) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check if user already exists in your DB
    let user = await User.findOne({ clerkId: userId });

    if (!user) {
      // If not, create a new one — you may get more details via Clerk API
      user = await User.create({
        clerkId: userId,
        // console.log("Some issue with users generally clerk related")
        // Add other fields if needed, like email, name from frontend or Clerk API
      });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("User sync failed:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
