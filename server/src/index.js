import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db/db.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Route handlers
import creditRoutes from './routes/credits.routes.js';
import userRoutes from './routes/user.routes.js';
import sessionRoutes from "./routes/session.route.js";
import clerkRoutes from "./routes/clerk.routes.js";

// __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Dynamic CORS Configuration
const allowedOrigins = [
  "http://localhost:5173",
  "https://skillswappt.onrender.com"
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

app.use(cors(corsOptions));
app.use(express.json());

// API Routes
app.use("/api/credits", creditRoutes);
app.use("/api/users", userRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/clerk", clerkRoutes);

// --- PRODUCTION STATIC FILES ---
if (process.env.NODE_ENV === "production") {
  const clientDistPath = path.join(__dirname, "../../client/dist"); // ✅ correct relative path from server/src/index.js
  app.use(express.static(clientDistPath));

  // Wildcard route for SPA
  app.get("/{*any}", (req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on Port ${PORT}`);
  connectDB();
});
