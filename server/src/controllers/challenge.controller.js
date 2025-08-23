import { User } from "../models/user.model.js";
import mongoose from "mongoose";

// Challenge templates
const challengeTemplates = [
  {
    id: 'code_name',
    type: 'code',
    title: 'Code Your Name',
    description: 'Write a simple JavaScript function that returns your first name',
    instruction: 'Complete: function getMyName() { return "____"; }',
    placeholder: 'function getMyName() { return "Your Name"; }',
    credits: 50,
    validateAnswer: (answer, userName) => {
      const userAnswer = answer.toLowerCase();
      return userAnswer.includes('return') && userAnswer.includes('"') && userAnswer.length > 10;
    }
  },
  {
    id: 'hindi_pet',
    type: 'language',
    title: 'Pet Name in Hindi',
    description: 'Write your pet\'s name (or favorite animal) in Hindi (Devanagari script)',
    instruction: 'Example: Dog = कुत्ता, Cat = बिल्ली',
    placeholder: 'कुत्ता',
    credits: 40,
    validateAnswer: (answer) => {
      const hindiRegex = /[\u0900-\u097F]/;
      return hindiRegex.test(answer) && answer.length > 0;
    }
  },
  {
    id: 'math_puzzle',
    type: 'math',
    title: 'Quick Math Challenge',
    description: 'Solve this equation',
    instruction: 'What is 15 × 7 + 23 - 8?',
    placeholder: 'Enter your answer',
    credits: 30,
    validateAnswer: (answer) => parseInt(answer) === 120
  },
  {
    id: 'pattern_game',
    type: 'pattern',
    title: 'Pattern Master',
    description: 'Complete the sequence',
    instruction: 'Find the next number: 2, 4, 8, 16, 32, ?',
    placeholder: 'Next number',
    credits: 35,
    validateAnswer: (answer) => parseInt(answer) === 64
  },
  {
    id: 'word_reverse',
    type: 'word',
    title: 'Word Wizard',
    description: 'Reverse the word "SKILLSWAP"',
    instruction: 'Write SKILLSWAP backwards',
    placeholder: 'PAWSLLIKS',
    credits: 25,
    validateAnswer: (answer) => answer.toUpperCase() === 'PAWSLLIKS'
  },
  {
    id: 'creativity_challenge',
    type: 'creative',
    title: 'Creative Expression',
    description: 'Write a haiku about learning',
    instruction: '3 lines: 5-7-5 syllables about education or skills',
    placeholder: 'Learning is fun\nKnowledge grows every single day\nWisdom never ends',
    credits: 60,
    validateAnswer: (answer) => {
      const lines = answer.split('\n').filter(line => line.trim());
      return lines.length >= 3 && answer.length > 20;
    }
  },
  {
    id: 'emoji_story',
    type: 'emoji',
    title: 'Emoji Storyteller',
    description: 'Tell a story about learning using only emojis',
    instruction: 'Use at least 8 emojis to create a learning story',
    placeholder: '📚➡️🧠➡️💡➡️🎓➡️😊',
    credits: 45,
    validateAnswer: (answer) => {
      const emojiCount = (answer.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || []).length;
      return emojiCount >= 8;
    }
  }
];

// Get today's challenge for a specific user
export const getTodaysChallenge = async (req, res) => {
  try {
    const { clerkId } = req.query;
    
    if (!clerkId) {
      return res.status(400).json({ message: "ClerkId is required" });
    }

    // Find user by Clerk ID
    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get today's challenge based on date
    const today = new Date().toDateString();
    const seed = today.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const index = Math.abs(seed) % challengeTemplates.length;
    const todaysChallenge = challengeTemplates[index];

    // Check if user completed today's challenge
    const challengeKey = `challenge_${todaysChallenge.id}_${today}`;
    const isCompleted = user.challenges && user.challenges.has(challengeKey);

    // Get user's answer if completed
    const userAnswer = isCompleted ? user.challenges.get(challengeKey)?.answer : null;

    res.json({
      success: true,
      challenge: todaysChallenge,
      isCompleted,
      userAnswer,
      creditsEarned: isCompleted ? todaysChallenge.credits : 0
    });

  } catch (error) {
    console.error('Error getting challenge:', error);
    res.status(500).json({ message: "Server error" });
  }
};

// Complete challenge and award credits
export const completeChallenge = async (req, res) => {
  try {
    const { clerkId, challengeId, answer } = req.body;
    
    console.log('🎯 CHALLENGE COMPLETION START');
    console.log('📨 Request body:', { clerkId, challengeId, answer: answer?.substring(0, 50) + '...' });

    if (!clerkId || !challengeId || !answer) {
      return res.status(400).json({ 
        success: false,
        message: "ClerkId, challengeId, and answer are required" 
      });
    }

    // Find user by Clerk ID
    const user = await User.findOne({ clerkId });
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    console.log('👤 User found:', user.name);
    console.log('💰 Current credits:', user.totalCredits);

    // Find the challenge template
    const challenge = challengeTemplates.find(c => c.id === challengeId);
    if (!challenge) {
      return res.status(404).json({ 
        success: false,
        message: "Challenge not found" 
      });
    }

    console.log('🎮 Challenge found:', challenge.title);

    // Check if already completed today
    const today = new Date().toDateString();
    const challengeKey = `challenge_${challengeId}_${today}`;
    
    // Initialize challenges Map if it doesn't exist
    if (!user.challenges) {
      user.challenges = new Map();
    }

    if (user.challenges.has(challengeKey)) {
      console.log('⚠️ Challenge already completed today');
      return res.json({
        success: false,
        message: "You have already completed today's challenge!"
      });
    }

    // Validate answer
    const isCorrect = challenge.validateAnswer(answer, user.name);
    console.log('✅ Answer validation:', isCorrect);

    if (!isCorrect) {
      console.log('❌ Incorrect answer provided');
      return res.json({
        success: false,
        message: "Incorrect answer. Try again!"
      });
    }

    // Award credits - using your existing credit system logic
    const oldTotal = user.totalCredits;
    const oldEarned = user.creditEarned || 0;

    user.totalCredits = (user.totalCredits || 0) + challenge.credits;
    user.creditEarned = (user.creditEarned || 0) + challenge.credits;

    // Mark challenge as completed
    user.challenges.set(challengeKey, {
      challengeId,
      answer,
      creditsEarned: challenge.credits,
      completedAt: new Date(),
      challengeTitle: challenge.title
    });

    // Add notification (following your existing pattern)
    user.notifications.push({
      message: `🎉 Challenge Complete! You earned ${challenge.credits} credits for "${challenge.title}"`,
      type: "credit",
      isRead: false,
      createdAt: new Date()
    });

    console.log('📈 Credit changes:', {
      creditsAwarded: challenge.credits,
      totalCredits: `${oldTotal} → ${user.totalCredits}`,
      creditEarned: `${oldEarned} → ${user.creditEarned}`
    });

    // Save user
    const savedUser = await user.save();
    console.log('💾 User saved successfully');
    console.log('🎉 Final user state:', {
      totalCredits: savedUser.totalCredits,
      creditEarned: savedUser.creditEarned
    });

    res.json({
      success: true,
      message: `Challenge completed! You earned ${challenge.credits} credits.`,
      creditsEarned: challenge.credits,
      newTotalCredits: savedUser.totalCredits,
      user: {
        totalCredits: savedUser.totalCredits,
        creditEarned: savedUser.creditEarned
      }
    });

  } catch (error) {
    console.error('💥 Challenge completion error:', error);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: error.message 
    });
  }
};

// Get user's challenge history
export const getChallengeHistory = async (req, res) => {
  try {
    const { clerkId } = req.params;
    
    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const history = [];
    const totalCreditsFromChallenges = [];

    if (user.challenges) {
      user.challenges.forEach((challengeData, key) => {
        history.push({
          key,
          ...challengeData
        });
        totalCreditsFromChallenges.push(challengeData.creditsEarned);
      });
    }

    const totalEarned = totalCreditsFromChallenges.reduce((sum, credits) => sum + credits, 0);

    res.json({
      success: true,
      history: history.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt)),
      totalCreditsFromChallenges: totalEarned,
      completedChallenges: history.length
    });

  } catch (error) {
    console.error('Error fetching challenge history:', error);
    res.status(500).json({ message: "Server error" });
  }
};
