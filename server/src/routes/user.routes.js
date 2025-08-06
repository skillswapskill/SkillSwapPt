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

// Sync user endpoint (existing code)
router.post("/sync", async (req, res) => {
  const { clerkId, name, email, profilePic } = req.body;
  if (!clerkId) {
    return res.status(400).json({ message: "Clerk ID required" });
  }
  try {
    let user = await User.findOne({ clerkId });
    if (!user) {
      user = await User.create({
        clerkId, name, email,
        totalCredits: 300,
        isSetupDone: false,
        profilePic: req.body.profilePic || ""
      });
    }
    res.json({
      _id: user._id,
      totalCredits: user.totalCredits,
      isSetupDone: user.isSetupDone,
      name: user.name,
      skills: user.skills || [],
      profilePic: user.profilePic || null,
      showCongrats: !user.isSetupDone,
    });
  } catch (err) {
    res.status(500).json({ error: "Sync failed" });
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
    const user = await User.findOne({ clerkId }, "name profilePic skills _id");
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching current user", err);
    res.status(500).json({ message: "Internal server error" });
  }
});



export default router;
