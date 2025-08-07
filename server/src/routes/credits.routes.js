// routes/credit.routes.js
import express from 'express';
import { debitCreditsOnSubscription, earnCredits ,redeemCredits} from '../controllers/credit.controller.js';

const router = express.Router();

router.post('/debit', debitCreditsOnSubscription);
router.post('/earn', earnCredits);
router.post('/redeem', redeemCredits);


export default router;
