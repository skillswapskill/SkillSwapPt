import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db/db.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";

// Import the suspicious activity controller
import SuspiciousActivityController from './controllers/suspiciousActivityController.controller.js';

// Route handlers
import creditRoutes from './routes/credits.routes.js';
import userRoutes from './routes/user.routes.js';
import sessionRoutes from "./routes/session.route.js";
import clerkRoutes from "./routes/clerk.routes.js";
import notificationRoutes from './routes/notification.route.js';
import challengeRoutes from './routes/challenge.routes.js';
import paymentRoutes from './routes/payment.route.js';
import communityRoutes from './routes/community.route.js';

// __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server for Socket.io
const server = createServer(app);

// Dynamic CORS Configuration
const allowedOrigins = [
  "http://localhost:5173",
  "https://skillswap.company", 
  "http://localhost:8081",
  "http://172.16.75.25:8081"
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

// Initialize Socket.io with same CORS settings
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Increased limit for evidence frames
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve ML models (add this new route for serving models)
app.use('/models', express.static(path.join(__dirname, '../models/ml')));

// API Routes
app.use("/api/credits", creditRoutes);
app.use("/api/users", userRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/clerk", clerkRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api', notificationRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/community', communityRoutes);


// --- SOCKET.IO INTEGRATION FOR SUSPICIOUS ACTIVITY ---
const suspiciousActivityController = new SuspiciousActivityController(io);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`👤 User connected: ${socket.id}`);

  // Join user to their session room for targeted messaging
  socket.on('join-session', ({ sessionId, userId }) => {
    if (sessionId && userId) {
      socket.join(sessionId);
      socket.userId = userId;
      socket.sessionId = sessionId;
      console.log(`🏠 User ${userId} joined session ${sessionId}`);
    }
  });

  // Handle suspicious activity detection from client
  socket.on('suspicious-activity-detected', async (data) => {
    try {
      console.log(`🚨 Suspicious activity detected in session ${data.sessionId}`);
      await suspiciousActivityController.handleSuspiciousActivity(socket, data);
    } catch (error) {
      console.error('❌ Error in suspicious activity handler:', error);
      socket.emit('error', { 
        type: 'suspicious-activity-error',
        message: 'Failed to process suspicious activity detection',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Handle session end - clean up warning counts
  socket.on('session-ended', ({ sessionId, userId }) => {
    if (sessionId) {
      suspiciousActivityController.clearSessionWarnings(sessionId);
      socket.leave(sessionId);
      console.log(`🔚 Session ${sessionId} ended by user ${userId}`);
    }
  });

  // Handle manual session leave
  socket.on('leave-session', ({ sessionId, userId }) => {
    if (sessionId) {
      socket.leave(sessionId);
      console.log(`🚪 User ${userId} left session ${sessionId}`);
    }
  });

  // Handle video call events (integrate with your existing ZegoCloud setup)
  socket.on('video-call-started', ({ sessionId, userId }) => {
    socket.join(`video-${sessionId}`);
    console.log(`📹 Video call started for session ${sessionId}`);
  });

  socket.on('video-call-ended', ({ sessionId, userId }) => {
    socket.leave(`video-${sessionId}`);
    suspiciousActivityController.clearSessionWarnings(sessionId);
    console.log(`📹 Video call ended for session ${sessionId}`);
  });

  // Handle user disconnect
  socket.on('disconnect', (reason) => {
    const { userId, sessionId } = socket;
    console.log(`👋 User ${userId || socket.id} disconnected from session ${sessionId || 'unknown'}, reason: ${reason}`);
    
    // Clean up if user was in a session
    if (sessionId) {
      socket.leave(sessionId);
    }
  });

  // General error handling
  socket.on('error', (error) => {
    console.error(`❌ Socket error for ${socket.id}:`, error);
  });
});

// --- PRODUCTION STATIC FILES ---
if (process.env.NODE_ENV === "production") {
  const clientDistPath = path.join(__dirname, "../../client/dist");
  app.use(express.static(clientDistPath));

  // Wildcard route for SPA
  app.get("/*splat", (req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  io.close(() => {
    console.log('✅ Socket.io server closed');
    server.close(() => {
      console.log('✅ HTTP server closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  io.close(() => {
    console.log('✅ Socket.io server closed');
    server.close(() => {
      console.log('✅ HTTP server closed');
      process.exit(0);
    });
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server is running on Port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Socket.io initialized for suspicious activity monitoring`);
  connectDB();
});

// Export for testing or external use
export { io, suspiciousActivityController };
