import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { User } from '../models/user.model.js'; // Import your User model

const router = express.Router();

// console.log('🔥 Payment route loading...');
// console.log('🔍 Environment Variables Check:');
// console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID);
// console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'SET (length: ' + process.env.RAZORPAY_KEY_SECRET.length + ')' : 'MISSING');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Test route
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Payment route working!',
    timestamp: new Date().toISOString(),
    credentials_configured: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
    user_model_loaded: !!User
  });
});

// Create Razorpay order
router.post('/order', async (req, res) => {
  // console.log('📝 Creating payment order...');
  // console.log('Request body:', req.body);
  
  try {
    const { amount } = req.body;
    
    // Validate amount
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Valid amount required" });
    }

    // Check Razorpay credentials
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('❌ Razorpay credentials missing');
      return res.status(500).json({ error: "Payment service not configured" });
    }

    // console.log('🔑 Using Key ID:', process.env.RAZORPAY_KEY_ID.substring(0, 8) + '...');

    const options = {
      amount: amount * 100, // Convert to paise
      currency: "INR",
      receipt: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      payment_capture: 1
    };

    // console.log('🔄 Creating order with options:', options);
    
    const order = await razorpay.orders.create(options);
    // console.log('✅ Order created successfully:', order.id);
    
    res.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt
    });

  } catch (error) {
    console.error('💥 Order creation failed:', error);
    
    if (error.statusCode === 401) {
      return res.status(500).json({ 
        error: "Invalid Razorpay credentials. Please check your API keys.",
        details: "Authentication failed - verify your Razorpay Key ID and Secret"
      });
    }
    
    res.status(500).json({ 
      error: "Could not create payment order",
      details: error.message
    });
  }
});

// Update credits after successful payment
router.post('/update-credits', async (req, res) => {
  try {
    const { 
      clerkId, 
      creditsToAdd, 
      paymentId, 
      razorpay_order_id,
      razorpay_signature 
    } = req.body;

    // console.log('💳 Processing credit update...');
    // console.log('Details:', { clerkId, creditsToAdd, paymentId });

    // Validate required fields
    if (!clerkId || !creditsToAdd || !paymentId) {
      return res.status(400).json({ 
        error: 'Missing required fields: clerkId, creditsToAdd, or paymentId' 
      });
    }

    // Validate creditsToAdd is a positive number
    if (isNaN(creditsToAdd) || creditsToAdd <= 0) {
      return res.status(400).json({ 
        error: 'creditsToAdd must be a positive number' 
      });
    }

    // Optional: Verify payment signature for extra security
    if (razorpay_order_id && razorpay_signature) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${paymentId}`)
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        console.error('❌ Payment signature verification failed');
        return res.status(400).json({ 
          error: 'Payment verification failed',
          verified: false 
        });
      }
      // console.log('✅ Payment signature verified');
    }

    // 🔥 ACTUAL DATABASE UPDATE using your User model
    // console.log('🔄 Updating user credits in database...');
    
    const updatedUser = await User.findOneAndUpdate(
      { clerkId: clerkId },
      { 
        $inc: { 
          creditEarned: creditsToAdd,
          totalCredits: creditsToAdd 
        }
      },
      { 
        new: true, // Return updated document
        runValidators: true // Run mongoose validations
      }
    );

    if (!updatedUser) {
      console.error('❌ User not found with clerkId:', clerkId);
      return res.status(404).json({ 
        error: 'User not found. Please contact support.',
        clerkId: clerkId
      });
    }

    // console.log('✅ CREDITS UPDATED SUCCESSFULLY IN DATABASE!');
    // console.log('User:', updatedUser.name);
    // console.log('Previous credits:', updatedUser.totalCredits - creditsToAdd);
    // console.log('Credits added:', creditsToAdd);
    // console.log('NEW TOTAL CREDITS:', updatedUser.totalCredits);
    // console.log('NEW CREDIT EARNED:', updatedUser.creditEarned);

    // Log payment transaction for audit
    // console.log('📋 Payment Transaction Log:', {
    //   userId: updatedUser._id,
    //   clerkId: updatedUser.clerkId,
    //   paymentId: paymentId,
    //   creditsAdded: creditsToAdd,
    //   newBalance: updatedUser.totalCredits,
    //   timestamp: new Date().toISOString()
    // });

    res.json({
      success: true,
      message: `Successfully added ${creditsToAdd} credits to your account!`,
      creditsAdded: creditsToAdd,
      newCreditBalance: updatedUser.totalCredits,
      creditEarned: updatedUser.creditEarned,
      creditSpent: updatedUser.creditSpent,
      paymentId: paymentId,
      verified: true,
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        totalCredits: updatedUser.totalCredits,
        creditEarned: updatedUser.creditEarned,
        skillCoins: updatedUser.skillCoins
      }
    });

  } catch (error) {
    console.error('💥 Credit update failed:', error);
    
    // Handle specific mongoose errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation error',
        details: error.message 
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: 'Invalid data format',
        details: 'Invalid clerkId or credit amount format'
      });
    }

    res.status(500).json({ 
      error: 'Failed to update credits in database',
      details: error.message 
    });
  }
});

// Verify payment details from Razorpay
router.post('/verify-payment', async (req, res) => {
  try {
    const { paymentId } = req.body;
    
    if (!paymentId) {
      return res.status(400).json({ error: 'Payment ID is required' });
    }
    
    const payment = await razorpay.payments.fetch(paymentId);
    
    res.json({
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        created_at: payment.created_at,
        email: payment.email,
        contact: payment.contact
      }
    });

  } catch (error) {
    console.error('Payment verification failed:', error);
    res.status(500).json({ 
      error: 'Payment verification failed',
      details: error.message 
    });
  }
});

// Get user's current credit balance
router.get('/balance/:clerkId', async (req, res) => {
  try {
    const { clerkId } = req.params;
    
    const user = await User.findOne({ clerkId }, {
      name: 1,
      totalCredits: 1,
      creditEarned: 1,
      creditSpent: 1,
      skillCoins: 1
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      user: {
        name: user.name,
        totalCredits: user.totalCredits,
        creditEarned: user.creditEarned,
        creditSpent: user.creditSpent,
        skillCoins: user.skillCoins
      }
    });
    
  } catch (error) {
    console.error('Balance fetch failed:', error);
    res.status(500).json({ 
      error: 'Failed to fetch balance',
      details: error.message 
    });
  }
});

// Get payment history for a user (if you want to implement this later)
router.get('/history/:clerkId', async (req, res) => {
  try {
    const { clerkId } = req.params;
    
    const user = await User.findOne({ clerkId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      message: 'Payment history endpoint - implement with payment logs if needed',
      user: {
        name: user.name,
        totalCredits: user.totalCredits,
        creditEarned: user.creditEarned,
        creditSpent: user.creditSpent
      }
    });
    
  } catch (error) {
    console.error('History fetch failed:', error);
    res.status(500).json({ 
      error: 'Failed to fetch payment history',
      details: error.message 
    });
  }
});

// Health check for payment system
router.get('/health', async (req, res) => {
  try {
    // Test database connection
    const userCount = await User.countDocuments();
    
    res.json({
      success: true,
      message: 'Payment system is healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        userCount: userCount
      },
      razorpay: {
        configured: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
        keyFormat: process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.substring(0, 12) + '...' : 'missing'
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Payment system health check failed',
      error: error.message
    });
  }
});

export default router;
