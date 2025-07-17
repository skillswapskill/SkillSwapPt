import express from "express";
import { Session } from "../models/session.model.js";

const router=express.Router();

//offer sevice route
router.post("/offer",async(req,res)=>{
    const {teacher,skill,creditsUsed}=req.body;


    if(!teacher||!skill||!creditsUsed){
        return res.status(400).json({message:"Fileds not found"});
    }

    try {
        const session=await Session.create({
            teacher,
            skill,
            creditsUsed,
            type:"Service",
            subscribed:false
        });
        res.status(201).json({message:"Service added successfully",session})
        
    } catch (error) {
        console.error("Failed to offer session:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})
router.get("/offered/:userId",async(req,res)=>{
    const {userId}=req.params;
    try{
        const sessions=await Session.find({teacher:userId});
        res.json(sessions);
    }catch (err) {
    console.error("Failed to fetch offered sessions", err);
    res.status(500).json({ message: "Failed to fetch" });
  }
})
router.get("/my-services/:teacherId", async (req, res) => {
  const { teacherId } = req.params;
  try {
    const sessions = await Session.find({ teacher: teacherId });
    const formatted = sessions.map(s => ({
      name: s.skill,
      credits: s.creditsUsed
    }));
    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:teacherId",async(req,res)=>{
  const {teacherId}=req.params;

  try {
    const sessions=await Session.find({teacher:teacherId})
    res.status(200).json(sessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ message: "Failed to fetch sessions" });
  }
})



export default router;
