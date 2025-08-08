import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db/db.js";
import cors from "cors";
import creditRoutes from './routes/credits.routes.js';
import userRoutes from './routes/user.routes.js';
import sessionRoutes from "./routes/session.route.js"
import clerkRoutes from "./routes/clerk.routes.js"
import path from 'path';


const __dirname=path.resolve();

dotenv.config();

const Port = process.env.PORT || 3000;
const app = express();

const allowedOrigins = [
  'http://localhost:5173',          // Your local dev frontend
  'https://skillsswap.onrender.com'  // Your production frontend URL
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests if the origin is in our whitelist or if there's no origin (e.g., Postman)
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

app.use('/api/credits', creditRoutes);
app.use('/api/users', userRoutes);
app.use("/api/sessions",sessionRoutes);
app.use("/api/clerk", clerkRoutes);
app.use('/uploads', express.static('uploads'));

if(process.env.NODE_ENV==="production"){
    app.use(express.static(path.join(__dirname,"../client/dist")));

    app.get('/{*any}',(req,res)=>{
        res.sendFile(path.join(__dirname,"../client","dist","index.html"));
    })
}




app.listen(Port, () => {
  console.log(`We are at Port ${Port}`);
  connectDB();
});
