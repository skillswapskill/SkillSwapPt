// routes/credit.routes.js
import express from 'express';
import { debitCreditsOnSubscription, earnCredits ,redeemCredits,earnPostCredits} from '../controllers/credit.controller.js';

const router = express.Router();

router.post('/debit', debitCreditsOnSubscription);
router.post('/earn', earnCredits);
router.post('/redeem', redeemCredits);
router.post('/earn-post', earnPostCredits);


export default router;
