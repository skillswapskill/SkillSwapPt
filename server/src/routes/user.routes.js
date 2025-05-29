import express from "express";
import { handleClerkWebhook } from "../controllers/user.controller.js";

const router = express.Router();

// POST /api/users/webhook
router.post("/webhook", handleClerkWebhook);

export default router;
