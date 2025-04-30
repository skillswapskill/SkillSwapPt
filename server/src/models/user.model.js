import mongoose from "mongoose"

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    creditEarned: { type: Number, default: 0 },
    creditSpent: { type: Number, default: 0 },
    totalCredits: { type: Number, default: 100 }, // Initial credits
    clerkId: {
        type: String,
        required: true,
        unique: true,
      },

},{timestamps:true})

export const User=mongoose.model("User",userSchema);
