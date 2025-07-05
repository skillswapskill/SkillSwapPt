import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch } from "react-icons/fa";
import { useUser } from "@clerk/clerk-react";


const Dashboard = () => {
  const { user, isSignedIn } = useUser();
  // console.log("Clerk User:", user);

  const [allUsers, setAllUsers] = useState([]);
  const [treesPlanted, setTreesPlanted] = useState(10000);
  const [search, setSearch] = useState("");
  // const { user, isSignedIn } = useUser();

  const userInfo = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/users/setup-complete", {
      params: { clerkId: user?.id },
      withCredentials: true,
    });
    console.log(res.data);
  } catch (err) {
    console.error("Error fetching setup info:", err);
  }
};

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users/all", {
          withCredentials: true,
        });
        setAllUsers(res.data.users);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTreesPlanted((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning 🌅 ";
    else if (hour < 18) return "Good Afternoon 🌇";
    else return "Good Evening 🌃";
  };

  return (
    <div className="min-h-screen flex flex-col justify-between px-6 py-10 bg-gradient-to-br from-purple-100 via-white to-blue-100">
      {/* Greeting and Search */}
      <br></br>
      <br></br>
      <div>
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-700">
          {getTimeGreeting()}, {user?.firstName || "Sir"}

        </h1>

        {/* Centered Search Bar */}
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

        {/* Circular Avatars */}
        <div className="flex flex-wrap justify-center gap-9">
          {allUsers.map((u, idx) => (
            <div
              key={idx}
              className="w-20 h-20 rounded-full bg-#1212 shadow-md flex items-center justify-center hover:scale-110 transition"
            >
              <button className="text-sm font-semibold text-center px-6 text-blue-500" onClick={userInfo}>
                {u.name.split(" ")[0]}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Live Tree Counter */}
      <div className="text-center text-green-800 mt-12">
        <p className="text-lg font-medium">Number of Trees Planted 🌱</p>
        <p className="text-3xl font-bold">{treesPlanted.toLocaleString()}</p>
      </div>
    </div>
  );
};

export default Dashboard;
