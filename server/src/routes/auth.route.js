import express from "express";
import { handleUserSync } from "../controllers/auth.controller.js";
import { ClerkExpressWithAuth } from "@clerk/clerk-sdk-node";

const router = express.Router();

// Protected route
router.get("/me", ClerkExpressWithAuth(), handleUserSync);

export default router;
