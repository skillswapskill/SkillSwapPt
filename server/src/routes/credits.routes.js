import express from "express";
import {
  debitCreditsOnSubscription,
  earnCredits,
  cancelAndRefundCredits,
  redeemCredits,
  earnPostCredits,
} from "../controllers/credit.controller.js";

const router = express.Router();

// 💳 Booking phase → hold credits
router.post("/debit", debitCreditsOnSubscription);

// ✅ Release credits to teacher
router.post("/release", earnCredits);

// ❌ Cancel session → refund to learner
router.post("/cancel", cancelAndRefundCredits);

// 💰 Redeem credits for e-Rupees
router.post("/redeem", redeemCredits);

// 🪙 Earn credits by posting
router.post("/earn-post", earnPostCredits);

export default router;
