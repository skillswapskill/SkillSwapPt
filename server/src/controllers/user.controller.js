import { User } from "../models/user.model.js";

export const handleClerkWebhook = async (req, res) => {
  try {
    const { id, email_addresses, first_name, last_name } = req.body.data;

    const email = email_addresses?.[0]?.email_address || "";

    const existingUser = await User.findOne({ clerkId: id });

    if (existingUser) {
      return res.status(200).json({ message: "User already exists" });
    }

    const newUser = new User({
      name: `${first_name} ${last_name}`,
      email,
      clerkId: id,
      password: "external-auth", // Dummy value since password isn't stored via Clerk
    });

    await newUser.save();
    res.status(201).json({ message: "User created", user: newUser });
  } catch (error) {
    console.error("Webhook Error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};
