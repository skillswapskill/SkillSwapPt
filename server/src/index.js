import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db/db.js";
import cors from "cors";
import creditRoutes from './routes/credits.routes.js';
import userRoutes from './routes/user.routes.js';

dotenv.config();

const Port = process.env.PORT || 3000;
const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/credits', creditRoutes);
app.use('/api/users', userRoutes);

app.listen(Port, () => {
  console.log(`We are at Port ${Port}`);
  connectDB();
});
