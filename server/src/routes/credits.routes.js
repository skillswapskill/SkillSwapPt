// routes/credit.routes.js
import express from 'express';
import { debitCreditsOnSubscription, earnCredits } from '../controllers/credit.controller.js';

const router = express.Router();

router.post('/debit', debitCreditsOnSubscription);
router.post('/earn', earnCredits);

export default router;
