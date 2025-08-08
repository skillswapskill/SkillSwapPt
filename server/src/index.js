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

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
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
