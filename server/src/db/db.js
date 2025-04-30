import mongoose from "mongoose"

export const connectDB=async()=>{
    try {
        const conn=await mongoose.connect(process.env.MONGO_URI)
        console.log(`Mongodb connected successfully: ${conn.connection.host}`)
    } catch (error) {
        console.log("Mongodb connection error",error)
    }
}