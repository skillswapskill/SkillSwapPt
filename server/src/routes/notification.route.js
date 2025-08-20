import User from "../models/user.model.js";
import express from 'express';

const router = express.Router();

router.get('/notification', async (req, res) => {
  try {
    // Make sure you have auth middleware that sets req.user
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(req.user._id).select('notifications');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Sort notifications by newest first
    const sortedNotifications = user.notifications.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );


    return res.status(200).json({ notification: sortedNotifications  });
    
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router; // ✅ Don't forget this!
