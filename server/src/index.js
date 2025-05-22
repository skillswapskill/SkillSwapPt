import express from "express"
import dotenv from "dotenv"
import {connectDB} from "./db/db.js"
import cors from "cors"
import creditRoutes from './routes/credit.routes.js';


dotenv.config()

const Port=process.env.PORT||300
const app=express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use('/api/credits', creditRoutes);

app.listen(Port,()=>{
    console.log(`We are at Port ${Port}`)
    connectDB();
})