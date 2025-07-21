import {Session} from "../models/session.model.js";
import {User} from "../models/user.model.js"

export const subscribeToSession=async (req,res)=>{
    try {
        
        Session.subscribed=true;
    } catch (error) {
        // Basic error handling skeleton
        console.error("Subscription error:", error);
        return res.status(500).json({ message: "Server error" });
    }
}