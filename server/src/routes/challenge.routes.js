import express from 'express';
import { 
  getTodaysChallenge, 
  completeChallenge, 
  getChallengeHistory 
} from '../controllers/challenge.controller.js';

const router = express.Router();

router.get('/daily', getTodaysChallenge);
router.post('/complete', completeChallenge);
router.get('/history/:clerkId', getChallengeHistory);

export default router;
