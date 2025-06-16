// =========================
// UPDATED user.routes.js
// =========================

import express from "express";
import { handleClerkWebhook } from "../controllers/user.controller.js";
import { User } from "../models/user.model.js";

const router = express.Router();

// Clerk webhook endpoint
router.post("/webhook", handleClerkWebhook);

// in user.routes.js
router.post("/sync", async (req, res) => {
  const { clerkId, name, email } = req.body;
  try {
    let user = await User.findOne({ clerkId });
    if (!user) {
      // create profile
      user = await User.create({
        clerkId, name, email,
        totalCredits: 300,
        isSetupDone: false,
      });
    }
    res.json({
      totalCredits: user.totalCredits,
      isSetupDone: user.isSetupDone,
      name: user.name,
      skills: user.skills || [],
      profilePic: user.profilePic || null,
      showCongrats: !user.isSetupDone, // true only first time
    });
  } catch (err) {
    res.status(500).json({ error: "Sync failed" });
  }
});

// Mark setup complete
router.post("/setup-complete", async (req, res) => {
  const { clerkId, name, skills } = req.body;

  try {
    await User.updateOne(
      { clerkId },
      {
        $set: {
          name,
          skills,
          isSetupDone: true,
        },
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Failed to update setup:", error);
    res.status(500).json({ error: "Failed to save setup" });
  }
});
router.put("/update", async (req, res) => {
  const { clerkId, name, skills, profilePic } = req.body;

  try {
    const updatedUser = await User.findOneAndUpdate(
      { clerkId },
      {
        $set: {
          name,
          skills,
          profilePic, // Optional: If you're storing base64 or a URL
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "Profile updated", user: updatedUser });
  } catch (err) {
    console.error("Failed to update profile", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
