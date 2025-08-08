// In server/src/index.js

import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db/db.js";
import cors from "cors";
import path from 'path';

// Route handlers
import creditRoutes from './routes/credits.routes.js';
import userRoutes from './routes/user.routes.js';
import sessionRoutes from "./routes/session.route.js";
import clerkRoutes from "./routes/clerk.routes.js";

const __dirname = path.resolve();

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Dynamic CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'https://skillswappt.onrender.com/'
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// API Routes
app.use('/api/credits', creditRoutes);
app.use('/api/users', userRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/clerk", clerkRoutes);

// --- PRODUCTION-ONLY MIDDLEWARE ---
if (process.env.NODE_ENV === "production") {
    // --- CORRECTED PATH: Goes up two directories to the project root ---
    const clientDistPath = path.join(__dirname, "../../client/dist");
    app.use(express.static(clientDistPath));
    // --------------------------------------------------------------------

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, "../../client", "dist", "index.html"));
    });
}

app.listen(PORT, () => {
  console.log(`Server is running on Port ${PORT}`);
  connectDB();
});