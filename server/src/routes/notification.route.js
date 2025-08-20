import {User} from "../models/user.model.js";
import express from 'express';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

const router = express.Router();

// ✅ CRITICAL: Use ClerkExpressRequireAuth middleware
router.get('/notification', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    console.log('✅ Auth successful! User ID:', req.auth.userId);
    
    // ✅ Find user by Clerk ID (not _id)
    const user = await User.findOne({ clerkId: req.auth.userId }).select('notifications');
    
    if (!user) {
      console.log('❌ User not found with clerkId:', req.auth.userId);
      return res.status(404).json({ message: "User not found" });
    }

    console.log('✅ User found:', user.name);
    console.log('📊 Raw notifications:', user.notifications.length);

    // Sort notifications by newest first
    const sortedNotifications = user.notifications.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    console.log('📤 Sending notifications:', sortedNotifications.length);

    return res.status(200).json({ 
      notification: sortedNotifications,
      debug: {
        userId: req.auth.userId,
        notificationCount: sortedNotifications.length
      }
    });
    
  } catch (error) {
    console.error("❌ Error fetching notifications:", error);
    return res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
});

export default router;
