import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch } from "react-icons/fa";
import { useUser } from "@clerk/clerk-react";

const Dashboard = () => {
  const { user, isSignedIn } = useUser();

  const [allUsers, setAllUsers] = useState([]);
  const [treesPlanted, setTreesPlanted] = useState(10000);
  const [search, setSearch] = useState("");

  // ✅ Sync logged-in user to backend (with profilePic!)
  const syncLoggedInUser = async () => {
    try {
      if (!user?.id) return;

      await axios.post(
        "http://localhost:5000/api/users/sync",
        {
          clerkId: user.id,
          name: user.fullName,
          email: user.primaryEmailAddress?.emailAddress,
          profilePic: user.imageUrl, // 🔥 IMPORTANT FIX
        },
        { withCredentials: true }
      );
    } catch (err) {
      console.error("❌ Error syncing logged-in user:", err);
    }
  };

  // ✅ Get all users
  const fetchAllUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users/all", {
        withCredentials: true,
      });
      setAllUsers(res.data.users || []);
    } catch (err) {
      console.error("❌ Error fetching users:", err);
    }
  };

  // 🌱 Tree counter
  useEffect(() => {
    const interval = setInterval(() => {
      setTreesPlanted((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ✅ On load, sync and fetch
  useEffect(() => {
    if (isSignedIn) {
      syncLoggedInUser();
      fetchAllUsers();
    }
  }, [isSignedIn]);

  // 🌞 Time greeting
  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 5) return "Good Night 🌙";
    if (hour < 12) return "Good Morning 🌅";
    if (hour < 18) return "Good Afternoon 🌇";
    return "Good Evening 🌃";
  };

  return (
    <div className="min-h-screen flex flex-col justify-between px-6 py-10 bg-gradient-to-br from-purple-100 via-white to-blue-100">
      {/* Greeting */}
      <br></br>
      <br></br>
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-700">
        {getTimeGreeting()}, {user?.firstName || "Learner"}
      </h1>

      {/* Search Bar */}
      <div className="flex justify-center mb-12">
        <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-md w-full max-w-md">
          <FaSearch className="text-blue-700 mr-3" />
          <input
            type="text"
            placeholder="Dive into your Skills"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="outline-none w-full bg-transparent text-blue-700"
          />
        </div>
      </div>

      {/* User Avatars */}
      <div className="flex flex-wrap justify-center gap-9">
        {allUsers
          .filter((u) => u.name.toLowerCase().includes(search.toLowerCase()))
          .map((u, idx) => (
            <div key={idx} className="flex flex-col items-center w-24">
              <div
                className="w-20 h-20 rounded-full overflow-hidden shadow-md hover:scale-110 transition border border-blue-300"
                title={u.name}
              >
                <img
                  src={u.profilePic || "/user.png"} // fallback image
                  alt={u.name}
                  className="w-full h-full object-cover cursor-pointer"
                />
              </div>
              <p className="mt-2 text-sm text-center font-medium text-blue-800 truncate max-w-[5rem]">
                {u.name}
              </p>
            </div>
          ))}
      </div>

      {/* Tree Counter */}
      <div className="text-center text-green-800 mt-12">
        <p className="text-lg font-medium">Number of Trees Planted 🌱</p>
        <p className="text-3xl font-bold">{treesPlanted.toLocaleString()}</p>
      </div>
    </div>
  );
};

export default Dashboard;
