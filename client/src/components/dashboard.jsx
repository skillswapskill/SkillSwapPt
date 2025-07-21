import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch } from "react-icons/fa";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

// Sun/moon illustrations: Visible on left background, time-based
const scenes = {
  morning: (
    <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute left-0 top-1/4 z-10 pointer-events-none select-none" style={{ opacity: 0.85 }}>
      <defs>
        <radialGradient id="sunrise" cx="0.5" cy="0.5" r="0.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFD700" stopOpacity="1" />
          <stop offset="1" stopColor="#FF8C00" stopOpacity="0.5" />
        </radialGradient>
      </defs>
      <circle cx="150" cy="150" r="120" fill="url(#sunrise)" />
    </svg>
  ),
  afternoon: (
    <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute left-0 top-1/4 z-10 pointer-events-none select-none" style={{ opacity: 0.85 }}>
      <defs>
        <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFEF8E" stopOpacity="1" />
          <stop offset="1" stopColor="#FFCD69" stopOpacity="0.5" />
        </radialGradient>
      </defs>
      <circle cx="150" cy="150" r="120" fill="url(#sun)" />
    </svg>
  ),
  evening: (
    <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute left-0 top-1/4 z-10 pointer-events-none select-none" style={{ opacity: 0.85 }}>
      <defs>
        <radialGradient id="sunset" cx="0.5" cy="0.5" r="0.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F9CB89" stopOpacity="1" />
          <stop offset="1" stopColor="#F79FA5" stopOpacity="0.5" />
        </radialGradient>
      </defs>
      <circle cx="150" cy="150" r="120" fill="url(#sunset)" />
    </svg>
  ),
  night: (
    <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute left-0 top-1/4 z-10 pointer-events-none select-none" style={{ opacity: 0.85 }}>
      <defs>
        <radialGradient id="moonGlow" cx="0.5" cy="0.5" r="0.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FCEEEE" stopOpacity="1" />
          <stop offset="1" stopColor="#EFEAF1" stopOpacity="0.5" />
        </radialGradient>
      </defs>
      <circle cx="150" cy="150" r="120" fill="url(#moonGlow)" />
    </svg>
  ),
};

const Dashboard = () => {
  const { user, isSignedIn } = useUser();
  const navigate = useNavigate();

  const [allUsers, setAllUsers] = useState([]);
  const [treesPlanted, setTreesPlanted] = useState(10000);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const [selectedClerkData, setSelectedClerkData] = useState(null);

  // Time logic: Night after 8 PM
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 5 || hour >= 20) return "night";
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  };

  useEffect(() => {
    const fetchClerkData = async () => {
      if (!selectedUser?.clerkId) return;
      try {
        const res = await axios.get(
          `http://localhost:5000/api/clerk/user/${selectedUser.clerkId}`
        );
        setSelectedClerkData(res.data);
      } catch (err) {
        console.error("❌ Error fetching Clerk user data:", err);
      }
    };
    fetchClerkData();
  }, [selectedUser]);

  const getProfilePic = (userObj) => {
    if (!userObj) return "/user.png";
    if (userObj.profile_image_url) return userObj.profile_image_url;
    if (userObj.external_accounts && Array.isArray(userObj.external_accounts)) {
      for (const account of userObj.external_accounts) {
        if (account.avatar_url) return account.avatar_url;
        if (account.image_url) return account.image_url;
      }
    }
    if (userObj.image_url) return userObj.image_url;
    if (userObj.profilePic) return userObj.profilePic;
    return "/user.png";
  };

  const syncLoggedInUser = async () => {
    try {
      if (!user?.id) return;
      const profilePic = getProfilePic(user);
      await axios.post(
        "http://localhost:5000/api/users/sync",
        {
          clerkId: user.id,
          name: user.fullName,
          email: user.primaryEmailAddress?.emailAddress,
          profilePic: profilePic,
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
    if (hour < 5 || hour >= 20) return "Good Night 🌙";
    if (hour < 12) return "Good Morning 🌅";
    if (hour < 18) return "Good Afternoon 🌇";
    return "Good Evening 🌃";
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between px-6 py-10 bg-gradient-to-br from-purple-100 via-white to-blue-100 overflow-hidden">
      {/* Dynamic Sun/Moon Background */}
      <div className="hidden md:block">{scenes[getTimeOfDay()]}</div>

      <br />
      <br />
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-700 relative z-20">
        {getTimeGreeting()}, {user?.firstName || "Learner"}
      </h1>

      <div className="flex justify-center mb-12 z-20 relative">
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

      <div className="flex flex-wrap justify-center gap-9 relative z-20">
        {allUsers
          .filter(
            (u) =>
              (u.name && u.name.toLowerCase().includes(search.toLowerCase())) ||
              (u.skills &&
                u.skills.some((skill) =>
                  skill.toLowerCase().includes(search.toLowerCase())
                ))
          )
          .map((u, idx) => (
            <div key={idx} className="flex flex-col items-center w-24">
              <div
                className="w-20 h-20 rounded-full overflow-hidden shadow-md hover:scale-110 transition border border-blue-300"
                title={u.name}
              >
                <img
                  src={getProfilePic(u)}
                  alt={u.name}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setSelectedUser(u)}
                />
              </div>
              <p className="mt-2 text-sm text-center font-medium text-blue-800 truncate max-w-[5rem]">
                {u.name}
              </p>
            </div>
          ))}
      </div>

      <div className="text-center text-green-800 mt-12 relative z-20">
        <p className="text-lg font-medium">Number of Trees Planted 🌱</p>
        <p className="text-3xl font-bold">{treesPlanted.toLocaleString()}</p>
      </div>

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
                src={getProfilePic(selectedUser)}
                alt={selectedUser.name}
                className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-blue-500"
              />
              <h2 className="text-xl font-semibold text-blue-800 mb-2">
                {selectedUser.name}
              </h2>
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
                onClick={() =>
                  navigate("/profileclicked", { state: { selectedUser } })
                }
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
