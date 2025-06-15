import express from "express";
import { handleClerkWebhook } from "../controllers/user.controller.js";
import { User } from "../models/user.model.js";

const router = express.Router();

// POST /api/users/webhook
router.post("/webhook", handleClerkWebhook);

router.post("/sync",async(req,res)=>{//here /sync is an end point
    const {clerkId,name,email}=req.body;

    try {
        let user=await User.findOne({clerkId});

        if(!user){
            //first time login
            user=await User.create({
                name,
                clerkId,
                email,
                totalCredits:300,
                firstLoginRewarded:true,
            });

            return res.status(201).json({
                message:"new user",
                totalCredits:300,
                showCongrats:true,
            });

        }
        res.status(200).json({
            message:"existing user",
            totalCredits:user.totalCredits,
            showCongrats:false,
        })
    } catch (err) {
        console.error("Error in /sync:", err);
        res.status(500).json({ message: "Server Error" });
    }


});

export default router;
