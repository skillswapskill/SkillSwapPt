import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { User } from "../models/user.model.js";
import dotenv from "dotenv";
import { syncUserMetadata } from "../controllers/user.controller.js";

dotenv.config();

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage (not saving to disk)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Upload profile picture endpoint
router.post("/upload-profile-pic", upload.single("profilePic"), async (req, res) => {
  try {
    const { clerkId } = req.body;
    
    if (!req.file || !clerkId) {
      return res.status(400).json({ error: "Missing file or clerkId" });
    }

    // Convert buffer to base64 string for Cloudinary
    const base64String = req.file.buffer.toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${base64String}`;

    // Upload to Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload(dataURI, {
      folder: 'profile_pictures', // Organize uploads in a folder
      public_id: `profile_${clerkId}_${Date.now()}`, // Unique filename
      overwrite: true,
      resource_type: 'image',
      transformation: [
        { width: 300, height: 300, crop: 'fill' }, // Resize to 300x300
        { quality: 'auto' }, // Auto optimize quality
      ]
    });

    // Get the secure URL from Cloudinary
    const profilePicUrl = cloudinaryResponse.secure_url;

    // Update user in database
    const updatedUser = await User.findOneAndUpdate(
      { clerkId },
      { $set: { profilePic: profilePicUrl } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ 
      profilePic: profilePicUrl,
      message: "Profile picture updated successfully" 
    });

  } catch (error) {
    console.error("Upload failed:", error);
    res.status(500).json({ error: "Upload failed: " + error.message });
  }
});

// ✅ FIXED: Sync user endpoint - now includes eRupees field
router.post("/sync", async (req, res) => {
  const { clerkId, name, email, profilePic } = req.body;
  
  console.log("🔍 Sync request for clerkId:", clerkId);
  
  if (!clerkId) {
    return res.status(400).json({ message: "Clerk ID required" });
  }
  
  try {
    let user = await User.findOne({ clerkId });
    
    if (!user) {
      console.log("👤 Creating new user");
      user = await User.create({
        clerkId, 
        name, 
        email,
        totalCredits: 300,
        isSetupDone: false,
        profilePic: profilePic || "",
        skillCoins: 0,
        eRupees: 0, // ✅ Initialize eRupees for new users
        creditEarned: 0,
        creditSpent: 0
      });
    } else {
      console.log("👤 Found existing user");
      // Update user info but don't overwrite existing data
      user.name = name || user.name;
      user.email = email || user.email;
      await user.save();
    }

    // ✅ IMPORTANT: Include eRupees in the response
    const responseData = {
      _id: user._id,
      totalCredits: user.totalCredits || 0,
      creditEarned: user.creditEarned || 0,
      creditSpent: user.creditSpent || 0,
      isSetupDone: user.isSetupDone || false,
      name: user.name,
      email: user.email,
      skills: user.skills || [],
      skillCoins: user.skillCoins || 0, 
      eRupees: user.eRupees || 0, // ✅ THIS WAS MISSING!
      profilePic: user.profilePic || null,
      showCongrats: !user.isSetupDone,
    };

    console.log("📦 Sending response:", responseData);
    
    res.json(responseData);
    
  } catch (err) {
    console.error("❌ Sync failed:", err);
    res.status(500).json({ error: "Sync failed: " + err.message });
  }
});

// Setup complete endpoint (existing code)
router.post("/setup-complete", async (req, res) => {
  const { clerkId, name, skills, profilePic } = req.body;

  try {
    await User.updateOne(
      { clerkId },
      {
        $set: {
          name,
          skills,
          profilePic,
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

// Other existing routes...
router.put("/update", async (req, res) => {
  const { clerkId, name, skills, profilePic } = req.body;

  try {
    const updatedUser = await User.findOneAndUpdate(
      { clerkId },
      {
        $set: {
          name,
          skills,
          profilePic,
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

router.get("/all", async (req, res) => {
  try {
    // Include clerkId in the query so we can filter properly
    const users = await User.find({}, "name profilePic skills clerkId _id email");
    res.status(200).json({ users });
  } catch (err) {
    console.error("Error fetching all users", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Add this route
router.post("/sync-metadata", syncUserMetadata);

// Add this route to get current user's MongoDB data
router.get("/current/:clerkId", async (req, res) => {
  try {
    const { clerkId } = req.params;
    const user = await User.findOne({ clerkId }, "name profilePic skills _id totalCredits eRupees");
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching current user", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Add this route to get user by MongoDB _id
router.get("/:mongoId", async (req, res) => {
  try {
    const { mongoId } = req.params;
    const user = await User.findById(mongoId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user by MongoDB ID", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/rate-instructor", async (req, res) => {
  const { instructorId, rating, userId, sessionId } = req.body;
  try {
    const instructor = await User.findById(instructorId);
    if (!instructor) return res.status(404).json({ error: "Instructor not found" });

    // Save to ratings array (prevents duplicate ratings per session)
    const ratedBefore = instructor.ratings?.some(r => r.sessionId === sessionId && r.userId === userId);
    if (!ratedBefore) {
      instructor.ratings.push({ sessionId, userId, rating });
      instructor.ratingsCount = (instructor.ratingsCount || 0) + 1;
      instructor.averageRating = (instructor.averageRating * (instructor.ratingsCount - 1) + rating) / instructor.ratingsCount;
      await instructor.save();
    }
    res.status(200).json({ message: "Rating submitted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to submit rating" });
  }
});

export default router;
