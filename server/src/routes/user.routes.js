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
  const { clerkId, name, email,profilePic } = req.body;
  try {
    let user = await User.findOne({ clerkId });
    if (!user) {
      // create profile
      user = await User.create({
        clerkId, name, email,
        totalCredits: 300,
        isSetupDone: false,
        profilePic: req.body.profilePic || ""
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
router.get("/all",async(req,res)=>{
  try {
    
    const users = await User.find({}, "name profilePic skills");
    res.status(200).json({users})
  } catch (err) {
    console.error("Error fetching all users", err);
    res.status(500).json({ message: "Internal server error" });
  }
})

router.get("/setup-complete",async(req,res)=>{
  const {clerkId}=req.query;
  if(!clerkId) return res.status(400).json({ error: "Missing clerkId in request body" });
  try {
    const user=await User.findOne({clerkId})

    if(!user)return res.status(404).json({message:"User not found"});

    res.json({
      name:user.name,
      skills:user.skills,
      
    })


  } catch (error) {
    console.error("Failed to fetch setup data:", error);
    res.status(500).json({ message: "Server error" });
  }
})

export default router;
