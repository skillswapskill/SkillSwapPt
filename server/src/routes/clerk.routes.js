import express from "express"
import axios from "axios"

const router = express.Router();

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

router.get("/user/:clerkId", async (req, res) => {
  try {
    const { clerkId } = req.params;
    const response = await axios.get(`https://api.clerk.dev/v1/users/${clerkId}`, {
      headers: {
        Authorization: `Bearer ${CLERK_SECRET_KEY}`,
      },
    });
    res.json(response.data);
  } catch (err) {
    console.error("❌ Error fetching Clerk user:", err.message);
    res.status(500).json({ error: "Failed to fetch Clerk user" });
  }
});

export default router;
