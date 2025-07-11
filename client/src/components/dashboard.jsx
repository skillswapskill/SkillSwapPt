import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch } from "react-icons/fa";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, isSignedIn } = useUser();
  const navigate = useNavigate();

  const [allUsers, setAllUsers] = useState([]);
  const [treesPlanted, setTreesPlanted] = useState(10000);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null); // 🌟 Popup state

  const syncLoggedInUser = async () => {
    try {
      if (!user?.id) return;
      await axios.post(
        "http://localhost:5000/api/users/sync",
        {
          clerkId: user.id,
          name: user.fullName,
          email: user.primaryEmailAddress?.emailAddress,
          profilePic: user.imageUrl,
        },
        { withCredentials: true }
      );
    } catch (err) {
      console.error("❌ Error syncing logged-in user:", err);
    }
  };

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

  useEffect(() => {
    const interval = setInterval(() => {
      setTreesPlanted((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isSignedIn) {
      syncLoggedInUser();
      fetchAllUsers();
    }
  }, [isSignedIn]);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 5) return "Good Night 🌙";
    if (hour < 12) return "Good Morning 🌅";
    if (hour < 18) return "Good Afternoon 🌇";
    return "Good Evening 🌃";
  };
  const collectSkills = (users) => {
    const skillSet = new Set();

    users.forEach((user) => {
      if (Array.isArray(user.skills)) {
        user.skills.forEach((skill) => {
          if (typeof skill === "string" && skill.trim()) {
            skillSet.add(skill.trim());
          }
        });
      }
    });

    return Array.from(skillSet).sort();
  };
  return (
    <div className="min-h-screen flex flex-col justify-between px-6 py-10 bg-gradient-to-br from-purple-100 via-white to-blue-100">
      {/* Greeting */}
      <br />
      <br />
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
                  src={u.profilePic || "/user.png"}
                  alt={u.name}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setSelectedUser(u)} // 👈 Show popup
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

      {/* 🚀 Popup Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/30 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 shadow-xl w-[90%] max-w-sm relative">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-2 right-3 text-2xl font-bold text-gray-500 hover:text-red-600"
            >
              &times;
            </button>
            <div className="flex flex-col items-center">
              <img
                src={selectedUser.profilePic || "/user.png"}
                alt={selectedUser.name}
                className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-blue-500"
              />
              <h2 className="text-xl font-semibold text-blue-800 mb-2">
                {selectedUser.name}
              </h2>
              {/* 🧠 Skills Display */}
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {selectedUser.skills && selectedUser.skills.length > 0 ? (
                  selectedUser.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full shadow-sm"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No skills listed</p>
                )}
              </div>
              <button
                onClick={() => navigate("/profileclicked")}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
              >
                View Full Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
